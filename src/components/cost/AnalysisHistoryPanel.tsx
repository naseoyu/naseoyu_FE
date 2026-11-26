import React, { useState, useEffect } from 'react';
import {
  History,
  GitCompareArrows,
  FileText,
  Trash2,
  Eye,
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  NotebookPen,
  CheckCircle2,
} from 'lucide-react';
import {
  AnalysisHistoryEntry,
} from '../../types';

interface AnalysisHistoryPanelProps {
  history: AnalysisHistoryEntry[];
  activeHistoryId: string | null;
  onSelectEntry: (entryId: string) => void;
  onDeleteEntry: (entryId: string) => void;
}

function formatSeq(num: number): string {
  return String(num).padStart(3, '0');
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd} ${hh}:${min}`;
}

export const AnalysisHistoryPanel: React.FC<AnalysisHistoryPanelProps> = ({
  history,
  activeHistoryId,
  onSelectEntry,
  onDeleteEntry,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [showCompare, setShowCompare] = useState<boolean>(false);
  const [leftId, setLeftId] = useState<string>('');
  const [rightId, setRightId] = useState<string>('');

  const prevLengthRef = React.useRef<number>(history.length);

  // Keep comparison pair defaulted to previous vs active/latest when history grows or ids become invalid
  useEffect(() => {
    if (history.length < 2) {
      setShowCompare(false);
      prevLengthRef.current = history.length;
      return;
    }

    const activeIdx = history.findIndex((h) => h.id === activeHistoryId);
    const resolvedRight =
      activeIdx >= 0 ? history[activeIdx] : history[history.length - 1];
    const resolvedLeft =
      activeIdx > 0
        ? history[activeIdx - 1]
        : history[history.length - 2];

    const historyGrew = history.length > prevLengthRef.current;
    prevLengthRef.current = history.length;

    if (historyGrew || !leftId || !history.some((h) => h.id === leftId)) {
      setLeftId(resolvedLeft.id);
    }
    if (historyGrew || !rightId || !history.some((h) => h.id === rightId)) {
      setRightId(resolvedRight.id);
    }
  }, [history, activeHistoryId, leftId, rightId]);

  const handleCompareWithActive = (targetId: string) => {
    if (history.length < 2) return;
    const current =
      history.find((h) => h.id === activeHistoryId) ??
      history[history.length - 1];
    if (current.id === targetId) {
      const other =
        history.find((h) => h.id !== targetId) ?? history[0];
      setLeftId(other.id);
      setRightId(targetId);
    } else {
      setLeftId(targetId);
      setRightId(current.id);
    }
    setIsExpanded(true);
    setShowCompare(true);
  };

  const leftEntry = history.find((h) => h.id === leftId) ?? history[0];
  const rightEntry =
    history.find((h) => h.id === rightId) ?? history[history.length - 1];

  return (
    <section
      id="analysis-history-section"
      className="mb-8 rounded-[12px] bg-white border border-slate-200 overflow-hidden"
    >
      {/* History Section Header */}
      <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-[8px] bg-[#172033] text-white flex items-center justify-center shrink-0">
            <History className="w-4 h-4 text-blue-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#172033]">
                분석 결과 히스토리
              </h2>
              <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-blue-50 text-[#2563EB] border border-blue-200 rounded-[6px] tabular-nums">
                {history.length}건
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              이전 분석 결과와 현재 결과를 비교할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {history.length >= 2 && (
            <button
              type="button"
              onClick={() => {
                setIsExpanded(true);
                setShowCompare((v) => !v);
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-[8px] border transition-colors cursor-pointer whitespace-nowrap ${
                showCompare
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-white text-[#2563EB] border-blue-200 hover:bg-blue-50'
              }`}
            >
              <GitCompareArrows className="w-3.5 h-3.5" />
              <span>{showCompare ? '비교 화면 닫기' : '이전 결과와 비교'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded((v) => !v)}
            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-[8px] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <span>{isExpanded ? '접기' : '펼치기'}</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-6">
          {history.length === 0 ? (
            <div className="p-6 rounded-[10px] bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
              아직 저장된 분석 히스토리가 없습니다.
            </div>
          ) : (
            <>
              {/* Numbered History List: 001, 002... with Title & Memo */}
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-[12px] overflow-hidden">
                {history.map((entry) => {
                  const seqStr = formatSeq(entry.sequenceNumber);
                  const isActive = entry.id === activeHistoryId;

                  return (
                    <div
                      key={entry.id}
                      className={`p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
                        isActive
                          ? 'bg-blue-50/50'
                          : 'bg-white hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        {/* Number Badge: 001, 002... */}
                        <button
                          type="button"
                          onClick={() => onSelectEntry(entry.id)}
                          className={`px-2.5 py-1.5 rounded-[8px] font-mono text-sm font-bold tabular-nums shrink-0 transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-[#2563EB] text-white shadow-2xs'
                              : 'bg-[#172033] text-white hover:bg-[#2563EB]'
                          }`}
                          title={`${seqStr} 결과 대시보드로 불러오기`}
                        >
                          {seqStr}
                        </button>

                        {/* Title + Memo + Meta */}
                        <div className="min-w-0 flex-1 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onSelectEntry(entry.id)}
                              className="text-sm font-bold text-[#172033] hover:text-[#2563EB] text-left truncate cursor-pointer"
                            >
                              {entry.title}
                            </button>

                            {entry.createdAt && (
                              <span className="text-[11px] font-mono text-slate-400 tabular-nums shrink-0">
                                {formatTimestamp(entry.createdAt)}
                              </span>
                            )}

                            {isActive && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold bg-blue-100 text-[#2563EB] rounded-[6px]">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>현재 보기</span>
                              </span>
                            )}
                          </div>

                          {/* Memo Line */}
                          <div
                            className="flex items-start gap-1.5 text-xs text-slate-700 bg-amber-50/70 border border-amber-200/70 rounded-[8px] px-2.5 py-1.5"
                            title="메모"
                          >
                            <NotebookPen
                              className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5"
                              aria-label="메모"
                            />
                            {entry.memo && (
                              <span className="leading-snug break-words">
                                {entry.memo}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Row Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                        {!isActive && (
                          <button
                            type="button"
                            onClick={() => onSelectEntry(entry.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[8px] border bg-white text-slate-700 border-slate-300 hover:border-[#2563EB] hover:text-[#2563EB] transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>결과 보기</span>
                          </button>
                        )}

                        {history.length >= 2 && (
                          <button
                            type="button"
                            onClick={() => handleCompareWithActive(entry.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2563EB] bg-blue-50 border border-blue-200 rounded-[8px] hover:bg-blue-100 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <GitCompareArrows className="w-3.5 h-3.5" />
                            <span>비교</span>
                          </button>
                        )}

                        {history.length > 1 && (
                          <button
                            type="button"
                            onClick={() => onDeleteEntry(entry.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-[8px] hover:border-red-200 transition-colors cursor-pointer"
                            title={`${seqStr} 기록 삭제`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Side-by-Side Comparison Workspace */}
              {showCompare && history.length >= 2 && leftEntry && rightEntry && (
                <div className="p-5 rounded-[12px] bg-slate-50 border border-slate-200 space-y-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <GitCompareArrows className="w-4 h-4 text-[#2563EB]" />
                      <h3 className="text-sm font-bold text-[#172033]">
                        이전 결과 · 현재 결과 비교 보기
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        aria-label="기준(이전) 분석 결과 선택"
                        value={leftEntry.id}
                        onChange={(e) => setLeftId(e.target.value)}
                        className="px-3 py-1.5 text-xs font-semibold text-[#172033] bg-white border border-slate-300 rounded-[8px] focus:outline-none focus:border-[#2563EB]"
                      >
                        {history.map((h) => (
                          <option key={h.id} value={h.id}>
                            {formatSeq(h.sequenceNumber)} · {h.title}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => {
                          setLeftId(rightEntry.id);
                          setRightId(leftEntry.id);
                        }}
                        className="p-1.5 text-slate-500 hover:text-[#2563EB] bg-white border border-slate-200 rounded-[8px] cursor-pointer"
                        title="좌우 바꾸기"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                      </button>

                      <select
                        aria-label="비교(현재) 분석 결과 선택"
                        value={rightEntry.id}
                        onChange={(e) => setRightId(e.target.value)}
                        className="px-3 py-1.5 text-xs font-semibold text-[#172033] bg-white border border-slate-300 rounded-[8px] focus:outline-none focus:border-[#2563EB]"
                      >
                        {history.map((h) => (
                          <option key={h.id} value={h.id}>
                            {formatSeq(h.sequenceNumber)} · {h.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Comparison Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {[
                      { label: '기준 분석 (A)', entry: leftEntry, other: rightEntry },
                      { label: '비교 분석 (B)', entry: rightEntry, other: leftEntry },
                    ].map(({ label, entry, other }, sideIdx) => {
                      const seqStr = formatSeq(entry.sequenceNumber);
                      const otherDocNames = new Set(
                        other.documents.map((d) => d.originalFileName || d.name)
                      );

                      return (
                        <div
                          key={`${entry.id}-${sideIdx}`}
                          className="p-4 sm:p-5 rounded-[12px] bg-white border border-slate-200 space-y-4"
                        >
                          {/* Header: Number + Title + Memo */}
                          <div className="pb-3 border-b border-slate-100 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                {label}
                              </span>
                              <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                                {formatTimestamp(entry.createdAt)}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-[6px] bg-[#172033] text-white font-mono text-xs font-bold tabular-nums">
                                {seqStr}
                              </span>
                              <h4 className="text-sm font-bold text-[#172033] truncate">
                                {entry.title}
                              </h4>
                            </div>

                            <div
                              className="flex items-start gap-1.5 p-2.5 rounded-[8px] bg-amber-50/70 border border-amber-200/80 text-xs text-slate-700"
                              title="메모"
                            >
                              <NotebookPen
                                className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5"
                                aria-label="메모"
                              />
                              {entry.memo && (
                                <span className="leading-snug break-words">
                                  {entry.memo}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Documents Included */}
                          <div>
                            <div className="text-[11px] font-bold text-slate-500 mb-1.5">
                              반영 서류 ({entry.documents.length}건)
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {entry.documents.map((doc) => {
                                const docKey = doc.originalFileName || doc.name;
                                const isDiff = !otherDocNames.has(docKey);
                                return (
                                  <span
                                    key={doc.id}
                                    className={`inline-flex items-center gap-1 px-2 py-1 text-[11px] rounded-[6px] border ${
                                      isDiff
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold'
                                        : 'bg-slate-50 text-slate-700 border-slate-200'
                                    }`}
                                  >
                                    <FileText className="w-3 h-3 shrink-0" />
                                    <span className="truncate max-w-[200px]">
                                      {doc.name}
                                    </span>
                                    {isDiff && (
                                      <span className="text-[10px] font-bold text-emerald-700">
                                        [차이]
                                      </span>
                                    )}
                                  </span>
                                );
                              })}
                            </div>
                          </div>

                          {/* Key Metrics */}
                          {entry.result?.keyMetrics && entry.result.keyMetrics.length > 0 ? (
                            <div className="space-y-2">
                              <div className="text-[11px] font-bold text-slate-500">
                                핵심 지표
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                {entry.result.keyMetrics.map((m, idx) => (
                                  <div
                                    key={idx}
                                    className="p-2.5 rounded-[8px] bg-slate-50 border border-slate-200"
                                  >
                                    <div className="text-[11px] text-slate-500 truncate">
                                      {m.label}
                                    </div>
                                    <div className="text-xs font-bold font-mono text-[#172033] tabular-nums mt-0.5">
                                      {m.value}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}

                          {/* Executive Summary */}
                          <div className="space-y-1.5">
                            <div className="text-[11px] font-bold text-slate-500">
                              AI 핵심 분석 요약
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed">
                              {entry.result?.executiveSummary ||
                                '실시간 LLM 요약이 생성되지 않은 기본 구조화 분석입니다.'}
                            </p>
                          </div>

                          {/* Highlighted Cost Items & Recommendations */}
                          {entry.result?.recommendations &&
                            entry.result.recommendations.length > 0 && (
                              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                                <div className="text-[11px] font-bold text-slate-500">
                                  주요 최적화 권고 ({entry.result.recommendations.length}건)
                                </div>
                                <ul className="space-y-1 text-xs text-slate-600">
                                  {entry.result.recommendations.map((rec, rIdx) => (
                                    <li
                                      key={rIdx}
                                      className="flex items-start justify-between gap-2"
                                    >
                                      <span className="truncate">
                                        {String(rIdx + 1).padStart(2, '0')}. {rec.title}
                                      </span>
                                      <span className="font-mono font-semibold text-emerald-700 shrink-0 tabular-nums">
                                        {rec.impactEstimate}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
};
