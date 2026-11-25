import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Plus,
  Trash2,
  X,
  ArrowRight,
  AlertCircle,
  Pencil,
  NotebookPen,
  Sparkles,
} from 'lucide-react';
import {
  UploadedDataCenterDoc,
  AdditionalAnalysisPayload,
} from '../../types';
import { SAMPLE_DATA_CENTER_PRESETS } from '../../data/costTaxonomyData';

interface AdditionalAnalysisPanelProps {
  existingDocs: UploadedDataCenterDoc[];
  nextSequenceNumber: number;
  onCancel: () => void;
  onSubmit: (payload: AdditionalAnalysisPayload) => void;
}

export const AdditionalAnalysisPanel: React.FC<AdditionalAnalysisPanelProps> = ({
  existingDocs,
  nextSequenceNumber,
  onCancel,
  onSubmit,
}) => {
  const [newDocs, setNewDocs] = useState<UploadedDataCenterDoc[]>([]);
  const [includeExistingDocs, setIncludeExistingDocs] = useState<boolean>(true);
  const [title, setTitle] = useState<string>('');
  const [memo, setMemo] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const nextSeqLabel = String(nextSequenceNumber).padStart(3, '0');

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const readFileAsBase64 = (file: File): Promise<string | undefined> => {
    if (file.size > 15 * 1024 * 1024) {
      return Promise.resolve(undefined);
    }
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = typeof reader.result === 'string' ? reader.result : '';
        const commaIndex = result.indexOf(',');
        resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : undefined);
      };
      reader.onerror = () => resolve(undefined);
      reader.readAsDataURL(file);
    });
  };

  const processFiles = async (fileList: FileList | File[]) => {
    setErrorMessage(null);
    const files = Array.from(fileList);
    if (files.length === 0) return;

    const validDocs: UploadedDataCenterDoc[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isPdf =
        file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf';
      if (!isPdf) {
        errors.push(`${file.name}: PDF 형식(.pdf)만 업로드할 수 있습니다.`);
        continue;
      }
      if (file.size > 50 * 1024 * 1024) {
        errors.push(`${file.name}: 파일 용량은 최대 50MB까지 가능합니다.`);
        continue;
      }

      const matchedPreset = SAMPLE_DATA_CENTER_PRESETS.find(
        (p) => p.name.toLowerCase() === file.name.toLowerCase()
      );
      const base64Data = await readFileAsBase64(file);
      const cleanBase = file.name.replace(/\.pdf$/i, '').trim();
      const seq = String(existingDocs.length + newDocs.length + validDocs.length + 1).padStart(
        2,
        '0'
      );

      validDocs.push({
        id: `add-doc-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
        name: cleanBase ? `추가 서류 #${seq} (${cleanBase})` : `추가 서류 #${seq}`,
        originalFileName: file.name,
        isCustomTitle: false,
        sizeBytes: file.size,
        uploadedAt: new Date(),
        pageCount: matchedPreset
          ? matchedPreset.pageCount
          : Math.max(8, Math.round(file.size / (180 * 1024))),
        sourceType: matchedPreset ? 'preset_sample' : 'local_upload',
        documentSummary:
          matchedPreset?.summary ||
          '추가 분석을 위해 업로드된 데이터센터 비용·운영 PDF 문서',
        base64Data,
      });
    }

    if (errors.length > 0) {
      setErrorMessage(errors.join(' '));
    }
    if (validDocs.length > 0) {
      setNewDocs((prev) => [...prev, ...validDocs]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      void processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      void processFiles(e.target.files);
    }
    e.target.value = '';
  };

  const handleUpdateNewDocTitle = (docId: string, nextTitle: string) => {
    setNewDocs((prev) =>
      prev.map((d) =>
        d.id === docId ? { ...d, name: nextTitle, isCustomTitle: true } : d
      )
    );
  };

  const handleRemoveNewDoc = (docId: string) => {
    setNewDocs((prev) => prev.filter((d) => d.id !== docId));
  };

  const canSubmit = newDocs.length > 0;
  const totalTargetCount = includeExistingDocs
    ? existingDocs.length +
      newDocs.filter((nd) => !existingDocs.some((ed) => ed.id === nd.id)).length
    : newDocs.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) {
      setErrorMessage('추가 분석할 PDF 서류를 최소 1건 이상 업로드하거나 선택해 주세요.');
      return;
    }
    onSubmit({
      newDocs,
      title,
      memo,
      request: '',
      includeExistingDocs,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 rounded-[12px] bg-white border-2 border-[#2563EB]/30 shadow-sm overflow-hidden"
    >
      {/* Panel Header */}
      <div className="px-6 py-4 bg-blue-50/70 border-b border-blue-200/80 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-[8px] bg-[#2563EB] text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[11px] font-mono font-bold bg-[#172033] text-white rounded-[5px] tabular-nums">
                #{nextSeqLabel}
              </span>
              <h2 className="text-base font-bold text-[#172033] truncate">
                서류 추가 업로드 및 LLM 추가 분석
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              서류를 더 올리고 제목·메모를 입력해 실행하면 LLM 분석 창으로 이동해 새로운 결과를 생성합니다.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="p-2 text-slate-500 hover:text-[#172033] hover:bg-white rounded-[8px] transition-colors cursor-pointer shrink-0"
          title="추가 분석 닫기"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {errorMessage && (
          <div className="p-3.5 rounded-[10px] bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="hidden"
          onChange={handleFileInput}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Document Upload & Staged List */}
          <div className="lg:col-span-7 space-y-4">
            {/* Existing Docs Retention Toggle */}
            <div className="p-3.5 rounded-[10px] bg-slate-50 border border-slate-200 space-y-2">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeExistingDocs}
                  onChange={(e) => setIncludeExistingDocs(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#2563EB] focus:ring-[#2563EB] cursor-pointer"
                />
                <span className="text-xs font-semibold text-[#172033]">
                  기존 분석 서류({existingDocs.length}건)를 유지하고 추가 서류와 통합 분석
                </span>
              </label>
              {includeExistingDocs && existingDocs.length > 0 && (
                <div className="pl-6 flex flex-wrap gap-1.5">
                  {existingDocs.map((d) => (
                    <span
                      key={d.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] text-slate-600 bg-white border border-slate-200 rounded-[6px] max-w-[220px] truncate"
                    >
                      <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{d.name}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Drag and Drop Area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
              }}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-5 rounded-[12px] border-2 border-dashed flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer transition-colors ${
                isDragging
                  ? 'border-[#2563EB] bg-blue-50/70'
                  : 'border-slate-300 bg-slate-50/60 hover:border-[#2563EB] hover:bg-blue-50/20'
              }`}
            >
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-[10px] bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#172033]">
                    추가할 서류를 끌어다 놓거나 선택하세요
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    견적서, 추가 전력 계약서, 액체냉각 사양서 등 복수 업로드 가능 (파일당 50MB 이하)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-blue-700 rounded-[8px] transition-colors shrink-0 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>PDF 추가</span>
              </button>
            </div>

            {/* Newly Staged Documents */}
            {newDocs.length > 0 && (
              <div className="border border-slate-200 rounded-[10px] divide-y divide-slate-200 bg-white overflow-hidden">
                {newDocs.map((doc, idx) => (
                  <div
                    key={doc.id}
                    className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50/70"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-blue-50 text-[#2563EB] border border-blue-200 rounded-[5px] shrink-0">
                        +{String(idx + 1).padStart(2, '0')}
                      </span>
                      <Pencil className="w-3 h-3 text-slate-400 shrink-0" />
                      <input
                        type="text"
                        value={doc.name}
                        onChange={(e) => handleUpdateNewDocTitle(doc.id, e.target.value)}
                        aria-label={`추가 서류 ${idx + 1} 제목`}
                        className="flex-1 min-w-0 px-2 py-1 text-xs font-semibold text-[#172033] bg-slate-50 border border-slate-200 rounded-[6px] focus:outline-none focus:bg-white focus:border-[#2563EB]"
                      />
                      <span className="text-[11px] text-slate-400 tabular-nums shrink-0">
                        {formatFileSize(doc.sizeBytes)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveNewDoc(doc.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-[6px] transition-colors cursor-pointer shrink-0"
                      title="제외"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Title & Memo for Additional Analysis */}
          <div className="lg:col-span-5 p-4 rounded-[12px] bg-amber-50/40 border border-amber-200/80 space-y-4">
            <div className="flex items-center gap-2">
              <NotebookPen className="w-4 h-4 text-amber-700 shrink-0" />
              <h3 className="text-xs font-bold text-[#172033]">
                추가 분석 제목 및 요청사항 메모
              </h3>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="additional-analysis-title"
                  className="text-xs font-semibold text-[#172033]"
                >
                  추가 분석 제목
                </label>
                <span className="text-[11px] text-slate-400">히스토리 #{nextSeqLabel}</span>
              </div>
              <input
                id="additional-analysis-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium text-[#172033] bg-white border border-slate-200 rounded-[8px] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] placeholder:text-slate-400"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="additional-analysis-memo"
                  className="text-xs font-semibold text-[#172033]"
                >
                  간단한 요청사항 메모
                </label>
                <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                  {memo.length}자
                </span>
              </div>
              <textarea
                id="additional-analysis-memo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={5}
                className="w-full px-3 py-2 text-xs text-[#172033] bg-white border border-amber-200 rounded-[8px] resize-y focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 placeholder:text-slate-400 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Panel Footer */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 tabular-nums">
            {canSubmit ? (
              <>
                총 <strong className="text-[#172033]">{totalTargetCount}건</strong> 서류(신규{' '}
                <strong className="text-[#2563EB]">{newDocs.length}건</strong> 포함)로{' '}
                <strong>LLM 분석 창</strong>으로 이동하여 재분석합니다.
              </>
            ) : (
              '추가 서류를 1건 이상 업로드하면 LLM 분석을 시작할 수 있습니다.'
            )}
          </p>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-[8px] hover:bg-slate-50 transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-[8px] transition-colors ${
                canSubmit
                  ? 'bg-[#2563EB] text-white hover:bg-blue-700 cursor-pointer shadow-xs'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <span>추가 서류로 LLM 분석 시작</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
