import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Loader2, 
  Cpu, 
  Zap, 
  BarChart3, 
  TrendingDown, 
  ArrowRight, 
  FastForward,
  Info,
  Clock,
  Layers,
  Sparkles
} from 'lucide-react';
import { UploadedDataCenterDoc, AnalysisStepInfo, AnalysisStepId } from '../types';

interface AnalysisLoadingPageProps {
  uploadedDoc: UploadedDataCenterDoc;
  onProceedToDashboard: () => void;
  onBackToUpload: () => void;
}

export const AnalysisLoadingPage: React.FC<AnalysisLoadingPageProps> = ({
  uploadedDoc,
  onProceedToDashboard,
  onBackToUpload,
}) => {
  const [currentStep, setCurrentStep] = useState<AnalysisStepId>(1);
  const [progressPercent, setProgressPercent] = useState<number>(10);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // 5 Steps specified in Prompt Section 5
  const steps: AnalysisStepInfo[] = [
    {
      step: 1,
      title: 'STEP 1. PDF 문서 읽기 및 텍스트 추출',
      subtitle: 'PDF Document Ingestion & Text Extraction',
      description: '업로드된 PDF의 표, 서식, 인프라 사양 및 비용 내역 텍스트 블록을 읽고 파싱합니다.',
      status: currentStep > 1 || isCompleted ? 'completed' : currentStep === 1 ? 'in_progress' : 'pending',
    },
    {
      step: 2,
      title: 'STEP 2. 데이터센터 운영 데이터 확인',
      subtitle: 'Facility & Operational Data Verification',
      description: 'GPU 가속기 기종, 랙 수량, 전력 용량(kW), 냉각 방식(공랭/액체냉각)을 대조합니다.',
      status: currentStep > 2 || isCompleted ? 'completed' : currentStep === 2 ? 'in_progress' : 'pending',
    },
    {
      step: 3,
      title: 'STEP 3. 주요 비용 항목 분류 및 분석',
      subtitle: '11 Core Cost Categories Mapping',
      description: '전력료, 회선, 감가상각비, 수선유지비 등 11대 기본 비용 체계로 항목을 매핑합니다.',
      status: currentStep > 3 || isCompleted ? 'completed' : currentStep === 3 ? 'in_progress' : 'pending',
    },
    {
      step: 4,
      title: 'STEP 4. 운영비 계산 및 미래 비용 예측',
      subtitle: 'Opex Modeling & Future Cost Projection',
      description: '고정비, 사용량 연동 비용, 자산 감가상각비를 구분하여 중장기 운영비를 예측합니다.',
      status: currentStep > 4 || isCompleted ? 'completed' : currentStep === 4 ? 'in_progress' : 'pending',
    },
    {
      step: 5,
      title: 'STEP 5. 비용 최적화 방안 및 추천 결과 생성',
      subtitle: 'Cost Optimization Roadmap & AI Recommendations',
      description: '유휴 리소스 회수, PUE 효율 개선 등 정량적 절감 조치와 우선순위 로드맵을 수립합니다.',
      status: isCompleted ? 'completed' : currentStep === 5 ? 'in_progress' : 'pending',
    },
  ];

  // Timer counter
  useEffect(() => {
    if (isCompleted) return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isCompleted]);

  // Step-by-step simulated progress progression
  useEffect(() => {
    if (isCompleted) return;

    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        const next = prev + 3;
        if (next >= 100) {
          setIsCompleted(true);
          setCurrentStep(5);
          clearInterval(interval);
          return 100;
        }

        // Advance steps naturally based on progress thresholds
        if (next >= 85) {
          setCurrentStep(5);
        } else if (next >= 65) {
          setCurrentStep(4);
        } else if (next >= 42) {
          setCurrentStep(3);
        } else if (next >= 20) {
          setCurrentStep(2);
        } else {
          setCurrentStep(1);
        }

        return next;
      });
    }, 220); // Takes ~7 seconds to walk through all 5 stages

    return () => clearInterval(interval);
  }, [isCompleted]);

  // Fast forward for rapid evaluation testing
  const handleFastForward = () => {
    setProgressPercent(100);
    setCurrentStep(5);
    setIsCompleted(true);
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-slate-50 py-12 px-8">
      <div className="max-w-[1000px] mx-auto">
        {/* Transparent Simulation Notice Banner (Crucial Requirement: 명확한 시연용 구분) */}
        <div className="mb-6 p-4 rounded-[12px] bg-slate-100 border border-slate-300 text-xs text-[#172033] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-slate-600 shrink-0" />
            <span>
              <strong>프로토타입 시연 모드 (Demo Simulation Mode):</strong> 본 화면의 분석 단계 및 진행률은 UI/UX 검증을 위한 시연용 가상 파이프라인이며, 실제 LLM 백엔드 API는 연결되지 않은 상태입니다.
            </span>
          </div>

          {!isCompleted && (
            <button
              onClick={handleFastForward}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-[8px] hover:bg-slate-50 transition-colors shrink-0 cursor-pointer"
              title="시연 속도를 위해 100% 완료 상태로 즉시 전환"
            >
              <FastForward className="w-3.5 h-3.5 text-blue-600" />
              <span>시연용 즉시 완료</span>
            </button>
          )}
        </div>

        {/* Top Header Card */}
        <div className="card-enterprise p-8 mb-8 bg-white shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1.5">
                {!isCompleted ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse" />
                    <span>AI 분석 진행 중</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">5단계 분석 완료</span>
                  </>
                )}
              </div>

              {/* Title required by prompt: "AI 분석 중이라는 제목" */}
              <h1 className="text-2xl sm:text-3xl font-bold text-[#172033] tracking-tight">
                {!isCompleted
                  ? '데이터센터 운영 데이터 AI 분석 진행 중'
                  : '데이터센터 운영 데이터 분석이 완료되었습니다'}
              </h1>

              {/* Guidance sentences required by prompt */}
              <p className="mt-2 text-sm text-slate-600">
                {!isCompleted
                  ? '업로드한 데이터센터 자료를 분석하고 있습니다. 비용 항목별 데이터를 확인하고 최적화 가능성을 검토하고 있습니다.'
                  : '11대 기본 비용 항목 분류 및 최적화 추천안 도출이 완료되었습니다. 대시보드에서 결과를 확인하세요.'}
              </p>
            </div>

            {/* Target Document & Timer Card */}
            <div className="p-4 rounded-[10px] bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1 md:text-right shrink-0">
              <div>
                <span className="text-slate-400">분석 대상 파일:</span>{' '}
                <strong className="text-slate-800 font-mono">{uploadedDoc.name}</strong>
              </div>
              <div className="tabular-nums">
                <span className="text-slate-400">소요 시간:</span>{' '}
                <strong className="text-slate-800 font-mono">
                  00:{elapsedSeconds.toString().padStart(2, '0')}초
                </strong>
                <span className="text-slate-400 ml-2">({uploadedDoc.pageCount}p)</span>
              </div>
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

        {/* 5 Discrete Steps Breakdown (Required by Prompt) */}
        <div className="space-y-4 mb-8">
          <h2 className="text-sm font-bold text-[#172033] uppercase tracking-wider mb-2">
            단계별 분석 프로세스
          </h2>

          {steps.map((s) => {
            const isStepDone = s.status === 'completed';
            const isStepActive = s.status === 'in_progress';
            const isStepPending = s.status === 'pending';

            return (
              <div
                key={s.step}
                className={`p-5 rounded-[12px] border transition-all ${
                  isStepDone
                    ? 'bg-white border-emerald-300 shadow-xs'
                    : isStepActive
                    ? 'bg-white border-[#2563EB] ring-1 ring-blue-200 shadow-xs'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
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
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center text-xs font-bold font-mono">
                          {s.step}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-sm font-bold ${isStepPending ? 'text-slate-500' : 'text-[#172033]'}`}>
                          {s.title}
                        </h3>
                        {isStepActive && (
                          <span className="text-[10px] font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-[4px] border border-blue-200">
                            진행 중
                          </span>
                        )}
                        {isStepDone && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-[4px] border border-emerald-200">
                            완료
                          </span>
                        )}
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

        {/* Action Controls & Navigation to Dashboard */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
          <button
            onClick={onBackToUpload}
            className="px-6 py-3.5 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-[12px] hover:bg-slate-50 transition-colors cursor-pointer w-full sm:w-auto"
          >
            서류 업로드로 돌아가기
          </button>

          {isCompleted ? (
            /* Button to proceed to dashboard when all stages completed */
            <button
              onClick={onProceedToDashboard}
              className="flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-bold text-white bg-[#2563EB] hover:bg-blue-700 active:bg-blue-800 rounded-[12px] shadow-sm transition-all cursor-pointer w-full sm:w-auto"
            >
              <span>비용 분석 결과 대시보드로 이동</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="w-4 h-4 text-[#2563EB] animate-spin" />
              <span>모든 단계가 완료되면 대시보드 이동 버튼이 활성화됩니다...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
