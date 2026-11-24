import React, { useState } from 'react';
import { 
  BarChart3, 
  RotateCcw, 
  CheckCircle2, 
  FileText, 
  Layers, 
  TrendingDown, 
  Download, 
  ShieldCheck, 
  Info, 
  Bot, 
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { UploadedDataCenterDoc } from '../types';
import { CORE_COST_ITEMS, CONDITIONAL_COST_ITEMS } from '../data/costTaxonomyData';
import { CostCategoryTaxonomy } from '../components/cost/CostCategoryTaxonomy';

interface DashboardPreviewPageProps {
  uploadedDoc: UploadedDataCenterDoc;
  onNewAnalysis: () => void;
}

export const DashboardPreviewPage: React.FC<DashboardPreviewPageProps> = ({
  uploadedDoc,
  onNewAnalysis,
}) => {
  const [downloadNotice, setDownloadNotice] = useState(false);

  const handleDownloadReport = () => {
    setDownloadNotice(true);
    setTimeout(() => setDownloadNotice(false), 3000);
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] bg-slate-50 py-10 px-8">
      <div className="max-w-[1440px] mx-auto">
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#2563EB] mb-1">
              <span>AI Data Center Cost Intelligence</span>
              <span>/</span>
              <span className="text-slate-500">운영비 분석 결과 대시보드</span>
            </div>
            <h1 className="text-2xl font-bold text-[#172033] tracking-tight">
              데이터센터 12대 운영비 분석 및 예측 결과
            </h1>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
              <span>분석 문서: <strong className="text-slate-800 font-mono">{uploadedDoc.name}</strong></span>
              <span>·</span>
              <span>분석 일시: {uploadedDoc.uploadedAt.toLocaleDateString('ko-KR')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-[8px] hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>분석 보고서(PDF) 다운로드</span>
            </button>

            <button
              onClick={onNewAnalysis}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-blue-700 rounded-[8px] transition-colors shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>새로운 서류 분석하기</span>
            </button>
          </div>
        </div>

        {/* Download Toast Notification */}
        {downloadNotice && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-[12px] bg-[#172033] text-white border border-slate-700 shadow-xl flex items-center gap-3 text-xs animate-in fade-in duration-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-slate-100">보고서 내보내기 준비 완료</p>
              <p className="text-slate-400">
                [{uploadedDoc.name.replace('.pdf', '')}_비용_분석_보고서.pdf] 다운로드 파일이 생성되었습니다.
              </p>
            </div>
          </div>
        )}

        {/* Notice of Strict Data Integrity Policy */}
        <div className="mb-8 p-5 rounded-[12px] bg-white border border-slate-200 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-[8px] bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#172033] mb-1">
                기업용 B2B 비용 분류 및 조건부 입력 원칙 준수 안내
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                본 대시보드는 실제 데이터센터 운영비의 오차를 방지하기 위해 
                <strong> 고정비, 사용량 연동 비용, 자산 감가상각비, 조건부 입력 비용</strong>을 명확히 분리하여 산정합니다. 
                입력되지 않은 조건부 비용 항목(소모품비, 지급수수료 등)은 임의로 0원 처리하거나 추정하지 않고 
                <strong className="text-slate-800"> [미입력 또는 산정 제외]</strong> 상태로 독립 표시됩니다.
              </p>
            </div>
          </div>
        </div>

        {/* 12 Core Cost Items & Conditional Framework */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-[#172033]">
                12대 주요 비용 항목 및 조건부 비용 반영 현황
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                업로드된 PDF에서 추출된 항목별 분류 및 세부 점검 내역입니다.
              </p>
            </div>
          </div>

          <CostCategoryTaxonomy />
        </div>

        {/* Future Expansion Architecture Notice for Teammates */}
        <div className="card-enterprise p-6 bg-slate-900 text-white border border-slate-800 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-[10px] bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-bold text-white">
                    팀원 협업 및 향후 확장 기능 연동 인터페이스
                  </h4>
                  <span className="text-[10px] font-mono text-blue-300 bg-blue-900/60 px-2 py-0.5 rounded-[4px] border border-blue-700/60">
                    Integration Ready
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
                  본 프로토타입은 향후 팀원이 개발할 <strong>GPU/CPU/Storage 구성 시뮬레이터</strong>, 
                  <strong>월별 운영비 추이 그래프</strong>, 및 <strong>AI Agent 실시간 대화형 인터페이스</strong>와 
                  손쉽게 결합될 수 있도록 <code>types/cost.ts</code>를 통해 표준화되어 있습니다.
                </p>
              </div>
            </div>

            <button
              onClick={onNewAnalysis}
              className="px-5 py-2.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-[8px] transition-colors shrink-0 cursor-pointer"
            >
              새 문서 업로드
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
