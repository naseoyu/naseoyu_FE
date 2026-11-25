import React, { useState } from 'react';
import { CORE_COST_ITEMS, CONDITIONAL_COST_ITEMS } from '../../data/costTaxonomyData';
import { CostClassification, CostEntryStatus } from '../../types';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

interface CostCategoryTaxonomyProps {
  compact?: boolean;
  highlightedItemNumbers?: number[];
  itemInsights?: Array<{
    itemNumber: number;
    focusNote: string;
    priority: string;
  }>;
}

export const CostCategoryTaxonomy: React.FC<CostCategoryTaxonomyProps> = ({
  highlightedItemNumbers = [],
  itemInsights = [],
}) => {
  const hasHighlights = highlightedItemNumbers.length > 0;
  const [activeTab, setActiveTab] = useState<
    'all' | 'focused' | 'depreciation' | 'usage' | 'fixed'
  >(hasHighlights ? 'focused' : 'all');
  const [expandedItemId, setExpandedItemId] = useState<string | null>('cost-11');

  const getClassificationText = (classification: CostClassification) => {
    switch (classification) {
      case 'fixed':
        return '고정비';
      case 'usage_based':
        return '사용량 연동 비용';
      case 'depreciation':
        return '자산 감가상각비';
      case 'conditional':
        return '조건부 입력 비용';
    }
  };

  const getStatusText = (status: CostEntryStatus) => {
    switch (status) {
      case 'entered':
        return { label: '기본 분석 대상', cls: 'text-emerald-700' };
      case 'not_entered':
        return { label: '미입력 상태', cls: 'text-slate-500' };
      case 'excluded':
        return { label: '산정 제외 상태', cls: 'text-rose-700' };
    }
  };

  const depreciationCount = CORE_COST_ITEMS.filter(
    (item) => item.classification === 'depreciation'
  ).length;
  const usageCount = CORE_COST_ITEMS.filter(
    (item) => item.classification === 'usage_based'
  ).length;
  const fixedCount = CORE_COST_ITEMS.filter(
    (item) => item.classification === 'fixed'
  ).length;

  const filteredCoreItems = CORE_COST_ITEMS.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'focused')
      return highlightedItemNumbers.includes(item.itemNumber);
    if (activeTab === 'depreciation') return item.classification === 'depreciation';
    if (activeTab === 'usage') return item.classification === 'usage_based';
    if (activeTab === 'fixed') return item.classification === 'fixed';
    return false;
  });

  const insightMap = new Map(
    itemInsights.map((ins) => [ins.itemNumber, ins])
  );

  return (
    <div className="w-full">
      {/* Policy Callout Banner */}
      <div className="mb-6 p-4 rounded-[12px] bg-blue-50/60 border border-blue-200 text-xs text-[#172033] flex items-start gap-3">
        <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-[#172033] font-bold">비용 산정 데이터 무결성 원칙:</strong>
          <span className="text-slate-600 ml-1">
            입력값이 없는 조건부 비용 항목은 임의로 0원 처리하거나 추정하지 않으며,
            <strong> [미입력]</strong> 또는 <strong>[산정 제외]</strong> 상태로 구분하여 분석의 왜곡을 방지합니다.
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        {hasHighlights && (
          <button
            type="button"
            onClick={() => setActiveTab('focused')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-[8px] transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
              activeTab === 'focused'
                ? 'bg-[#2563EB] text-white'
                : 'bg-white text-[#2563EB] border border-blue-200 hover:bg-blue-50'
            }`}
          >
            요청 중점 항목 ({highlightedItemNumbers.length})
          </button>
        )}
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-[8px] transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-[#172033] text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          전체 11대 항목 ({CORE_COST_ITEMS.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('depreciation')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-[8px] transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'depreciation'
              ? 'bg-[#172033] text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          자산 감가상각비 ({depreciationCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('usage')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-[8px] transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'usage'
              ? 'bg-[#172033] text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          사용량 연동 비용 ({usageCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('fixed')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-[8px] transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'fixed'
              ? 'bg-[#172033] text-white'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          고정비 / 외주용역비 ({fixedCount})
        </button>
      </div>

      {/* 11 Core Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {filteredCoreItems.map((item) => {
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const isExpanded = expandedItemId === item.id;
          const isHighlighted = highlightedItemNumbers.includes(item.itemNumber);
          const insight = insightMap.get(item.itemNumber);

          return (
            <div
              key={item.id}
              className={`rounded-[12px] p-5 transition-colors border ${
                isHighlighted
                  ? 'bg-white border-[#2563EB] ring-1 ring-blue-100'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-mono text-xs font-bold text-slate-400 tabular-nums">
                    {String(item.itemNumber).padStart(2, '0')}
                  </span>
                  <h4 className="text-sm font-bold text-[#172033] truncate">
                    {item.name}
                  </h4>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 shrink-0 whitespace-nowrap">
                  {getClassificationText(item.classification)}
                  {isHighlighted && (
                    <span className="text-[#2563EB] ml-1.5">· 요청 중점</span>
                  )}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-3">
                {item.description}
              </p>

              {insight && (
                <div className="mb-3 p-3 rounded-[8px] bg-blue-50/70 border border-blue-200 text-xs text-[#172033] leading-relaxed">
                  <span className="font-semibold text-[#2563EB] mr-1">
                    맞춤 분석 포인트:
                  </span>
                  <span>{insight.focusNote}</span>
                </div>
              )}

              {hasSubItems && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                    className="flex items-center justify-between w-full text-xs font-semibold text-[#2563EB] hover:text-blue-800 cursor-pointer"
                  >
                    <span>세부 유지보수 6개 대상 확인</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-2.5 space-y-1.5 p-3 rounded-[8px] bg-slate-50 border border-slate-200">
                      {item.subItems?.map((sub, sIdx) => (
                        <div
                          key={sIdx}
                          className="text-[11px] text-slate-600 flex items-start justify-between gap-2"
                        >
                          <span className="font-medium text-slate-800 shrink-0">
                            {sub.name}
                          </span>
                          <span className="text-slate-500 text-right">
                            {sub.description}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Additional Conditional Items Section */}
      <div className="card-enterprise p-6 bg-slate-50/70 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h4 className="text-sm font-bold text-[#172033]">
              조건부 입력 비용 항목 관리 (Input-Conditioned Items)
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              사용자 입력값 또는 계약 데이터 존재 여부에 따라 반영되는 항목입니다.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500 tabular-nums">
            총 {CONDITIONAL_COST_ITEMS.length}개 조건부 항목
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {CONDITIONAL_COST_ITEMS.map((cond) => {
            const statusInfo = getStatusText(cond.status);
            return (
              <div
                key={cond.id}
                className="p-3.5 rounded-[10px] bg-white border border-slate-200 text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-bold text-slate-900">{cond.name}</span>
                    <span className={`text-[11px] font-semibold ${statusInfo.cls} shrink-0`}>
                      {statusInfo.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {cond.conditionDescription}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">비용 성격</span>
                  <span className="font-semibold text-slate-700">
                    {getClassificationText(cond.classification)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
