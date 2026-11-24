import React from 'react';
import { 
  ArrowRight, 
  Cpu, 
  Zap, 
  BarChart3, 
  FileCheck2, 
  ShieldCheck, 
  Layers, 
  TrendingDown, 
  CheckCircle2, 
  Building2,
  ChevronRight,
  Database
} from 'lucide-react';
import { SAMPLE_DATA_CENTER_PRESETS } from '../data/costTaxonomyData';
import { PresetSampleDoc } from '../types';
import { CostCategoryTaxonomy } from '../components/cost/CostCategoryTaxonomy';

interface LandingPageProps {
  onStartUpload: () => void;
  onSelectPreset: (preset: PresetSampleDoc) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartUpload, onSelectPreset }) => {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 pt-20 pb-20">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="max-w-3xl">
            {/* Enterprise Domain Label */}
            <div className="flex items-center gap-2 text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-4">
              <span>B2B Enterprise AI Infrastructure FinOps</span>
              <span>·</span>
              <span>11대 표준 운영비 분석 체계</span>
            </div>

            {/* Main Title Required by Prompt */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#172033] leading-[1.15] text-balance">
              Smarter Data Center. <br />
              <span className="text-[#2563EB]">Better Cost Optimization.</span>
            </h1>

            {/* Description Required by Prompt */}
            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed text-balance">
              데이터센터 운영 데이터를 분석하고 AI 기반 비용 예측과 최적화 방안을 제공합니다.
            </p>

            {/* Primary Action Button */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={onStartUpload}
                className="flex items-center gap-2.5 px-8 py-4 text-base font-semibold text-white bg-[#2563EB] hover:bg-blue-700 active:bg-blue-800 rounded-[12px] shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <span>분석 시작하기</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => onSelectPreset(SAMPLE_DATA_CENTER_PRESETS[0])}
                className="flex items-center gap-2 px-6 py-4 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[12px] transition-all cursor-pointer"
              >
                <span>H100 512기 샘플로 즉시 체험</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* 3 Secondary Explanations Required by Prompt */}
            <div className="mt-12 pt-8 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-[8px] bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#172033]">데이터센터 운영비 분석</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    전력료, 전용회선, 용수, 감가상각비 등 11대 기본 비용을 정밀 산정합니다.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-[8px] bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#172033]">AI 기반 비용 예측</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    IT 부하 증설 및 전력 단가 변동에 따른 중장기 운영비 시나리오를 예측합니다.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-[8px] bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#172033]">비용 최적화 및 운영 효율 개선</h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    유휴 자원 회수, PUE 개선, 액체냉각 최적화 등 실행 가능한 로드맵을 제안합니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11 Core Cost Taxonomy Overview Section */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="max-w-3xl mb-12">
            <div className="text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-2">
              Cost Intelligence Framework
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#172033] tracking-tight">
              데이터센터 11대 핵심 비용 분석 체계
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              고정비, 사용량 연동 비용, 자산 감가상각비를 엄격히 분류하여 투명하고 오차 없는 재무 모델을 제공합니다.
            </p>
          </div>

          {/* Interactive Cost Taxonomy Component */}
          <CostCategoryTaxonomy />
        </div>
      </section>

      {/* Ready-to-Test Sample Documents Strip */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-[1440px] mx-auto px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="text-xs font-bold text-[#2563EB] uppercase tracking-wider mb-1">
                Verified Presets
              </div>
              <h3 className="text-xl font-bold text-[#172033]">
                실제 데이터센터 규격의 샘플 문서로 바로 테스트
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              PDF 파일이 준비되지 않으셨더라도 실제 B2B 실무 규격 샘플로 전 과정을 확인하실 수 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SAMPLE_DATA_CENTER_PRESETS.map((preset) => (
              <div
                key={preset.id}
                className="card-enterprise p-6 flex flex-col justify-between hover:border-blue-300 transition-all text-left bg-white"
              >
                <div>
                  <div className="text-[11px] font-bold text-[#2563EB] bg-blue-50 border border-blue-200/80 px-2.5 py-1 rounded-[6px] inline-block mb-3">
                    {preset.label}
                  </div>
                  <h4 className="text-base font-bold text-[#172033] line-clamp-2">
                    {preset.name}
                  </h4>
                  <p className="mt-2 text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {preset.summary}
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                    <span>인프라 스펙</span>
                    <span className="font-semibold text-slate-800">{preset.primaryGpuSpec}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => onSelectPreset(preset)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-[#2563EB] hover:text-white rounded-[8px] border border-slate-200 transition-all cursor-pointer"
                  >
                    <span>이 문서로 분석 시작하기</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Reliability Strip */}
      <section className="py-16 bg-[#172033] text-white">
        <div className="max-w-[1440px] mx-auto px-8 text-center max-w-4xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            데이터센터 운영비 최적화를 지금 시작하세요
          </h2>
          <p className="text-slate-300 text-sm max-w-2xl mx-auto mb-8 leading-relaxed">
            운영 현황 및 비용 관련 PDF 자료를 업로드하면 11대 항목 기반의 분석과 맞춤형 예측을 제공합니다.
          </p>
          <button
            onClick={onStartUpload}
            className="inline-flex items-center gap-2 px-8 py-4 text-sm font-semibold text-white bg-[#2563EB] hover:bg-blue-600 rounded-[12px] transition-colors shadow-sm cursor-pointer"
          >
            <span>PDF 문서 업로드 화면으로 이동</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
