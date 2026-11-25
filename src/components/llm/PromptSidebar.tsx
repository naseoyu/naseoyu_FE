import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  RotateCcw,
  FileText,
  Loader2,
  AlertCircle,
  PanelLeftClose,
  PanelLeftOpen,
  CornerDownLeft,
  Sparkles,
  Check,
  RefreshCw,
  GripVertical,
} from 'lucide-react';
import {
  ServicePage,
  UploadedDataCenterDoc,
  CustomAnalysisResult,
  PromptChatMessage,
  AidcProjectSpecs,
} from '../../types';

interface PromptSidebarProps {
  currentPage: ServicePage;
  uploadedDocs: UploadedDataCenterDoc[];
  analysisRequest: string;
  aidcSpecs?: AidcProjectSpecs;
  analysisResult: CustomAnalysisResult | null;
  messages: PromptChatMessage[];
  onAddMessage: (msg: PromptChatMessage) => void;
  onClearMessages: () => void;
  onApplyRequest: (requestText: string, runAnalysis?: boolean) => void;
}

const QUICK_PROMPTS = [
  '3년치 데이터만 추려서 비용 추이를 분석해줘',
  '전력료와 냉각 비용 중점으로 절감 포인트를 알려줘',
  '감가상각비 제외 실질 운영비(OPEX)만 요약해줘',
  '업로드한 서류들의 주요 비용 항목을 비교해줘',
];

const DEFAULT_SIDEBAR_WIDTH = 360;
const MIN_SIDEBAR_WIDTH = 280;
const MAX_SIDEBAR_WIDTH = 680;

export const PromptSidebar: React.FC<PromptSidebarProps> = ({
  currentPage,
  uploadedDocs,
  analysisRequest,
  aidcSpecs,
  analysisResult,
  messages,
  onAddMessage,
  onClearMessages,
  onApplyRequest,
}) => {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);
  const [appliedMessageId, setAppliedMessageId] = useState<string | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState<number>(DEFAULT_SIDEBAR_WIDTH);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef<{ startX: number; startWidth: number } | null>(null);

  useEffect(() => {
    if (!isResizing) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!dragStateRef.current) return;
      const delta = e.clientX - dragStateRef.current.startX;
      const dynamicMax = Math.min(
        MAX_SIDEBAR_WIDTH,
        Math.max(MIN_SIDEBAR_WIDTH, Math.floor(window.innerWidth * 0.55))
      );
      const nextWidth = Math.min(
        dynamicMax,
        Math.max(MIN_SIDEBAR_WIDTH, dragStateRef.current.startWidth + delta)
      );
      setSidebarWidth(nextWidth);
    };

    const handlePointerUp = () => {
      dragStateRef.current = null;
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [isResizing]);

  const handleStartResize = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragStateRef.current = {
      startX: e.clientX,
      startWidth: sidebarWidth,
    };
    setIsResizing(true);
  };

  const handleResizeKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const dynamicMax = Math.min(
      MAX_SIDEBAR_WIDTH,
      Math.max(MIN_SIDEBAR_WIDTH, Math.floor(window.innerWidth * 0.55))
    );
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSidebarWidth((w) => Math.min(dynamicMax, w + 20));
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSidebarWidth((w) => Math.max(MIN_SIDEBAR_WIDTH, w - 20));
    }
  };

  const pageLabel =
    currentPage === 'upload'
      ? '서류 업로드'
      : currentPage === 'analysis_loading'
      ? 'LLM 분석'
      : '비용 분석 결과';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const sendPrompt = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || isSending) return;

    setLastFailedPrompt(null);
    const userMsg: PromptChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };
    onAddMessage(userMsg);
    setInput('');
    setIsSending(true);

    try {
      const historyPayload = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: historyPayload,
          documents: uploadedDocs.map((d) => ({
            id: d.id,
            name: d.name,
            sizeBytes: d.sizeBytes,
            pageCount: d.pageCount,
            sourceType: d.sourceType,
            documentSummary: d.documentSummary,
            base64Data: d.base64Data,
          })),
          analysisRequest,
          aidcSpecs,
          analysisResult,
          currentPage: pageLabel,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLastFailedPrompt(trimmed);
        onAddMessage({
          id: `err-${Date.now()}`,
          role: 'error',
          content: data.error || 'LLM 응답을 가져오는 중 오류가 발생했습니다.',
          timestamp: new Date(),
        });
        return;
      }

      onAddMessage({
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
      });
    } catch (err) {
      setLastFailedPrompt(trimmed);
      onAddMessage({
        id: `err-${Date.now()}`,
        role: 'error',
        content:
          err instanceof Error
            ? `네트워크 오류: ${err.message}`
            : '서버와의 통신에 실패했습니다.',
        timestamp: new Date(),
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendPrompt(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendPrompt(input);
    }
  };

  const handleApplyFromMessage = (msgId: string, promptContent: string, runAnalysis: boolean) => {
    onApplyRequest(promptContent, runAnalysis);
    setAppliedMessageId(msgId);
    setTimeout(() => setAppliedMessageId(null), 2000);
  };

  // Find preceding user message for an assistant message so user can apply that prompt to the main analysis
  const getPrecedingUserPrompt = (index: number): string | null => {
    for (let i = index - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        return messages[i].content;
      }
    }
    return null;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white">
      {/* Sidebar Header */}
      <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3 shrink-0">
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-[#172033] truncate">
            LLM 분석 프롬프트
          </h2>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5 tabular-nums">
            <span>서류 {uploadedDocs.length}건</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{pageLabel} 단계</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={onClearMessages}
              className="p-2 text-slate-500 hover:text-[#172033] hover:bg-slate-100 rounded-[8px] transition-colors cursor-pointer"
              title="대화 내역 초기화"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 text-slate-500 hover:text-[#172033] hover:bg-slate-100 rounded-[8px] transition-colors cursor-pointer"
            title="프롬프트 창 닫기"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Context Strip */}
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 text-xs shrink-0 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span className="font-semibold text-slate-700">연결된 분석 컨텍스트</span>
          <span className="tabular-nums font-mono">{uploadedDocs.length} PDF</span>
        </div>

        {uploadedDocs.length > 0 ? (
          <div className="space-y-1 max-h-20 overflow-y-auto">
            {uploadedDocs.map((doc, idx) => (
              <div
                key={doc.id}
                className="flex items-center gap-1.5 text-[11px] text-slate-600 truncate"
              >
                <FileText className="w-3 h-3 text-[#2563EB] shrink-0" />
                <span className="font-mono text-slate-400 shrink-0">
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <span className="truncate font-medium text-slate-800">{doc.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-slate-400">
            서류를 업로드하면 문서 내용을 참조해 답변합니다.
          </p>
        )}

        {analysisRequest.trim() && (
          <div className="pt-1.5 border-t border-slate-200/80 text-[11px] text-slate-600">
            <span className="font-semibold text-[#2563EB]">적용 요청: </span>
            <span className="line-clamp-2">{analysisRequest}</span>
          </div>
        )}

        {aidcSpecs &&
          (aidcSpecs.commencementDate ||
            aidcSpecs.usageDuration ||
            aidcSpecs.gpuSystemType ||
            aidcSpecs.storageCapacity ||
            aidcSpecs.diaBandwidth) && (
            <div className="pt-1.5 border-t border-slate-200/80 text-[11px] text-slate-600 space-y-0.5">
              <span className="font-semibold text-slate-700 block">AIDC 입력 조건</span>
              <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-slate-500">
                {aidcSpecs.commencementDate && <span>가동: {aidcSpecs.commencementDate}</span>}
                {aidcSpecs.usageDuration && <span>기간: {aidcSpecs.usageDuration}</span>}
                {aidcSpecs.gpuSystemType && <span>GPU: {aidcSpecs.gpuSystemType}</span>}
                {aidcSpecs.storageCapacity && <span>Storage: {aidcSpecs.storageCapacity}</span>}
                {aidcSpecs.diaBandwidth && <span>DIA: {aidcSpecs.diaBandwidth}</span>}
              </div>
            </div>
          )}
      </div>

      {/* Conversation Scroll Area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="space-y-4">
            <div className="p-4 rounded-[10px] bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
              <p className="font-semibold text-[#172033] mb-1">
                언제든 LLM에게 분석을 요청하세요
              </p>
              <p>
                서류 업로드, LLM 분석, 비용 분석 결과 어느 화면에서든 원하는 기간·비용 항목 조건을 질문하거나 분석 지시를 내릴 수 있습니다.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-slate-500">
                자주 쓰는 분석 프롬프트
              </p>
              <div className="space-y-1.5">
                {QUICK_PROMPTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendPrompt(q)}
                    className="w-full text-left px-3 py-2.5 text-xs text-slate-700 bg-white border border-slate-200 rounded-[8px] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors cursor-pointer leading-snug"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => {
              if (msg.role === 'user') {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-[88%] px-3.5 py-2.5 rounded-[10px] bg-[#172033] text-white text-xs leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </div>
                );
              }

              if (msg.role === 'error') {
                return (
                  <div
                    key={msg.id}
                    className="p-3.5 rounded-[10px] bg-red-50 border border-red-200 text-xs text-red-700 space-y-2"
                  >
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                      <p className="leading-relaxed">{msg.content}</p>
                    </div>
                    {lastFailedPrompt && (
                      <button
                        type="button"
                        onClick={() => sendPrompt(lastFailedPrompt)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-red-700 bg-white border border-red-200 rounded-[6px] hover:bg-red-100/50 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>다시 시도</span>
                      </button>
                    )}
                  </div>
                );
              }

              const precedingPrompt = getPrecedingUserPrompt(idx);
              const isApplied = appliedMessageId === msg.id;

              return (
                <div key={msg.id} className="space-y-1.5">
                  <div className="p-3.5 rounded-[10px] bg-slate-50 border border-slate-200 text-xs text-[#172033] leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </div>
                  {precedingPrompt && (
                    <div className="flex items-center gap-2 pl-1">
                      <button
                        type="button"
                        onClick={() =>
                          handleApplyFromMessage(msg.id, precedingPrompt, false)
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-600 bg-white border border-slate-200 rounded-[6px] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors cursor-pointer whitespace-nowrap"
                      >
                        {isApplied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>반영됨</span>
                          </>
                        ) : (
                          <span>분석 요청사항에 반영</span>
                        )}
                      </button>
                      {uploadedDocs.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            handleApplyFromMessage(msg.id, precedingPrompt, true)
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-[#2563EB] bg-blue-50 border border-blue-200 rounded-[6px] hover:bg-blue-100 transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>이 조건으로 재분석</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {isSending && (
              <div className="p-3.5 rounded-[10px] bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 text-[#2563EB] animate-spin shrink-0" />
                <span>문서와 요청 조건을 바탕으로 응답을 생성하고 있습니다...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Prompt Input Dock */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-slate-200 bg-white shrink-0 space-y-2.5"
      >
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            placeholder="예: 3년치만 분석해줘, 전력료 중점으로 분석해줘..."
            className="w-full px-3.5 py-2.5 text-xs text-[#172033] bg-slate-50 border border-slate-200 rounded-[10px] resize-none focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] placeholder:text-slate-400 leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <CornerDownLeft className="w-3 h-3" />
            <span>Enter 전송 · Shift+Enter 줄바꿈</span>
          </span>

          <div className="flex items-center gap-1.5">
            {input.trim() && uploadedDocs.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  const text = input.trim();
                  setInput('');
                  onApplyRequest(text, true);
                }}
                className="px-3 py-2 text-[11px] font-semibold text-[#2563EB] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-[8px] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                title="입력한 프롬프트를 분석 요청사항으로 적용하고 전체 분석을 실행합니다"
              >
                맞춤 분석 실행
              </button>
            )}
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-[8px] transition-colors whitespace-nowrap shrink-0 ${
                input.trim() && !isSending
                  ? 'bg-[#2563EB] text-white hover:bg-blue-700 cursor-pointer'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isSending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>전송</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Left Sidebar (Horizontally Resizable, Fixed Viewport Height) */}
      <aside
        style={{ width: `${sidebarWidth}px` }}
        className="hidden lg:flex relative shrink-0 border-r border-slate-200 bg-white h-full z-20 flex-col overflow-hidden"
      >
        {sidebarContent}

        {/* Vertical Drag Handle to Resize Width */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="LLM 프롬프트 창 가로 크기 조절"
          aria-valuemin={MIN_SIDEBAR_WIDTH}
          aria-valuemax={MAX_SIDEBAR_WIDTH}
          aria-valuenow={sidebarWidth}
          tabIndex={0}
          onPointerDown={handleStartResize}
          onDoubleClick={() => setSidebarWidth(DEFAULT_SIDEBAR_WIDTH)}
          onKeyDown={handleResizeKeyDown}
          title="드래그하여 프롬프트 창 가로 크기 조절 (더블클릭 시 기본 크기 복원)"
          className={`group absolute top-0 right-0 bottom-0 w-2 cursor-col-resize z-30 flex items-center justify-center transition-colors focus:outline-none ${
            isResizing ? 'bg-blue-500/20' : 'hover:bg-blue-500/10'
          }`}
        >
          <div
            className={`w-[3px] h-12 rounded-full transition-colors flex items-center justify-center ${
              isResizing
                ? 'bg-[#2563EB]'
                : 'bg-slate-300 group-hover:bg-[#2563EB]'
            }`}
          />
          <GripVertical
            className={`w-3 h-3 absolute pointer-events-none transition-opacity ${
              isResizing
                ? 'opacity-100 text-[#2563EB]'
                : 'opacity-0 group-hover:opacity-100 text-[#2563EB]'
            }`}
          />
        </div>

        {isResizing && (
          <div className="absolute top-3 right-3 z-40 px-2 py-0.5 rounded-[6px] bg-[#172033] text-white text-[10px] font-mono tabular-nums pointer-events-none shadow-sm">
            {sidebarWidth}px
          </div>
        )}
      </aside>

      {/* Mobile / Tablet Floating Launcher & Slide-over Drawer */}
      <div className="lg:hidden">
        {!mobileOpen && (
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="fixed bottom-5 left-5 z-40 flex items-center gap-2 px-4 py-3 text-xs font-semibold text-white bg-[#172033] hover:bg-[#2563EB] rounded-[12px] shadow-lg transition-colors cursor-pointer"
          >
            <PanelLeftOpen className="w-4 h-4" />
            <span>LLM 프롬프트 창</span>
          </button>
        )}

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-slate-900/40"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="relative w-full max-w-[360px] h-full bg-white shadow-2xl z-10 flex flex-col">
              {sidebarContent}
            </aside>
          </div>
        )}
      </div>
    </>
  );
};
