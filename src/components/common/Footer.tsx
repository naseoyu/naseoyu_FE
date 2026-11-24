import React from 'react';
import { Shield, FileCheck, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#172033] text-slate-300 text-xs py-10 mt-auto border-t border-slate-800">
      <div className="max-w-[1440px] mx-auto px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-slate-700/80">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-bold text-white text-sm">
                AI Data Center Cost Intelligence
              </span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400 text-xs font-normal">
                Enterprise B2B Data Center FinOps Platform
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-2xl">
              12대 기본 비용 분석 항목과 고정비·사용량 연동 비용·감가상각비 구분을 통해 기업 데이터센터 운영비 예측과 최적화를 지원합니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-slate-400 text-xs shrink-0">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>기업 기밀 데이터 격리 보호</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>12대 표준 비용 분류 체계</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-slate-500 text-[11px]">
          <p>© 2025 AI Data Center Cost Intelligence. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-300 transition-colors">데이터센터 비용 산정 가이드라인</span>
            <span>·</span>
            <span className="hover:text-slate-300 transition-colors">이용약관</span>
            <span>·</span>
            <span className="hover:text-slate-300 transition-colors">보안 및 개인정보 처리방침</span>
            <span>·</span>
            <span className="hover:text-slate-300 transition-colors">시스템 연동 문의</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
