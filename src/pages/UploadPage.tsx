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
  Server,
  Pencil,
  NotebookPen,
  Sparkles,
  Eraser,
} from 'lucide-react';
import {
  UploadedDataCenterDoc,
  PresetSampleDoc,
  AnalysisTimeframe,
  AnalysisFocusArea,
  AidcProjectSpecs,
  PromptChatMessage,
} from '../types';
import { SAMPLE_DATA_CENTER_PRESETS } from '../data/costTaxonomyData';

interface UploadPageProps {
  uploadedDocs: UploadedDataCenterDoc[];
  analysisTitle: string;
  analysisRequest: string;
  requestMemo: string;
  timeframe: AnalysisTimeframe;
  focusArea: AnalysisFocusArea;
  aidcSpecs: AidcProjectSpecs;
  chatMessages: PromptChatMessage[];
  onAddDocs: (docs: UploadedDataCenterDoc[]) => void;
  onRemoveDoc: (docId: string) => void;
  onUpdateDocTitle: (docId: string, newTitle: string, isCustomTitle?: boolean) => void;
  onClearDocs: () => void;
  onChangeAnalysisTitle: (value: string) => void;
  onChangeAnalysisRequest: (value: string) => void;
  onChangeRequestMemo: (value: string) => void;
  onChangeTimeframe: (value: AnalysisTimeframe) => void;
  onChangeFocusArea: (value: AnalysisFocusArea) => void;
  onChangeAidcSpecs: (specs: AidcProjectSpecs) => void;
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

const DURATION_YEAR_STEPS = [
  { years: 1, label: '1년', value: '1년 (12개월)' },
  { years: 2, label: '2년', value: '2년 (24개월)' },
  { years: 3, label: '3년', value: '3년 (36개월)' },
  { years: 4, label: '4년', value: '4년 (48개월)' },
  { years: 5, label: '5년(60개월)', value: '5년 (60개월)' },
];

const GPU_SYSTEM_OPTIONS = [
  '1_NVIDIA DGX H100',
  '2_NVIDIA DGX H200',
  '3_NVIDIA DGX GB200',
  '4_NVIDIA DGX GB300',
  '5_NVIDIA DGX GB200 NVL72',
  '6_NVIDIA DGX GB300 NVL72',
  '7_NVIDIA DGX Vera Rubin NVL72',
  '8_NVIDIA DGX Vera Rubin NVL576',
  '9_OEM HGX H100',
  '10_OEM HGX H200',
  '11_OEM HGX GB200',
  '12_OEM HGX GB300',
  '13_OEM HGX GB200 NVL72',
  '14_OEM HGX GB300 NVL72',
] as const;

const GPU_SYSTEM_SPECS: Record<string, { gpuConfig: string; coolingType: string }> = {
  '1_NVIDIA DGX H100': {
    gpuConfig: '8 GPU / 1 Server',
    coolingType: 'Air Cooling',
  },
  '2_NVIDIA DGX H200': {
    gpuConfig: '8 GPU / 1 Server',
    coolingType: 'Air Cooling',
  },
  '3_NVIDIA DGX GB200': {
    gpuConfig: '4 GPU + 2 Grace CPU / compute tray',
    coolingType: 'Direct Liquid Cooling',
  },
  '4_NVIDIA DGX GB300': {
    gpuConfig: '4 GPU + 2 Grace CPU / compute tray',
    coolingType: 'Direct Liquid Cooling',
  },
  '5_NVIDIA DGX GB200 NVL72': {
    gpuConfig: '72 GPU / 1 rack',
    coolingType: 'Direct Liquid Cooling',
  },
  '6_NVIDIA DGX GB300 NVL72': {
    gpuConfig: '72 GPU / 1 rack',
    coolingType: 'Direct Liquid Cooling',
  },
  '7_NVIDIA DGX Vera Rubin NVL72': {
    gpuConfig: '72 GPU / 1 rack',
    coolingType: 'Direct Liquid Cooling',
  },
  '8_NVIDIA DGX Vera Rubin NVL576': {
    gpuConfig: '576 GPU / 8 racks',
    coolingType: 'Direct Liquid Cooling',
  },
  '9_OEM HGX H100': {
    gpuConfig: '8 GPU / Dell 6U or Supermicro 8U server',
    coolingType: 'Air Cooling',
  },
  '10_OEM HGX H200': {
    gpuConfig: '8 GPU / Dell 6U or Supermicro 8U server',
    coolingType: 'Air Cooling',
  },
  '11_OEM HGX GB200': {
    gpuConfig: '4 GPU + 2 Grace CPU / 1U liquid-cooled node',
    coolingType: 'Direct Liquid Cooling',
  },
  '12_OEM HGX GB300': {
    gpuConfig: '4 GPU + 2 Grace CPU / liquid-cooled compute tray',
    coolingType: 'Direct Liquid Cooling',
  },
  '13_OEM HGX GB200 NVL72': {
    gpuConfig: '72 GPU / 1 rack',
    coolingType: 'Direct Liquid Cooling',
  },
  '14_OEM HGX GB300 NVL72': {
    gpuConfig: '72 GPU / 1 rack',
    coolingType: 'Direct Liquid Cooling',
  },
};

const STORAGE_CAPACITY_OPTIONS = [
  '최소형 PoC/추론중심 스토리지 필요량',
  '표준형 권장 스토리지 필요량',
  '대규모 학습량 스토리지 필요량',
] as const;

const STORAGE_PER_GPU_REQUIREMENTS: Record<string, string> = {
  '최소형 PoC/추론중심 스토리지 필요량':
    '공유 성능형 18 TiB; 오브젝트/백업 90 TiB; 읽기 목표 18-36 GB/s',
  '표준형 권장 스토리지 필요량':
    '공유 성능형 90 TiB; 오브젝트/백업 360 TiB; 읽기 목표 72-144 GB/s',
  '대규모 학습량 스토리지 필요량':
    '공유 성능형 270 TiB; 오브젝트/백업 360 TiB; 읽기 목표 270-360 GB/s',
};

const DIA_BANDWIDTH_PRESETS = ['10 Gbps', '100 Gbps', '400 Gbps'];

export const UploadPage: React.FC<UploadPageProps> = ({
  uploadedDocs,
  analysisTitle,
  analysisRequest,
  requestMemo,
  timeframe,
  focusArea,
  aidcSpecs,
  chatMessages,
  onAddDocs,
  onRemoveDoc,
  onUpdateDocTitle,
  onClearDocs,
  onChangeAnalysisTitle,
  onChangeAnalysisRequest,
  onChangeRequestMemo,
  onChangeTimeframe,
  onChangeFocusArea,
  onChangeAidcSpecs,
  onStartAnalysis,
  onBackToLanding,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingDocTitle, setPendingDocTitle] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateAutoDocTitle = (fileName: string, indexOffset = 0): string => {
    const seq = String(uploadedDocs.length + indexOffset + 1).padStart(2, '0');
    const cleanBase = fileName.replace(/\.pdf$/i, '').trim();
    return cleanBase ? `AIDC 비용 문서 #${seq} (${cleanBase})` : `AIDC 비용 문서 #${seq}`;
  };

  const parseDurationToMonths = (durationText: string): number | null => {
    const trimmed = durationText.trim();
    if (!trimmed) return null;

    const yearAndMonthMatch = trimmed.match(/^[^()]*?(\d+(?:\.\d+)?)\s*년\s*(\d+)\s*개월/);
    if (yearAndMonthMatch) {
      const months =
        Math.round(Number(yearAndMonthMatch[1]) * 12) + Number(yearAndMonthMatch[2]);
      return months > 0 ? months : null;
    }

    const monthMatch = trimmed.match(/(\d+)\s*개월/);
    if (monthMatch) {
      const months = Number(monthMatch[1]);
      return months > 0 ? months : null;
    }

    const yearMatch = trimmed.match(/(\d+(?:\.\d+)?)\s*년/);
    if (yearMatch) {
      const months = Math.round(Number(yearMatch[1]) * 12);
      return months > 0 ? months : null;
    }

    if (/^\d+$/.test(trimmed)) {
      const months = Number(trimmed);
      return months > 0 ? months : null;
    }

    return null;
  };

  const calculateUsageEndDate = (
    commencementDate: string,
    durationText: string
  ): string | null => {
    const dateMatch = commencementDate.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!dateMatch) return null;

    const year = Number(dateMatch[1]);
    const month = Number(dateMatch[2]);
    const day = Number(dateMatch[3]);
    if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) return null;

    const durationMonths = parseDurationToMonths(durationText);
    if (!durationMonths || durationMonths <= 0 || durationMonths > 60) return null;

    const totalMonths = year * 12 + (month - 1) + durationMonths;
    const endYear = Math.floor(totalMonths / 12);
    const endMonthZeroBased = totalMonths % 12;
    const lastDayOfEndMonth = new Date(endYear, endMonthZeroBased + 1, 0).getDate();
    const endDay = Math.min(day, lastDayOfEndMonth);

    return `${endYear}-${String(endMonthZeroBased + 1).padStart(2, '0')}-${String(
      endDay
    ).padStart(2, '0')}`;
  };

  const updateSpec = <K extends keyof AidcProjectSpecs>(
    key: K,
    value: AidcProjectSpecs[K]
  ) => {
    const nextSpecs: AidcProjectSpecs = { ...aidcSpecs, [key]: value };
    if (key === 'commencementDate' || key === 'usageDuration') {
      nextSpecs.usageEndDate =
        calculateUsageEndDate(nextSpecs.commencementDate, nextSpecs.usageDuration) ?? '';
    }
    onChangeAidcSpecs(nextSpecs);
  };

  const getSelectedDurationYears = (durationText: string): number => {
    const yearMatch = durationText.match(/(\d+(?:\.\d+)?)\s*년/);
    if (yearMatch) {
      return Math.min(5, Math.max(1, Math.round(Number(yearMatch[1]))));
    }
    const monthMatch = durationText.match(/(\d+)\s*개월/);
    if (monthMatch) {
      return Math.min(5, Math.max(1, Math.round(Number(monthMatch[1]) / 12)));
    }
    return 3;
  };

  const parsedDurationMonths = parseDurationToMonths(aidcSpecs.usageDuration);
  const isDurationOverLimit = parsedDurationMonths !== null && parsedDurationMonths > 60;
  const monthInputDisplay = parsedDurationMonths !== null ? String(parsedDurationMonths) : '';
  const usageEndDate = calculateUsageEndDate(
    aidcSpecs.commencementDate,
    aidcSpecs.usageDuration
  );

  const sliderYears = getSelectedDurationYears(aidcSpecs.usageDuration);

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

    const customTitleInput = pendingDocTitle.trim();
    const pdfCount = files.filter(
      (f) => f.name.toLowerCase().endsWith('.pdf') || f.type === 'application/pdf'
    ).length;

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
      const resolvedTitle = customTitleInput
        ? pdfCount > 1
          ? `${customTitleInput} (${validDocs.length + 1})`
          : customTitleInput
        : generateAutoDocTitle(file.name, validDocs.length);

      validDocs.push({
        id: `doc-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
        name: resolvedTitle,
        originalFileName: file.name,
        isCustomTitle: Boolean(customTitleInput),
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
      if (customTitleInput) {
        setPendingDocTitle('');
      }
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

    const customTitleInput = pendingDocTitle.trim();
    const doc: UploadedDataCenterDoc = {
      id: preset.id,
      name: customTitleInput || preset.label || preset.name,
      originalFileName: preset.name,
      isCustomTitle: Boolean(customTitleInput),
      sizeBytes: preset.fileSizeBytes,
      uploadedAt: new Date(),
      pageCount: preset.pageCount,
      sourceType: 'preset_sample',
      documentSummary: preset.summary,
    };
    onAddDocs([doc]);
    if (customTitleInput) {
      setPendingDocTitle('');
    }
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

  const selectedTimeframeLabel =
    TIMEFRAME_OPTIONS.find((t) => t.value === timeframe)?.label || '전체 기간';
  const selectedFocusLabel =
    FOCUS_OPTIONS.find((f) => f.value === focusArea)?.label || '11대 항목 전체';
  const userChatPrompts = chatMessages
    .filter((m) => m.role === 'user' && !m.id.startsWith('req-sync-'))
    .map((m) => m.content.trim())
    .filter(Boolean);

  const buildRequestSummaryLines = (): string[] => {
    const lines: string[] = [];
    if (analysisTitle.trim()) {
      lines.push(`분석 제목: ${analysisTitle.trim()}`);
    }
    if (uploadedDocs.length > 0) {
      lines.push(
        `대상 문서(${uploadedDocs.length}건): ${uploadedDocs
          .map((d) => d.name)
          .join(', ')}`
      );
    }
    lines.push(`분석 기준: ${selectedTimeframeLabel} · ${selectedFocusLabel}`);

    const specParts: string[] = [];
    if (aidcSpecs.commencementDate)
      specParts.push(`가동 ${aidcSpecs.commencementDate}`);
    if (aidcSpecs.usageDuration)
      specParts.push(`기간 ${aidcSpecs.usageDuration}`);
    if (aidcSpecs.gpuSystemType)
      specParts.push(`GPU ${aidcSpecs.gpuSystemType}`);
    if (aidcSpecs.storageCapacity)
      specParts.push(`Storage ${aidcSpecs.storageCapacity}`);
    if (aidcSpecs.diaBandwidth) specParts.push(`DIA ${aidcSpecs.diaBandwidth}`);
    if (specParts.length > 0) {
      lines.push(`AIDC 사양: ${specParts.join(' / ')}`);
    }

    if (analysisRequest.trim()) {
      lines.push(`상세 요청: ${analysisRequest.trim()}`);
    }

    if (userChatPrompts.length > 0) {
      const recentChat = userChatPrompts[userChatPrompts.length - 1];
      lines.push(`메신저 최근 요청: ${recentChat}`);
    }

    return lines;
  };

  const summaryLines = buildRequestSummaryLines();

  const handleFillMemoFromSummary = () => {
    const formatted = summaryLines.map((line) => `• ${line}`).join('\n');
    onChangeRequestMemo(formatted);
  };

  return (
    <div className="w-full min-h-full bg-slate-50 py-10 px-6 lg:px-10">
      <div className="max-w-[1160px] mx-auto">
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

        {/* Top Dashboard Grid: Document Upload + Title Specification (Left) & Request Summary Notepad (Right) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start mb-8">
          {/* File Upload & Multi-Document Management Card */}
          <div className="xl:col-span-7 card-enterprise p-6 sm:p-7 bg-white">
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

            {/* Document Title Pre-Input (Optional — auto-assigned if left empty) */}
            <div className="mb-5 p-3.5 rounded-[10px] bg-slate-50 border border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <label
                  htmlFor="pending-doc-title"
                  className="text-xs font-semibold text-[#172033]"
                >
                  업로드 할 문서 제목 지정
                </label>
                <span className="text-[11px] text-slate-500">
                  미입력 시 자동 제목이 부여됩니다
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="pending-doc-title"
                  type="text"
                  value={pendingDocTitle}
                  onChange={(e) => setPendingDocTitle(e.target.value)}
                  className="flex-1 min-w-0 px-3 py-2 text-xs text-[#172033] bg-white border border-slate-200 rounded-[8px] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] placeholder:text-slate-400"
                />
                {pendingDocTitle && (
                  <button
                    type="button"
                    onClick={() => setPendingDocTitle('')}
                    className="px-2.5 py-2 text-[11px] font-medium text-slate-500 hover:text-[#172033] bg-white border border-slate-200 rounded-[8px] cursor-pointer shrink-0"
                  >
                    지우기
                  </button>
                )}
              </div>
            </div>

            {uploadedDocs.length === 0 ? (
              /* Empty Drag and Drop Zone */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center p-9 sm:p-11 rounded-[12px] border-2 border-dashed transition-all cursor-pointer ${
                  isDragging
                    ? 'border-[#2563EB] bg-blue-50/70'
                    : 'border-slate-300 hover:border-[#2563EB] bg-slate-50/60 hover:bg-slate-50'
                }`}
              >
                <div className="w-13 h-13 rounded-[12px] bg-blue-50 text-[#2563EB] flex items-center justify-center mb-4">
                  <UploadCloud className="w-6 h-6" />
                </div>

                <h3 className="text-base font-bold text-[#172033] mb-1.5 text-center">
                  PDF 파일 여러 개를 끌어다 놓거나 클릭하여 추가하세요
                </h3>
                <p className="text-xs text-slate-500 text-center max-w-md mb-5 leading-relaxed">
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
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-[10px] bg-[#172033] text-white flex items-center justify-center shrink-0 mt-0.5">
                          <FileText className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 tabular-nums mb-1">
                            <span className="font-mono font-bold text-slate-400">
                              {String(idx + 1).padStart(2, '0')}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-semibold text-emerald-700">
                              {doc.sourceType === 'preset_sample'
                                ? '표준 샘플'
                                : '로컬 PDF'}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span
                              className={`font-medium ${
                                doc.isCustomTitle
                                  ? 'text-[#2563EB]'
                                  : 'text-slate-500'
                              }`}
                            >
                              {doc.isCustomTitle ? '제목 직접 지정' : '제목 자동 지정'}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>약 {doc.pageCount}p</span>
                            <span aria-hidden="true">·</span>
                            <span>{formatFileSize(doc.sizeBytes)}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Pencil className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <input
                              type="text"
                              value={doc.name}
                              aria-label={`${idx + 1}번 문서 제목`}
                              onChange={(e) =>
                                onUpdateDocTitle(doc.id, e.target.value, true)
                              }
                              onBlur={(e) => {
                                const trimmed = e.target.value.trim();
                                if (!trimmed) {
                                  const fallback = `AIDC 비용 문서 #${String(
                                    idx + 1
                                  ).padStart(2, '0')}${
                                    doc.originalFileName
                                      ? ` (${doc.originalFileName.replace(/\.pdf$/i, '')})`
                                      : ''
                                  }`;
                                  onUpdateDocTitle(doc.id, fallback, false);
                                } else if (trimmed !== doc.name) {
                                  onUpdateDocTitle(doc.id, trimmed, true);
                                }
                              }}
                              placeholder="문서 제목을 입력하세요 (비우면 자동 지정)"
                              className="w-full min-w-0 px-2.5 py-1 text-sm font-bold text-[#172033] bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 rounded-[7px] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] transition-colors"
                            />
                          </div>

                          <p className="text-[11px] text-slate-500 truncate mt-1">
                            원본 파일: {doc.originalFileName || doc.name}
                            {doc.documentSummary ? ` · ${doc.documentSummary}` : ''}
                          </p>
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
                  className={`p-3.5 rounded-[10px] border border-dashed flex flex-col sm:flex-row items-center justify-between gap-3 cursor-pointer transition-colors ${
                    isDragging
                      ? 'border-[#2563EB] bg-blue-50/70'
                      : 'border-slate-300 bg-slate-50/70 hover:border-[#2563EB] hover:bg-blue-50/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5 text-xs text-slate-600">
                    <UploadCloud className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <span>
                      추가할 PDF가 있다면 끌어다 놓거나 <strong>서류 추가</strong>를 누르세요.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#2563EB] bg-white border border-blue-200 rounded-[8px] hover:bg-blue-50 transition-colors shrink-0 cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>서류 추가</span>
                  </button>
                </div>

                <div className="p-3 rounded-[10px] bg-blue-50/60 border border-blue-200 text-xs text-[#172033] flex items-center gap-2.5">
                  <FileCheck className="w-4 h-4 text-[#2563EB] shrink-0" />
                  <p>
                    <strong>{uploadedDocs.length}건 서류 준비 완료:</strong> 위 제목을 클릭해 언제든 수정할 수 있습니다.
                  </p>
                </div>
              </div>
            )}

            {/* Multi-select Presets */}
            <div className="mt-6 pt-5 border-t border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="text-xs font-bold text-slate-700">
                  실사 테스트용 표준 샘플 문서 추가 선택 (복수 선택 가능)
                </span>
                <span className="text-[11px] text-slate-400">
                  클릭하여 목록에 추가하거나 제외
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
                      className={`flex flex-col text-left p-3 rounded-[10px] border text-xs transition-all cursor-pointer ${
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

          {/* Right Column: User Request Summary Notepad */}
          <aside className="xl:col-span-5 xl:sticky xl:top-6 card-enterprise bg-white overflow-hidden">
            {/* Notepad Header */}
            <div className="px-5 py-4 border-b border-amber-200/80 bg-amber-50/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-[8px] bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
                  <NotebookPen className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-[#172033] truncate">
                    요청사항 요약 메모장
                  </h2>
                  <p className="text-[11px] text-slate-500 truncate">
                    입력한 조건과 요청사항을 한눈에 정리·메모
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleFillMemoFromSummary}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-[#2563EB] bg-white border border-blue-200 rounded-[7px] hover:bg-blue-50 transition-colors cursor-pointer whitespace-nowrap"
                  title="현재 입력된 분석 조건과 요청사항을 아래 메모장에 채웁니다"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>요약 채우기</span>
                </button>
                {requestMemo && (
                  <button
                    type="button"
                    onClick={() => onChangeRequestMemo('')}
                    className="p-1.5 text-slate-500 hover:text-red-600 bg-white border border-slate-200 rounded-[7px] transition-colors cursor-pointer"
                    title="메모 지우기"
                  >
                    <Eraser className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="p-5 space-y-4">
              {/* Live Auto-Summary of Current User Requests */}
              <div className="p-3.5 rounded-[10px] bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#172033]">
                    실시간 요청사항 자동 요약
                  </span>
                  <span className="text-slate-400 tabular-nums">
                    {summaryLines.length}개 항목
                  </span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600 leading-relaxed">
                  {summaryLines.map((line, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mt-1.5 shrink-0" />
                      <span className="break-words">{line}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Analysis Run Title (Shown in History 001, 002...) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="analysis-run-title"
                    className="text-xs font-semibold text-[#172033]"
                  >
                    분석 제목 (히스토리 비교용)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    미입력 시 자동 제목 부여
                  </span>
                </div>
                <input
                  id="analysis-run-title"
                  type="text"
                  value={analysisTitle}
                  onChange={(e) => onChangeAnalysisTitle(e.target.value)}
                  placeholder="예: H100 클러스터 3년 운영비 1차 분석"
                  className="w-full px-3 py-2 text-xs font-medium text-[#172033] bg-white border border-slate-200 rounded-[8px] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] placeholder:text-slate-400"
                />
              </div>

              {/* Editable Notepad Area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="request-summary-memo"
                    className="text-xs font-semibold text-[#172033]"
                  >
                    메모장 (직접 요약·수정)
                  </label>
                  <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                    {requestMemo.length}자
                  </span>
                </div>
                <textarea
                  id="request-summary-memo"
                  value={requestMemo}
                  onChange={(e) => onChangeRequestMemo(e.target.value)}
                  rows={8}
                  placeholder={
                    '분석 전 핵심 요청사항을 간단히 메모해 두세요.\n\n예:\n- H100 클러스터 36개월 운영비 위주\n- 전력 단가 상승분 및 냉각비 절감 포인트 집중 확인\n- 상단 "요약 채우기" 버튼을 누르면 현재 조건이 자동 정리됩니다.'
                  }
                  className="w-full px-3.5 py-3 text-xs text-[#172033] bg-amber-50/40 border border-amber-200/90 rounded-[10px] resize-y focus:outline-none focus:bg-amber-50/20 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 placeholder:text-slate-400 leading-relaxed"
                />
                <p className="mt-1.5 text-[11px] text-slate-500 leading-relaxed">
                  ※ 메모장에 적은 요약 내용은 LLM 분석 및 좌측 메신저 상담 시 함께 전달됩니다.
                </p>
              </div>
            </div>
          </aside>
        </div>

        {/* AIDC Infrastructure & Operation Specifications Card */}
        <div className="card-enterprise p-6 sm:p-8 mb-8 bg-white">
          <div className="flex items-start gap-3 mb-6">
            <div className="w-9 h-9 rounded-[10px] bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#172033]">
                AIDC 운영 및 인프라 사양 입력
              </h2>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                사용 시점, 기간, GPU 시스템, 스토리지 용량 및 인터넷전용회선(DIA) 대역폭 조건을 입력하면 비용 산정에 함께 반영됩니다.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. AIDC 사용 시점, GPU서버 가동 시점(Commencement date) */}
            <div>
              <label
                htmlFor="aidc-commencement-date"
                className="block text-xs font-semibold text-[#172033] mb-2"
              >
                1. AIDC 사용 시점, GPU서버 가동 시점(Commencement date)
              </label>
              <input
                id="aidc-commencement-date"
                type="date"
                value={aidcSpecs.commencementDate}
                onChange={(e) => updateSpec('commencementDate', e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm text-[#172033] bg-slate-50 border border-slate-200 rounded-[10px] focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] font-sans tabular-nums"
              />
            </div>

            {/* 2. AIDC 사용 기간 */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <label
                  htmlFor="aidc-usage-duration"
                  className="block text-xs font-semibold text-[#172033]"
                >
                  2. AIDC 사용 기간
                </label>
                {aidcSpecs.usageDuration && (
                  <span className="text-[11px] font-mono font-semibold text-[#2563EB] tabular-nums">
                    {aidcSpecs.usageDuration}
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  id="aidc-usage-duration"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={monthInputDisplay}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, '').replace(/^0+/, '');
                    updateSpec('usageDuration', cleaned ? `${cleaned}개월` : '');
                  }}
                  placeholder="개월 수로만 입력해 주세요 (최대 60개월)"
                  className={`w-full pl-3.5 pr-12 py-2.5 text-sm text-[#172033] bg-slate-50 border rounded-[10px] focus:outline-none focus:bg-white focus:ring-1 placeholder:text-slate-400 tabular-nums ${
                    isDurationOverLimit
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                      : 'border-slate-200 focus:border-[#2563EB] focus:ring-[#2563EB]'
                  }`}
                />
                {monthInputDisplay && (
                  <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">
                    개월
                  </span>
                )}
              </div>

              {/* Year-based slider bar ending at 5년(60개월) with pixel-aligned ticks */}
              <div className="mt-3 px-3.5 pt-3.5 pb-2.5 rounded-[10px] bg-slate-50 border border-slate-200/80">
                <div className="mx-7">
                  <div className="relative h-5 flex items-center">
                    {/* Track background & active fill */}
                    <div className="absolute inset-x-0 h-2 rounded-full bg-slate-200 pointer-events-none overflow-hidden">
                      <div
                        className="h-full bg-[#2563EB] transition-all duration-150"
                        style={{
                          width: `calc(8px + (100% - 16px) * ${(sliderYears - 1) / 4})`,
                        }}
                      />
                    </div>

                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      aria-label="AIDC 사용 기간 년수 선택 바 (1년~5년(60개월))"
                      value={sliderYears}
                      onChange={(e) => {
                        const years = Number(e.target.value);
                        updateSpec('usageDuration', `${years}년 (${years * 12}개월)`);
                      }}
                      className="relative z-10 w-full h-5 bg-transparent appearance-none cursor-pointer focus:outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#2563EB] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#2563EB] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-sm"
                    />
                  </div>

                  {/* Labels positioned to match exact thumb center at each step */}
                  <div className="relative h-8 mt-1">
                    {DURATION_YEAR_STEPS.map((step) => {
                      const isActive =
                        aidcSpecs.usageDuration === step.value ||
                        parsedDurationMonths === step.years * 12;
                      const fraction = (step.years - 1) / 4;
                      return (
                        <button
                          key={step.years}
                          type="button"
                          onClick={() => updateSpec('usageDuration', step.value)}
                          style={{
                            left: `calc(8px + (100% - 16px) * ${fraction})`,
                          }}
                          className="absolute top-0 -translate-x-1/2 flex flex-col items-center gap-0.5 cursor-pointer group"
                        >
                          <span
                            className={`w-[2px] h-1.5 rounded-full transition-colors ${
                              isActive
                                ? 'bg-[#2563EB]'
                                : 'bg-slate-300 group-hover:bg-slate-500'
                            }`}
                          />
                          <span
                            className={`text-[11px] font-mono tabular-nums whitespace-nowrap px-1.5 py-0.5 rounded-[5px] transition-colors ${
                              isActive
                                ? 'bg-blue-100 text-[#2563EB] font-bold'
                                : 'text-slate-500 group-hover:text-[#172033]'
                            }`}
                          >
                            {step.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
                ※ AIDC 사용 기간은 통상적인 GPU System 내용연수인 최대 60개월까지 입력 가능합니다.
              </p>

              {isDurationOverLimit && (
                <p className="mt-1 text-[11px] font-semibold text-red-600">
                  최대 60개월(5년) 이내로 입력해 주세요.
                </p>
              )}

              <div className="mt-3">
                <span className="block text-xs font-semibold text-[#172033] mb-1.5">
                  AIDC 사용 기간 종료일
                </span>
                <div
                  aria-live="polite"
                  className={`w-full px-3.5 py-2.5 text-xs rounded-[10px] border transition-colors leading-relaxed ${
                    usageEndDate
                      ? 'bg-blue-50/60 border-blue-200 text-[#172033] font-semibold tabular-nums'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  {usageEndDate ??
                    (isDurationOverLimit
                      ? '사용 기간을 최대 60개월(5년) 이내로 입력하면 종료일이 계산됩니다.'
                      : '가동 시점(Commencement date)과 사용 기간을 입력하면 연도-월-일 형태로 자동 표시됩니다.')}
                </div>
              </div>
            </div>

            {/* 3. 사용하고자 하는 GPU System 종류를 선택하시오. */}
            <div>
              <label
                htmlFor="aidc-gpu-system"
                className="block text-xs font-semibold text-[#172033] mb-2"
              >
                3. 사용하고자 하는 GPU System 종류를 선택하시오.
              </label>
              <select
                id="aidc-gpu-system"
                value={
                  (GPU_SYSTEM_OPTIONS as readonly string[]).includes(aidcSpecs.gpuSystemType)
                    ? aidcSpecs.gpuSystemType
                    : ''
                }
                onChange={(e) => {
                  const val = e.target.value;
                  const spec = GPU_SYSTEM_SPECS[val];
                  onChangeAidcSpecs({
                    ...aidcSpecs,
                    gpuSystemType: val,
                    gpuConfig: spec?.gpuConfig ?? '',
                    gpuCoolingType: spec?.coolingType ?? '',
                  });
                }}
                className="w-full px-3.5 py-2.5 text-sm text-[#172033] bg-slate-50 border border-slate-200 rounded-[10px] focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              >
                <option value="">GPU System 종류를 선택하세요</option>
                {GPU_SYSTEM_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              <div className="mt-3 space-y-2.5">
                <div>
                  <span className="block text-xs font-semibold text-[#172033] mb-1.5">
                    GPU 구성
                  </span>
                  <div
                    aria-live="polite"
                    className={`w-full px-3.5 py-2.5 text-xs rounded-[10px] border transition-colors leading-relaxed ${
                      GPU_SYSTEM_SPECS[aidcSpecs.gpuSystemType]
                        ? 'bg-blue-50/60 border-blue-200 text-[#172033] font-medium tabular-nums'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    {GPU_SYSTEM_SPECS[aidcSpecs.gpuSystemType]?.gpuConfig ??
                      'GPU System 종류를 선택하면 GPU 구성이 표시됩니다.'}
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-semibold text-[#172033] mb-1.5">
                    데이터센터 권장 냉각 방식
                  </span>
                  <div
                    aria-live="polite"
                    className={`w-full px-3.5 py-2.5 text-xs rounded-[10px] border transition-colors leading-relaxed ${
                      GPU_SYSTEM_SPECS[aidcSpecs.gpuSystemType]
                        ? 'bg-blue-50/60 border-blue-200 text-[#172033] font-medium tabular-nums'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    {GPU_SYSTEM_SPECS[aidcSpecs.gpuSystemType]?.coolingType ??
                      'GPU System 종류를 선택하면 권장 냉각 방식이 표시됩니다.'}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Storage 구축 용량을 선택하시오. */}
            <div>
              <label
                htmlFor="aidc-storage-capacity"
                className="block text-xs font-semibold text-[#172033] mb-2"
              >
                4. Storage 구축 용량을 선택하세요.
              </label>
              <select
                id="aidc-storage-capacity"
                value={
                  (STORAGE_CAPACITY_OPTIONS as readonly string[]).includes(aidcSpecs.storageCapacity)
                    ? aidcSpecs.storageCapacity
                    : ''
                }
                onChange={(e) => {
                  const val = e.target.value;
                  onChangeAidcSpecs({
                    ...aidcSpecs,
                    storageCapacity: val,
                    storagePerGpuRequirement: STORAGE_PER_GPU_REQUIREMENTS[val] ?? '',
                  });
                }}
                className="w-full px-3.5 py-2.5 text-sm text-[#172033] bg-slate-50 border border-slate-200 rounded-[10px] focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]"
              >
                <option value="">Storage 구축 용량을 선택하세요</option>
                {STORAGE_CAPACITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              <div className="mt-3">
                <span className="block text-xs font-semibold text-[#172033] mb-1.5">
                  GPU System 1개당 Storage 필요량
                </span>
                <div
                  aria-live="polite"
                  className={`w-full px-3.5 py-2.5 text-xs rounded-[10px] border transition-colors leading-relaxed ${
                    STORAGE_PER_GPU_REQUIREMENTS[aidcSpecs.storageCapacity]
                      ? 'bg-blue-50/60 border-blue-200 text-[#172033] font-medium tabular-nums'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  {STORAGE_PER_GPU_REQUIREMENTS[aidcSpecs.storageCapacity] ??
                    'Storage 구축 용량을 선택하면 GPU System 1개당 필요량이 표시됩니다.'}
                </div>
              </div>
            </div>

            {/* 5. 사용하고자 하는 인터넷전용회선(DIA) Bandwidth 를 입력하시오. */}
            <div className="md:col-span-2">
              <label
                htmlFor="aidc-dia-bandwidth"
                className="block text-xs font-semibold text-[#172033] mb-2"
              >
                5. 사용하고자 하는 인터넷전용회선(DIA) Bandwidth 를 입력하시오.
              </label>
              <input
                id="aidc-dia-bandwidth"
                type="text"
                value={aidcSpecs.diaBandwidth}
                onChange={(e) => updateSpec('diaBandwidth', e.target.value)}
                placeholder="예: 100 Gbps (또는 400G 이중화)"
                className="w-full px-3.5 py-2.5 text-sm text-[#172033] bg-slate-50 border border-slate-200 rounded-[10px] focus:outline-none focus:bg-white focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] placeholder:text-slate-400"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {DIA_BANDWIDTH_PRESETS.map((bw) => (
                  <button
                    key={bw}
                    type="button"
                    onClick={() => updateSpec('diaBandwidth', bw)}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-[6px] border transition-colors cursor-pointer ${
                      aidcSpecs.diaBandwidth === bw
                        ? 'bg-blue-50 text-[#2563EB] border-blue-200 font-semibold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {bw}
                  </button>
                ))}
              </div>
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
