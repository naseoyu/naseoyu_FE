import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Trash2,
  Plus,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  MessageSquareText,
} from 'lucide-react';
import {
  UploadedDataCenterDoc,
  PresetSampleDoc,
  AnalysisTimeframe,
  AnalysisFocusArea,
} from '../types';
import { SAMPLE_DATA_CENTER_PRESETS } from '../data/costTaxonomyData';

interface UploadPageProps {
  uploadedDocs: UploadedDataCenterDoc[];
  analysisRequest: string;
  timeframe: AnalysisTimeframe;
  focusArea: AnalysisFocusArea;
  onAddDocs: (docs: UploadedDataCenterDoc[]) => void;
  onRemoveDoc: (docId: string) => void;
  onClearDocs: () => void;
  onChangeAnalysisRequest: (value: string) => void;
  onChangeTimeframe: (value: AnalysisTimeframe) => void;
  onChangeFocusArea: (value: AnalysisFocusArea) => void;
  onStartAnalysis: () => void;
  onBackToLanding: () => void;
}

const REQUEST_EXAMPLES = [
  '3년치 데이터만 추려서 비용 추이를 분석해줘',
  '이 문서에서 전력료와 냉각 비용 중점으로 분석해줘',
  '감가상각비를 제외하고 실제 현금 유출 운영비(OPEX) 위주로 정리해줘',
  '업로드한 여러 문서의 전력 단가 및 외주용역비 차이를 비교해줘',
];

const TIMEFRAME_OPTIONS: Array<{ value: AnalysisTimeframe; label: string }> = [
  { value: 'all', label: '전체 기간' },
  { value: '1y', label: '1년치 기준' },
  { value: '3y', label: '3년치 집중' },
  { value: '5y', label: '5년 장기' },
];

const FOCUS_OPTIONS: Array<{ value: AnalysisFocusArea; label: string }> = [
  { value: 'all', label: '11대 항목 전체' },
  { value: 'power', label: '전력료·냉각 중점' },
  { value: 'depreciation', label: '자산 감가상각 중점' },
  { value: 'opex_only', label: '실질 OPEX 중심' },
  { value: 'maintenance', label: '수선유지·외주 중점' },
];

export const UploadPage: React.FC<UploadPageProps> = ({
  uploadedDocs,
  analysisRequest,
  timeframe,
  focusArea,
  onAddDocs,
  onRemoveDoc,
  onClearDocs,
  onChangeAnalysisRequest,
  onChangeTimeframe,
  onChangeFocusArea,
  onStartAnalysis,
  onBackToLanding,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const readFileAsBase64 = (file: File): Promise<string | undefined> => {
    // Keep inline PDF payload reasonable (<= 15MB) for API requests
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

      validDocs.push({
        id: `doc-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        sizeBytes: file.size,
        uploadedAt: new Date(),
        pageCount: matchedPreset
          ? matchedPreset.pageCount
          : Math.max(8, Math.round(file.size / (180 * 1024))),
        sourceType: matchedPreset ? 'preset_sample' : 'local_upload',
        documentSummary:
          matchedPreset?.summary ||
          '사용자 로컬 등록 데이터센터 운영 및 비용 관련 PDF 문서',
        base64Data,
      });
    }

    if (errors.length > 0) {
      setErrorMessage(errors.join(' '));
    }

    if (validDocs.length > 0) {
      onAddDocs(validDocs);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
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
    // Reset input value so the same file can be re-added if deleted
    e.target.value = '';
  };

  const handleTogglePreset = (preset: PresetSampleDoc) => {
    setErrorMessage(null);
    const exists = uploadedDocs.some((d) => d.id === preset.id);
    if (exists) {
      onRemoveDoc(preset.id);
      return;
    }

    const doc: UploadedDataCenterDoc = {
      id: preset.id,
      name: preset.name,
      sizeBytes: preset.fileSizeBytes,
      uploadedAt: new Date(),
      pageCount: preset.pageCount,
      sourceType: 'preset_sample',
      documentSummary: preset.summary,
    };
    onAddDocs([doc]);
  };

  const handleApplyExample = (example: string) => {
    if (!analysisRequest.trim()) {
      onChangeAnalysisRequest(example);
      return;
    }
    if (analysisRequest.includes(example)) {
      return;
    }
    onChangeAnalysisRequest(`${analysisRequest.trim()}\n- ${example}`);
  };

  const totalPages = uploadedDocs.reduce((sum, d) => sum + d.pageCount, 0);
  const totalBytes = uploadedDocs.reduce((sum, d) => sum + d.sizeBytes, 0);

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-slate-50 py-10 px-6 lg:px-10">
      <div className="max-w-[980px] mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <button
            type="button"
            onClick={onBackToLanding}
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#172033] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>시작 화면으로 돌아가기</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-500 whitespace-nowrap">
            <span className="font-bold text-[#2563EB]">1단계 서류 업로드</span>
            <span aria-hidden="true">/</span>
            <span className="text-slate-400">2단계 LLM 분석</span>
            <span aria-hidden="true">/</span>
            <span className="text-slate-400">3단계 비용 결과</span>
          </div>
        </div>

        {/* Page Title & Guidance Copy */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#172033] tracking-tight text-balance">
            분석할 데이터센터 서류와 요청 사항을 입력하세요
          </h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            여러 개의 PDF 자료를 함께 업로드하고 원하는 분석 기간·중점 비용 항목을 지정하면 AI가 조건에 맞춰 통합 분석합니다.
          </p>
        </div>

        {/* Error notification if invalid file */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-[12px] bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Hidden multi-file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="hidden"
          onChange={handleFileInput}
        />

        {/* File Upload & Multi-Document Management Card */}
        <div className="card-enterprise p-6 sm:p-8 mb-8 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-base font-bold text-[#172033]">
                서류 업로드 ({uploadedDocs.length}건)
              </h2>
              {uploadedDocs.length > 0 && (
                <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                  총 {uploadedDocs.length}개 문서 · 약 {totalPages}페이지 ·{' '}
                  {formatFileSize(totalBytes)}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {uploadedDocs.length >= 2 && (
                <button
                  type="button"
                  onClick={onClearDocs}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-[8px] hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  전체 삭제
                </button>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-blue-700 rounded-[8px] transition-colors cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>서류 추가</span>
              </button>
            </div>
          </div>

          {uploadedDocs.length === 0 ? (
            /* Empty Drag and Drop Zone */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center p-10 sm:p-12 rounded-[12px] border-2 border-dashed transition-all cursor-pointer ${
                isDragging
                  ? 'border-[#2563EB] bg-blue-50/70'
                  : 'border-slate-300 hover:border-[#2563EB] bg-slate-50/60 hover:bg-slate-50'
              }`}
            >
              <div className="w-14 h-14 rounded-[12px] bg-blue-50 text-[#2563EB] flex items-center justify-center mb-4">
                <UploadCloud className="w-7 h-7" />
              </div>

              <h3 className="text-base font-bold text-[#172033] mb-1.5 text-center">
                PDF 파일 여러 개를 끌어다 놓거나 클릭하여 추가하세요
              </h3>
              <p className="text-xs text-slate-500 text-center max-w-md mb-6 leading-relaxed">
                전력 청구서, GPU/서버 유지보수 계약서, 감가상각 내역서 등 복수의 문서를 한 번에 업로드할 수 있습니다 (파일당 최대 50MB).
              </p>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-[8px] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors cursor-pointer"
              >
                로컬 컴퓨터에서 파일 여러 개 선택
              </button>
            </div>
          ) : (
            /* Uploaded Documents List + Compact Append Dropzone */
            <div className="space-y-4">
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-[12px] overflow-hidden bg-white">
                {uploadedDocs.map((doc, idx) => (
                  <div
                    key={doc.id}
                    className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-[10px] bg-[#172033] text-white flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 tabular-nums">
                          <span className="font-mono font-bold text-slate-400">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-emerald-700">
                            {doc.sourceType === 'preset_sample'
                              ? '표준 샘플 문서'
                              : '로컬 PDF 업로드'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>약 {doc.pageCount}p</span>
                          <span aria-hidden="true">·</span>
                          <span>{formatFileSize(doc.sizeBytes)}</span>
                        </div>
                        <h3 className="text-sm font-bold text-[#172033] truncate mt-0.5">
                          {doc.name}
                        </h3>
                        {doc.documentSummary && (
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {doc.documentSummary}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => onRemoveDoc(doc.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-white border border-red-200 rounded-[8px] hover:bg-red-50 transition-colors cursor-pointer whitespace-nowrap"
                        title={`${doc.name} 삭제`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>삭제</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Compact Dropzone to append additional files */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 rounded-[10px] border border-dashed flex flex-col sm:flex-row items-center justify-between gap-3 cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-[#2563EB] bg-blue-50/70'
                    : 'border-slate-300 bg-slate-50/70 hover:border-[#2563EB] hover:bg-blue-50/30'
                }`}
              >
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <UploadCloud className="w-4 h-4 text-[#2563EB] shrink-0" />
                  <span>
                    비교·합산 분석할 PDF 서류가 더 있다면 여기에 끌어다 놓거나 <strong>서류 추가</strong> 버튼을 누르세요.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#2563EB] bg-white border border-blue-200 rounded-[8px] hover:bg-blue-50 transition-colors shrink-0 cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>서류 추가</span>
                </button>
              </div>

              <div className="p-3.5 rounded-[10px] bg-blue-50/60 border border-blue-200 text-xs text-[#172033] flex items-center gap-2.5">
                <FileCheck className="w-4 h-4 text-[#2563EB] shrink-0" />
                <p>
                  <strong>{uploadedDocs.length}건의 서류 검증 완료:</strong> 아래 분석 요청 사항을 입력하면 해당 조건에 맞춰 비용 항목을 추출·분석합니다.
                </p>
              </div>
            </div>
          )}

          {/* Multi-select Presets */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold text-slate-700">
                실사 테스트용 표준 샘플 문서 추가 선택 (복수 선택 가능)
              </span>
              <span className="text-[11px] text-slate-400">
                클릭하여 목록에 추가하거나 제외할 수 있습니다
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {SAMPLE_DATA_CENTER_PRESETS.map((preset) => {
                const isSelected = uploadedDocs.some((d) => d.id === preset.id);
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleTogglePreset(preset)}
                    className={`flex flex-col text-left p-3.5 rounded-[10px] border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#2563EB] bg-blue-50/60 ring-1 ring-[#2563EB]'
                        : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1 gap-2">
                      <span className="font-bold text-[#172033] truncate">
                        {preset.label}
                      </span>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                      ) : (
                        <Plus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                    </div>
                    <span className="text-slate-500 truncate mb-1 text-[11px] w-full">
                      {preset.name}
                    </span>
                    <span className="text-[11px] text-slate-400 tabular-nums">
                      {formatFileSize(preset.fileSizeBytes)} · {preset.pageCount}p
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Custom Analysis Request Section */}
        <div className="card-enterprise p-6 sm:p-8 mb-8 bg-white">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-9 h-9 rounded-[10px] bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
              <MessageSquareText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#172033]">
                맞춤 분석 요청 사항 입력
              </h2>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                업로드한 서류에서 어떤 기간이나 비용 항목을 중점적으로 볼지 자유롭게 지시하세요. 좌측 프롬프트 창에서도 언제든 수정·질문할 수 있습니다.
              </p>
            </div>
          </div>

          {/* Structured Scope Selectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-2">
                분석 기간 기준
              </span>
              <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-[10px]">
                {TIMEFRAME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChangeTimeframe(opt.value)}
                    className={`flex-1 px-2.5 py-1.5 text-xs font-medium rounded-[7px] transition-colors cursor-pointer whitespace-nowrap ${
                      timeframe === opt.value
                        ? 'bg-white text-[#172033] font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-[#172033]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-700 mb-2">
                중점 분석 영역
              </span>
              <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-[10px]">
                {FOCUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChangeFocusArea(opt.value)}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded-[7px] transition-colors cursor-pointer whitespace-nowrap ${
                      focusArea === opt.value
                        ? 'bg-white text-[#172033] font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-[#172033]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Free-text Request Input */}
          <div className="mb-4">
            <label
              htmlFor="analysis-request-input"
              className="block text-xs font-semibold text-slate-700 mb-2"
            >
              상세 분석 요청 내용 (프롬프트)
            </label>
            <textarea
              id="analysis-request-input"
              value={analysisRequest}
              onChange={(e) => onChangeAnalysisRequest(e.target.value)}
              rows={3}
              placeholder="예: 업로드한 서류에서 최근 3년치만 추출해 분석하고, 특히 전력료와 냉각 비용 절감 방안을 중점적으로 정리해줘."
              className="w-full px-4 py-3 text-sm text-[#172033] bg-slate-50 border border-slate-200 rounded-[10px] focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] placeholder:text-slate-400 leading-relaxed"
            />
          </div>

          {/* Quick Request Examples */}
          <div>
            <span className="block text-[11px] font-semibold text-slate-500 mb-2">
              자주 사용하는 요청 예시 클릭하여 추가
            </span>
            <div className="flex flex-wrap gap-2">
              {REQUEST_EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => handleApplyExample(ex)}
                  className="px-3 py-1.5 text-xs text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-[#2563EB] border border-slate-200 hover:border-blue-200 rounded-[8px] transition-colors cursor-pointer text-left"
                >
                  + {ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Security / Privacy Notice */}
        <div className="card-enterprise p-6 mb-8 bg-white text-xs text-slate-600 space-y-2.5">
          <div className="flex items-center gap-2 font-bold text-[#172033] text-sm">
            <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
            <span>파일 업로드 및 개인정보·기밀정보 주의사항</span>
          </div>
          <ul className="space-y-1 text-slate-600 pl-5 list-disc leading-relaxed">
            <li>
              <strong>다중 PDF 교차 분석 지원:</strong> 전력 청구서, 유지보수 계약서, 감가상각 내역서 등 여러 서류를 동시에 올리면 요청 조건에 맞춰 통합 분석합니다.
            </li>
            <li>
              <strong>기밀 정보 보호:</strong> 계좌번호, 담당자 개인 연락처 등 불필요한 식별정보는 마스킹 후 업로드해 주십시오.
            </li>
          </ul>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBackToLanding}
            className="px-6 py-3.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-[12px] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            이전으로
          </button>

          <button
            type="button"
            onClick={onStartAnalysis}
            disabled={uploadedDocs.length === 0}
            className={`flex items-center gap-2 px-8 py-3.5 text-sm font-semibold rounded-[12px] transition-all ${
              uploadedDocs.length > 0
                ? 'bg-[#2563EB] text-white hover:bg-blue-700 shadow-xs cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span>
              {uploadedDocs.length > 0
                ? `${uploadedDocs.length}건 서류 맞춤 분석 시작`
                : '서류를 먼저 업로드하세요'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
