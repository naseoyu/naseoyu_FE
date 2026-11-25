import React from 'react';
import { ServicePage } from '../../types';
import { Server, ArrowRight } from 'lucide-react';

interface HeaderProps {
  currentPage: ServicePage;
  onNavigate: (page: ServicePage) => void;
  uploadedCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single-line) */}
        <button
          type="button"
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2.5 text-left group hover:opacity-90 shrink-0 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-[8px] bg-[#172033] flex items-center justify-center text-white group-hover:bg-[#2563EB] transition-colors shrink-0">
            <Server className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-[#172033] whitespace-nowrap shrink-0">
            AI Data Center Cost Intelligence
          </span>
        </button>

        {/* Zone 2: Concise Single-Line Navigation */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#2563EB] hover:underline underline-offset-4 cursor-pointer ${
              currentPage === 'landing' ? 'text-[#2563EB] font-bold' : 'text-slate-600'
            }`}
          >
            서비스 소개
          </button>
          <button
            type="button"
            onClick={() => onNavigate('upload')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#2563EB] hover:underline underline-offset-4 cursor-pointer ${
              currentPage === 'upload' ? 'text-[#2563EB] font-bold' : 'text-slate-600'
            }`}
          >
            서류 업로드
          </button>
          <button
            type="button"
            onClick={() => onNavigate('analysis_loading')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#2563EB] hover:underline underline-offset-4 cursor-pointer ${
              currentPage === 'analysis_loading'
                ? 'text-[#2563EB] font-bold'
                : 'text-slate-600'
            }`}
          >
            LLM 분석
          </button>
          <button
            type="button"
            onClick={() => onNavigate('dashboard_preview')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-[#2563EB] hover:underline underline-offset-4 cursor-pointer ${
              currentPage === 'dashboard_preview'
                ? 'text-[#2563EB] font-bold'
                : 'text-slate-600'
            }`}
          >
            비용 분석 결과
          </button>
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('upload')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-blue-700 rounded-[8px] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>
              {currentPage === 'dashboard_preview' ? '새 서류 업로드' : '분석 시작하기'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
