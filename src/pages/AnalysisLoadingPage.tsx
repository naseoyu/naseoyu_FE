import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  Loader2,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  FileText,
  MessageSquareText,
} from 'lucide-react';
import {
  UploadedDataCenterDoc,
  AnalysisStepInfo,
  AnalysisStepId,
  AnalysisTimeframe,
  AnalysisFocusArea,
  CustomAnalysisResult,
  AidcProjectSpecs,
} from '../types';

interface AnalysisLoadingPageProps {
  uploadedDocs: UploadedDataCenterDoc[];
  analysisTitle?: string;
  isAdditionalRun?: boolean;
  addedDocCount?: number;
  analysisRequest: string;
  requestMemo?: string;
  timeframe: AnalysisTimeframe;
  focusArea: AnalysisFocusArea;
  aidcSpecs: AidcProjectSpecs;
  analysisRunKey: number;
  onAnalysisComplete: (result: CustomAnalysisResult | null) => void;
  onProceedToDashboard: () => void;
  onBackToUpload: () => void;
}

const TIMEFRAME_LABELS: Record<AnalysisTimeframe, string> = {
  all: '전체 기간',
  '1y': '1년치 기준',
  '3y': '3년치 집중',
  '5y': '5년 장기',
};

const FOCUS_LABELS: Record<AnalysisFocusArea, string> = {
  all: '11대 항목 전체',
  power: '전력료·냉각 중점',
  depreciation: '자산 감가상각 중점',
  opex_only: '실질 OPEX 중심',
  maintenance: '수선유지·외주 중점',
};

export const AnalysisLoadingPage: React.FC<AnalysisLoadingPageProps> = ({
  uploadedDocs,
  analysisTitle = '',
  isAdditionalRun = false,
  addedDocCount = 0,
  analysisRequest,
  requestMemo = '',
  timeframe,
  focusArea,
  aidcSpecs,
  analysisRunKey,
  onAnalysisComplete,
  onProceedToDashboard,
  onBackToUpload,
}) => {
  const [currentStep, setCurrentStep] = useState<AnalysisStepId>(1);
  const [progressPercent, setProgressPercent] = useState<number>(12);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [apiError, setApiError] = useState<string | null>(null);
  const [retryCounter, setRetryCounter] = useState<number>(0);

  const effectiveRequestLabel = analysisRequest.trim()
    ? analysisRequest.trim()
    : `${TIMEFRAME_LABELS[timeframe]} · ${FOCUS_LABELS[focusArea]} 표준 분석`;

  const steps: AnalysisStepInfo[] = [
    {
      step: 1,
      title: 'STEP 1. 문서 읽기 및 AIDC 운영 데이터 확인',
      subtitle: 'Document Ingestion & AIDC Data Check',
      description: `업로드된 ${uploadedDocs.length}개 PDF 문서의 텍스트·표 데이터를 추출하고 AIDC 운영 데이터 및 "${TIMEFRAME_LABELS[timeframe]} / ${FOCUS_LABELS[focusArea]}" 분석 조건을 확인합니다.`,
      status:
        currentStep > 1 || isCompleted
          ? 'completed'
          : currentStep === 1
          ? 'in_progress'
          : 'pending',
    },
    {
      step: 2,
      title: 'STEP 2. 비용 항목 분석 및 운영비 예측',
      subtitle: 'Cost Breakdown & OPEX Forecasting',
      description:
        '사용자 요청 사항에 해당하는 핵심 비용 항목(전력료, 감가상각비, 외주용역비 등)을 분석하여 기간별 운영비를 예측합니다.',
      status:
        currentStep > 2 || isCompleted
          ? 'completed'
          : currentStep === 2
          ? 'in_progress'
          : 'pending',
    },
    {
      step: 3,
      title: 'STEP 3. 비용 최적화 방안 및 추천 결과 생성',
      subtitle: 'Cost Optimization & Recommendation Synthesis',
      description:
        '분석된 비용 구조를 바탕으로 정량적 절감 포인트와 맞춤형 비용 최적화 추천 결과를 생성합니다.',
      status: isCompleted
        ? 'completed'
        : currentStep === 3
        ? 'in_progress'
        : 'pending',
    },
  ];

  // Elapsed timer while running
  useEffect(() => {
    if (isCompleted || apiError) return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isCompleted, apiError]);

  // Smoothly advance visual progress up to 90% while awaiting server response
  useEffect(() => {
    if (isCompleted || apiError) return;

    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 90) return 90;
        const next = Math.min(90, prev + 4);
        if (next >= 65) {
          setCurrentStep(3);
        } else if (next >= 35) {
          setCurrentStep(2);
        } else {
          setCurrentStep(1);
        }
        return next;
      });
    }, 350);

    return () => clearInterval(interval);
  }, [isCompleted, apiError]);

  const runAnalysis = useCallback(async () => {
    setApiError(null);
    setIsCompleted(false);
    setCurrentStep(1);
    setProgressPercent(12);
    setElapsedSeconds(0);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documents: uploadedDocs.map((d) => ({
            id: d.id,
            name: d.name,
            sizeBytes: d.sizeBytes,
            pageCount: d.pageCount,
            sourceType: d.sourceType,
            documentSummary: d.documentSummary,
            base64Data: d.base64Data,
          })),
          analysisTitle,
          isAdditional: isAdditionalRun,
          analysisRequest,
          requestMemo,
          timeframe: TIMEFRAME_LABELS[timeframe],
          focusArea: FOCUS_LABELS[focusArea],
          aidcSpecs,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setApiError(
          data.error || 'LLM 분석 요청 처리 중 오류가 발생했습니다.'
        );
        return;
      }

      onAnalysisComplete(data as CustomAnalysisResult);
      setCurrentStep(3);
      setProgressPercent(100);
      setIsCompleted(true);
    } catch (err) {
      setApiError(
        err instanceof Error
          ? `네트워크 오류: ${err.message}`
          : '분석 서버와 연결할 수 없습니다.'
      );
    }
  }, [uploadedDocs, analysisTitle, isAdditionalRun, analysisRequest, requestMemo, timeframe, focusArea, aidcSpecs, onAnalysisComplete]);

  useEffect(() => {
    void runAnalysis();
  }, [runAnalysis, analysisRunKey, retryCounter]);

  const totalPages = uploadedDocs.reduce((sum, d) => sum + d.pageCount, 0);

  return (
    <div className="w-full min-h-full bg-slate-50 py-10 px-6 lg:px-10">
      <div className="max-w-[980px] mx-auto">
        {/* Top Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <button
            type="button"
            onClick={onBackToUpload}
            className="text-xs font-semibold text-slate-600 hover:text-[#172033] transition-colors cursor-pointer"
          >
            ← 서류 업로드 및 요청 수정
          </button>

          <div className="flex items-center gap-2 text-xs text-slate-500 whitespace-nowrap">
            <span className="text-slate-400">1단계 서류 업로드</span>
            <span aria-hidden="true">/</span>
            <span className="font-bold text-[#2563EB]">2단계 LLM 분석</span>
            <span aria-hidden="true">/</span>
            <span className="text-slate-400">3단계 비용 결과</span>
          </div>
        </div>

        {/* Error Alert if API fails (e.g., missing GEMINI_API_KEY) */}
        {apiError && (
          <div className="mb-6 p-5 rounded-[12px] bg-red-50 border border-red-200 text-red-800 space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed space-y-1">
                <p className="font-bold text-sm text-red-900">
                  실시간 LLM 분석 요청을 완료할 수 없습니다
                </p>
                <p>{apiError}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pl-8">
              <button
                type="button"
                onClick={() => setRetryCounter((c) => c + 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-[8px] transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>분석 다시 시도</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onAnalysisComplete(null);
                  onProceedToDashboard();
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-[8px] transition-colors cursor-pointer"
              >
                <span>기본 비용 체계 대시보드로 이동</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Top Header Card */}
        <div className="card-enterprise p-6 sm:p-8 mb-8 bg-white">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#2563EB] mb-1.5">
                {isCompleted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">맞춤형 LLM 3단계 분석 완료</span>
                  </>
                ) : apiError ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="text-red-700">분석 중단됨</span>
                  </>
                ) : (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2563EB]" />
                    <span>맞춤형 AI 분석 진행 중</span>
                  </>
                )}
                {isAdditionalRun && (
                  <span className="px-2 py-0.5 text-[11px] font-semibold bg-blue-50 text-[#2563EB] border border-blue-200 rounded-[6px]">
                    서류 추가 분석{addedDocCount > 0 ? ` (+${addedDocCount}건)` : ''}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-[#172033] tracking-tight text-balance">
                {isCompleted
                  ? '요청 조건에 맞춘 데이터센터 분석이 완료되었습니다'
                  : isAdditionalRun
                  ? '추가 업로드된 서류를 통합하여 재분석하고 있습니다'
                  : '업로드된 서류를 요청 사항에 맞춰 분석하고 있습니다'}
              </h1>

              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                {isCompleted
                  ? '다중 문서 추출 데이터와 요청 조건을 반영한 비용 분석 결과 및 히스토리를 대시보드에서 확인하세요.'
                  : '문서 내 비용 표와 운영 지표를 파싱하여 사용자 요청 조건에 맞게 구조화하고 있습니다.'}
              </p>
            </div>

            <div className="p-4 rounded-[10px] bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5 shrink-0 md:min-w-[230px]">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">분석 대상</span>
                <strong className="text-slate-800 font-mono tabular-nums">
                  {uploadedDocs.length}건 ({totalPages}p)
                </strong>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">소요 시간</span>
                <strong className="text-slate-800 font-mono tabular-nums">
                  {String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:
                  {String(elapsedSeconds % 60).padStart(2, '0')}
                </strong>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400">분석 기간</span>
                <strong className="text-slate-800">
                  {TIMEFRAME_LABELS[timeframe]}
                </strong>
              </div>
            </div>
          </div>

          {/* Applied Request & Documents Strip */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-[10px] bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-[#172033]">
                <MessageSquareText className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>적용된 분석 요청 사항</span>
              </div>
              {analysisTitle.trim() && (
                <div className="text-xs font-bold text-[#172033]">
                  제목: {analysisTitle}
                </div>
              )}
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {effectiveRequestLabel}
              </p>
              {requestMemo.trim() && (
                <div className="pt-1.5 border-t border-slate-200/80 text-[11px] text-slate-600">
                  <span className="font-semibold text-amber-700">요약 메모: </span>
                  <span className="whitespace-pre-wrap">{requestMemo}</span>
                </div>
              )}
              <div className="text-[11px] text-slate-500 pt-1">
                <span>기간: {TIMEFRAME_LABELS[timeframe]}</span>
                <span className="mx-1.5" aria-hidden="true">·</span>
                <span>중점: {FOCUS_LABELS[focusArea]}</span>
              </div>
            </div>

            <div className="p-4 rounded-[10px] bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-[#172033]">
                <FileText className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>분석 대상 서류 ({uploadedDocs.length}건)</span>
              </div>
              <ul className="space-y-1 max-h-24 overflow-y-auto">
                {uploadedDocs.map((doc, idx) => (
                  <li key={doc.id} className="text-slate-600 truncate tabular-nums">
                    <span className="font-mono text-slate-400 mr-1.5">
                      {String(idx + 1).padStart(2, '0')}.
                    </span>
                    <span className="font-medium text-slate-800">{doc.name}</span>
                    <span className="text-slate-400 ml-1.5">({doc.pageCount}p)</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Overall Linear Progress Meter */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-700">전체 분석 진행률</span>
              <span className="font-bold text-[#2563EB] font-mono tabular-nums text-sm">
                {progressPercent}%
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
              <div
                className="bg-[#2563EB] h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* 3 Discrete Steps Breakdown */}
        <div className="space-y-4 mb-8">
          <h2 className="text-sm font-bold text-[#172033]">
            단계별 LLM 분석 프로세스
          </h2>

          {steps.map((s) => {
            const isStepDone = s.status === 'completed';
            const isStepActive = s.status === 'in_progress' && !apiError;
            const isStepPending = s.status === 'pending';

            return (
              <div
                key={s.step}
                className={`p-5 rounded-[12px] border transition-colors ${
                  isStepDone
                    ? 'bg-white border-emerald-300'
                    : isStepActive
                    ? 'bg-white border-[#2563EB] ring-1 ring-blue-200'
                    : 'bg-slate-50 border-slate-200 opacity-70'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-0.5 shrink-0">
                      {isStepDone ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : isStepActive ? (
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center">
                          <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-bold font-mono">
                          {s.step}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className={`text-sm font-bold ${
                            isStepPending ? 'text-slate-500' : 'text-[#172033]'
                          }`}
                        >
                          {s.title}
                        </h3>
                        <span className="text-[11px] font-medium text-slate-500">
                          {isStepDone
                            ? '· 완료'
                            : isStepActive
                            ? '· 진행 중'
                            : ''}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {s.description}
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 shrink-0 hidden sm:block">
                    {s.subtitle}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onBackToUpload}
            className="px-6 py-3.5 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-[12px] hover:bg-slate-50 transition-colors cursor-pointer w-full sm:w-auto"
          >
            서류 업로드로 돌아가기
          </button>

          {isCompleted ? (
            <button
              type="button"
              onClick={onProceedToDashboard}
              className="flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold text-white bg-[#2563EB] hover:bg-blue-700 rounded-[12px] shadow-xs transition-all cursor-pointer w-full sm:w-auto"
            >
              <span>비용 분석 결과 대시보드로 이동</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {!apiError && (
                <>
                  <Loader2 className="w-4 h-4 text-[#2563EB] animate-spin" />
                  <span>분석이 완료되면 결과 대시보드 이동 버튼이 활성화됩니다.</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
