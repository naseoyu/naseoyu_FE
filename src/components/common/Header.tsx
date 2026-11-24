import React from 'react';
import { ServicePage } from '../../types';
import { Server, ArrowRight, ShieldCheck, FileText, BarChart3, HelpCircle } from 'lucide-react';

interface HeaderProps {
  currentPage: ServicePage;
  onNavigate: (page: ServicePage) => void;
  uploadedFileName?: string;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate, uploadedFileName }) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-[1440px] mx-auto px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Service Brand and Logo */}
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-3 text-left group transition-opacity hover:opacity-90 shrink-0 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-[10px] bg-[#172033] flex items-center justify-center text-white shadow-xs group-hover:bg-[#2563EB] transition-colors">
            <Server className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-[#172033] whitespace-nowrap block">
              AI Data Center Cost Intelligence
            </span>
            <span className="text-[11px] text-slate-500 font-medium tracking-tight block">
              데이터센터 운영비 분석 &amp; 비용 최적화 B2B 플랫폼
            </span>
          </div>
        </button>

        {/* Zone 2: Concise Navigation Menu */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600">
          <button
            onClick={() => onNavigate('landing')}
            className={`whitespace-nowrap transition-colors hover:text-[#2563EB] cursor-pointer ${
              currentPage === 'landing' ? 'text-[#2563EB] font-bold' : 'text-slate-600'
            }`}
          >
            서비스 소개
          </button>
          <button
            onClick={() => onNavigate('upload')}
            className={`whitespace-nowrap transition-colors hover:text-[#2563EB] cursor-pointer ${
              currentPage === 'upload' ? 'text-[#2563EB] font-bold' : 'text-slate-600'
            }`}
          >
            서류 업로드
          </button>
          <button
            onClick={() => onNavigate('analysis_loading')}
            className={`whitespace-nowrap transition-colors hover:text-[#2563EB] cursor-pointer ${
              currentPage === 'analysis_loading' ? 'text-[#2563EB] font-bold' : 'text-slate-600'
            }`}
          >
            LLM 분석
          </button>
          <button
            onClick={() => onNavigate('dashboard_preview')}
            className={`whitespace-nowrap transition-colors hover:text-[#2563EB] cursor-pointer ${
              currentPage === 'dashboard_preview' ? 'text-[#2563EB] font-bold' : 'text-slate-600'
            }`}
          >
            비용 분석 결과
          </button>
        </nav>

        {/* Zone 3: Primary Action / Status Button */}
        <div className="flex items-center gap-3 shrink-0">
          {currentPage === 'analysis_loading' ? (
            <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-[8px] whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>시연용 가상 분석 진행 중</span>
            </div>
          ) : currentPage === 'dashboard_preview' ? (
            <button
              onClick={() => onNavigate('upload')}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[8px] transition-colors cursor-pointer"
            >
              <span>새로운 PDF 업로드</span>
            </button>
          ) : (
            <button
              onClick={() => onNavigate('upload')}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#2563EB] hover:bg-blue-700 rounded-[8px] transition-colors shadow-xs whitespace-nowrap cursor-pointer"
            >
              <span>분석 시작하기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
