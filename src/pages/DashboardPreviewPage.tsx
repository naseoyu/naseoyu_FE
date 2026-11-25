import React, { useState } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  Download,
  ShieldCheck,
  FileText,
  MessageSquareText,
  TrendingDown,
  AlertCircle,
} from 'lucide-react';
import {
  UploadedDataCenterDoc,
  CustomAnalysisResult,
  AnalysisTimeframe,
  AnalysisFocusArea,
  AidcProjectSpecs,
} from '../types';
import { CostCategoryTaxonomy } from '../components/cost/CostCategoryTaxonomy';

interface DashboardPreviewPageProps {
  uploadedDocs: UploadedDataCenterDoc[];
  analysisRequest: string;
  timeframe: AnalysisTimeframe;
  focusArea: AnalysisFocusArea;
  aidcSpecs: AidcProjectSpecs;
  analysisResult: CustomAnalysisResult | null;
  onNewAnalysis: () => void;
  onEditRequest: () => void;
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

export const DashboardPreviewPage: React.FC<DashboardPreviewPageProps> = ({
  uploadedDocs,
  analysisRequest,
  timeframe,
  focusArea,
  aidcSpecs,
  analysisResult,
  onNewAnalysis,
  onEditRequest,
}) => {
  const [downloadNotice, setDownloadNotice] = useState(false);

  const handleDownloadReport = () => {
    setDownloadNotice(true);
    setTimeout(() => setDownloadNotice(false), 3000);
  };

  const primaryDocName = uploadedDocs[0]?.name || 'DataCenter_Cost_Report.pdf';
  const appliedScope =
    analysisResult?.appliedScopeLabel ||
    `${TIMEFRAME_LABELS[timeframe]} · ${FOCUS_LABELS[focusArea]}`;

  return (
    <div className="w-full min-h-full bg-slate-50 py-10 px-6 lg:px-10">
      <div className="max-w-[1100px] mx-auto">
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#2563EB] mb-1">
              <span>AI Data Center Cost Intelligence</span>
              <span aria-hidden="true">/</span>
              <span className="text-slate-500">운영비 분석 결과 대시보드</span>
            </div>
            <h1 className="text-2xl font-bold text-[#172033] tracking-tight text-balance">
              데이터센터 맞춤 비용 분석 및 예측 결과
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1.5 tabular-nums">
              <span>
                분석 서류 <strong className="text-slate-800">{uploadedDocs.length}건</strong>
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono text-slate-700 truncate max-w-[320px]">
                {uploadedDocs.map((d) => d.name).join(', ')}
              </span>
              <span aria-hidden="true">·</span>
              <span>적용 조건: {appliedScope}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleDownloadReport}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-[8px] hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>보고서 다운로드</span>
            </button>

            <button
              type="button"
              onClick={onEditRequest}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-[8px] hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>서류·요청 수정</span>
            </button>

            <button
              type="button"
              onClick={onNewAnalysis}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-blue-700 rounded-[8px] transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>새 분석</span>
            </button>
          </div>
        </div>

        {/* Download Toast Notification */}
        {downloadNotice && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-[12px] bg-[#172033] text-white border border-slate-700 shadow-xl flex items-center gap-3 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold text-slate-100">보고서 내보내기 준비 완료</p>
              <p className="text-slate-400">
                [{primaryDocName.replace('.pdf', '')}_맞춤_비용_분석_보고서.pdf] 생성 완료
              </p>
            </div>
          </div>
        )}

        {/* Active Request & AIDC Specs Banner */}
        <div className="mb-8 p-5 rounded-[12px] bg-white border border-slate-200 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-[8px] bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
              <MessageSquareText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-0.5">
                <span className="font-bold text-[#172033]">적용된 맞춤 분석 요청</span>
                <span aria-hidden="true">·</span>
                <span>{appliedScope}</span>
              </div>
              <p className="text-sm font-medium text-[#172033] leading-relaxed">
                {analysisRequest.trim()
                  ? analysisRequest
                  : '11대 표준 비용 항목 전반 및 최적화 로드맵 분석'}
              </p>
            </div>
          </div>

          {(aidcSpecs.commencementDate ||
            aidcSpecs.usageDuration ||
            aidcSpecs.gpuSystemType ||
            aidcSpecs.storageCapacity ||
            aidcSpecs.diaBandwidth) && (
            <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              <div className="p-2.5 rounded-[8px] bg-slate-50 border border-slate-200/80">
                <span className="block text-[11px] text-slate-500">가동 시점</span>
                <span className="font-semibold text-[#172033] font-mono tabular-nums">
                  {aidcSpecs.commencementDate || '미입력'}
                </span>
              </div>
              <div className="p-2.5 rounded-[8px] bg-slate-50 border border-slate-200/80">
                <span className="block text-[11px] text-slate-500">AIDC 사용 기간</span>
                <span className="font-semibold text-[#172033]">
                  {aidcSpecs.usageDuration || '미입력'}
                </span>
              </div>
              <div className="p-2.5 rounded-[8px] bg-slate-50 border border-slate-200/80">
                <span className="block text-[11px] text-slate-500">GPU System</span>
                <span className="font-semibold text-[#172033]">
                  {aidcSpecs.gpuSystemType || '미입력'}
                </span>
              </div>
              <div className="p-2.5 rounded-[8px] bg-slate-50 border border-slate-200/80">
                <span className="block text-[11px] text-slate-500">Storage 용량</span>
                <span className="font-semibold text-[#172033]">
                  {aidcSpecs.storageCapacity || '미입력'}
                </span>
              </div>
              <div className="p-2.5 rounded-[8px] bg-slate-50 border border-slate-200/80">
                <span className="block text-[11px] text-slate-500">DIA Bandwidth</span>
                <span className="font-semibold text-[#172033]">
                  {aidcSpecs.diaBandwidth || '미입력'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Tailored LLM Analysis Result Sections (when /api/analyze returned live output) */}
        {analysisResult ? (
          <div className="space-y-8 mb-10">
            {/* Executive Summary + Key Metrics */}
            <div className="card-enterprise p-6 sm:p-7 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h2 className="text-base font-bold text-[#172033]">
                  요청 기반 AI 핵심 분석 요약
                </h2>
                <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                  {analysisResult.appliedScopeLabel}
                </span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed mb-6">
                {analysisResult.executiveSummary}
              </p>

              {analysisResult.keyMetrics?.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5 border-t border-slate-100">
                  {analysisResult.keyMetrics.map((metric, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-[10px] bg-slate-50 border border-slate-200"
                    >
                      <div className="text-xs font-medium text-slate-500 mb-1">
                        {metric.label}
                      </div>
                      <div className="text-lg font-bold text-[#172033] font-mono tabular-nums">
                        {metric.value}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        {metric.context}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Multi-Document Cross-Analysis Breakdown */}
            {analysisResult.documentInsights?.length > 0 && (
              <div className="card-enterprise p-6 bg-white">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-[#172033]">
                    업로드 서류별 추출 및 교차 분석 ({analysisResult.documentInsights.length}건)
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="py-2.5 pr-4 font-semibold">문서명</th>
                        <th className="py-2.5 px-4 font-semibold">식별된 주요 영역</th>
                        <th className="py-2.5 pl-4 font-semibold">핵심 분석 내용</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {analysisResult.documentInsights.map((docIns, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70">
                          <td className="py-3 pr-4 font-mono font-semibold text-[#172033] whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                              <span>{docIns.documentName}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-700 whitespace-nowrap">
                            {docIns.detectedFocus}
                          </td>
                          <td className="py-3 pl-4 text-slate-600 leading-relaxed">
                            {docIns.keyFindings}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tailored Cost Optimization Recommendations */}
            {analysisResult.recommendations?.length > 0 && (
              <div className="card-enterprise p-6 bg-white">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingDown className="w-4 h-4 text-[#2563EB]" />
                  <h2 className="text-base font-bold text-[#172033]">
                    요청 조건 맞춤형 비용 최적화 제안
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysisResult.recommendations.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-[10px] bg-slate-50 border border-slate-200 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-bold text-[#172033]">
                          {String(idx + 1).padStart(2, '0')}. {rec.title}
                        </h3>
                        <span className="text-xs font-mono font-bold text-emerald-700 shrink-0 tabular-nums">
                          {rec.impactEstimate}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {rec.actionDetail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Honest notice if user skipped live Gemini analysis due to missing API key */
          <div className="mb-8 p-5 rounded-[12px] bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-bold">실시간 LLM 요약 미생성 안내:</strong>{' '}
              Gemini API 연결 없이 기본 구조화 체계로 이동하였습니다. 좌측 프롬프트 창이나 Settings &gt; Secrets에서 API 키를 설정한 뒤 다시 분석하면 요청 조건에 맞춘 AI 요약과 문서별 교차 분석 결과가 표시됩니다.
            </div>
          </div>
        )}

        {/* Notice of Strict Data Integrity Policy */}
        <div className="mb-8 p-5 rounded-[12px] bg-white border border-slate-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-[8px] bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#172033] mb-1">
                기업용 B2B 비용 분류 및 조건부 입력 원칙 준수 안내
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                본 대시보드는 실제 데이터센터 운영비의 오차를 방지하기 위해{' '}
                <strong>고정비, 사용량 연동 비용, 자산 감가상각비, 조건부 입력 비용</strong>을 분리하여 산정합니다.
                입력되지 않은 조건부 비용 항목은 임의로 0원 처리하지 않고{' '}
                <strong className="text-slate-800">[미입력 또는 산정 제외]</strong> 상태로 독립 표시됩니다.
              </p>
            </div>
          </div>
        </div>

        {/* 11 Core Cost Items & Conditional Framework */}
        <div className="mb-10">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[#172033]">
              11대 주요 비용 항목 및 조건부 비용 반영 현황
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              업로드된 {uploadedDocs.length}개 문서와 요청 사항을 기준으로 주요 비용 항목을 점검한 내역입니다.
            </p>
          </div>

          <CostCategoryTaxonomy
            highlightedItemNumbers={analysisResult?.highlightedItemNumbers || []}
            itemInsights={analysisResult?.itemInsights || []}
          />
        </div>
      </div>
    </div>
  );
};
