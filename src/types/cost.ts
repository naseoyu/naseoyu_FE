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

// 11 Primary Cost Analysis Items
export interface CoreCostItem {
  id: string;
  itemNumber: number;
  name: string;
  category: '인프라 및 동력' | '자산 감가상각' | '운영 및 외주' | '수선유지비';
  classification: CostClassification;
  description: string;
  customText?: string;
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

// 3-Stage Analysis Step Model
export type AnalysisStepId = 1 | 2 | 3;

export interface AnalysisStepInfo {
  step: AnalysisStepId;
  title: string;
  subtitle: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
}

// Uploaded Document Model (supports multiple documents & optional base64 PDF payload)
export interface UploadedDataCenterDoc {
  id: string;
  name: string;
  originalFileName?: string;
  isCustomTitle?: boolean;
  sizeBytes: number;
  uploadedAt: Date;
  pageCount: number;
  sourceType: 'local_upload' | 'preset_sample';
  documentSummary?: string;
  base64Data?: string;
  note?: string;
}

// User Analysis Scope Options
export type AnalysisTimeframe = 'all' | '1y' | '3y' | '5y';
export type AnalysisFocusArea = 'all' | 'power' | 'depreciation' | 'opex_only' | 'maintenance';

// User-entered AIDC Infrastructure & Operation Specifications on Upload Page
export interface AidcProjectSpecs {
  commencementDate: string; // 1. AIDC 사용 시점, GPU서버 가동 시점(Commencement date)
  usageDuration: string;    // 2. AIDC 사용 기간
  gpuSystemType: string;    // 3. 사용하고자 하는 GPU System 종류를 선택하시오.
  gpuConfig?: string;       // GPU 구성
  gpuCoolingType?: string;  // 데이터센터 권장 냉각 방식
  storageCapacity: string;  // 4. Storage 구축 용량을 선택하시오.
  storagePerGpuRequirement?: string; // GPU System 1개당 Storage 필요량
  diaBandwidth: string;     // 5. 사용하고자 하는 인터넷전용회선(DIA) Bandwidth 를 입력하시오.
}

// Custom LLM Analysis Result returned by /api/analyze
export interface CustomAnalysisResult {
  appliedScopeLabel: string;
  executiveSummary: string;
  keyMetrics: Array<{
    label: string;
    value: string;
    context: string;
  }>;
  highlightedItemNumbers: number[];
  itemInsights: Array<{
    itemNumber: number;
    focusNote: string;
    priority: 'high' | 'medium' | 'normal' | string;
  }>;
  documentInsights: Array<{
    documentName: string;
    detectedFocus: string;
    keyFindings: string;
  }>;
  recommendations: Array<{
    title: string;
    impactEstimate: string;
    actionDetail: string;
  }>;
  generatedAt?: string;
  modelUsed?: string;
}

// Persistent Left-Sidebar LLM Chat Message
export interface PromptChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'error';
  content: string;
  timestamp: Date;
}

// Screen Routing
export type ServicePage = 'landing' | 'upload' | 'analysis_loading' | 'dashboard_preview';
