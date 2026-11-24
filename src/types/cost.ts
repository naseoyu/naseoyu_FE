/**
 * Data Center Cost Intelligence - Core Taxonomy and Data Models
 */

// Classification of Cost Behavior
export type CostClassification = 
  | 'fixed'            // 고정비
  | 'usage_based'      // 사용량 연동 비용
  | 'depreciation'     // 자산 감가상각비
  | 'conditional';     // 조건부 입력 비용

// Entry Status (Preventing arbitrary 0 won or estimated values)
export type CostEntryStatus = 
  | 'entered'          // 정상 입력됨
  | 'not_entered'      // 미입력 상태
  | 'excluded';        // 산정 제외 상태

// 12 Primary Cost Analysis Items
export interface CoreCostItem {
  id: string;
  itemNumber: number;
  name: string;
  category: '인프라 및 동력' | '자산 감가상각' | '운영 및 외주' | '수선유지비';
  classification: CostClassification;
  description: string;
  status: CostEntryStatus;
  amountUsd?: number;
  monthlyAmountUsd?: number;
  subItems?: Array<{
    name: string;
    description: string;
    status: CostEntryStatus;
    amountUsd?: number;
  }>;
}

// Additional / Conditional Cost Items
export interface ConditionalCostItem {
  id: string;
  name: string;
  classification: CostClassification;
  conditionDescription: string;
  status: CostEntryStatus; // 'not_entered' | 'entered' | 'excluded'
  amountUsd?: number;
  growthRatePercent?: number; // e.g. 수도세 인상률 적용
}

// 5-Stage Analysis Step Model
export type AnalysisStepId = 1 | 2 | 3 | 4 | 5;

export interface AnalysisStepInfo {
  step: AnalysisStepId;
  title: string;
  subtitle: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
}

// Uploaded Document Model
export interface UploadedDataCenterDoc {
  id: string;
  name: string;
  sizeBytes: number;
  uploadedAt: Date;
  pageCount: number;
  sourceType: 'local_upload' | 'preset_sample';
  documentSummary?: string;
}

// Screen Routing
export type ServicePage = 'landing' | 'upload' | 'analysis_loading' | 'dashboard_preview';
