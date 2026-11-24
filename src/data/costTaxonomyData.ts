import { CoreCostItem, ConditionalCostItem, PresetSampleDoc } from '../types';

/**
 * 11 Core Cost Analysis Items
 * Adhering strictly to the enterprise cost taxonomy
 */
export const CORE_COST_ITEMS: CoreCostItem[] = [
  {
    id: 'cost-1',
    itemNumber: 1,
    name: '전력료',
    category: '인프라 및 동력',
    classification: 'usage_based',
    description: 'IT 로드(GPU/서버) 및 공조 냉각 전력 소비량에 연동되는 기본 전력비용',
    status: 'entered',
  },
  {
    id: 'cost-2',
    itemNumber: 2,
    name: '인터넷 전용 회선 서비스',
    category: '인프라 및 동력',
    classification: 'fixed',
    description: '백본망 연동 대역폭(100G/400G), BGP 연동 및 IX 피어링 고정 회선 이용료',
    status: 'entered',
  },
  {
    id: 'cost-3',
    itemNumber: 3,
    name: '발전기 연료비',
    category: '인프라 및 동력',
    classification: 'usage_based',
    description: '정전 비상 대응 디젤 발전기 비축 연료 및 정기 무부하/부하 시운전 연료비',
    status: 'entered',
  },
  {
    id: 'cost-4',
    itemNumber: 4,
    name: '공업용수 및 냉각 비용',
    category: '인프라 및 동력',
    classification: 'usage_based',
    description: '냉각탑 증발수, 블로우다운 보충수 및 2차 냉각수 순환 처리 용수 비용',
    status: 'entered',
  },
  {
    id: 'cost-5',
    itemNumber: 5,
    name: 'GPU 시스템 감가상각비',
    category: '자산 감가상각',
    classification: 'depreciation',
    description: 'AI 가속기(GPU/NPU), HGX 베이스보드, InfiniBand 스위치 장비 감가상각(3~5년 정액법)',
    status: 'entered',
  },
  {
    id: 'cost-6',
    itemNumber: 6,
    name: '데이터센터 구축 감가상각비',
    category: '자산 감가상각',
    classification: 'depreciation',
    description: '데이터센터 건물 토목, 기초 골조, 하중 보강 및 외벽 물리적 구조물 감가상각',
    status: 'entered',
  },
  {
    id: 'cost-7',
    itemNumber: 7,
    name: 'Fit-out 공사 감가상각비',
    category: '자산 감가상각',
    classification: 'depreciation',
    description: '이중마루(Access Floor), 케이블 트레이, 격벽 밀폐 공사 및 조명 등 내부 인테리어 상각',
    status: 'entered',
  },
  {
    id: 'cost-8',
    itemNumber: 8,
    name: '액체냉각 구축 감가상각비',
    category: '자산 감가상각',
    classification: 'depreciation',
    description: 'CDU(Cooling Distribution Unit), 퀵디스커넥트(QD) 배관, 매니폴드 및 액침 수조 감가상각',
    status: 'entered',
  },
  {
    id: 'cost-9',
    itemNumber: 9,
    name: '시설 운영 외주용역비',
    category: '운영 및 외주',
    classification: 'fixed',
    description: '전기·기계·방재 24/7 3교대 현장 설비 점검 및 상주 외주 전문 인력 용역비',
    status: 'entered',
  },
  {
    id: 'cost-10',
    itemNumber: 10,
    name: 'NW 운영 외주용역비',
    category: '운영 및 외주',
    classification: 'fixed',
    description: '스위칭 패브릭, 광케이블 라우팅, 방화벽 및 네트워크 관제 NOC 외주 용역비',
    status: 'entered',
  },
  {
    id: 'cost-11',
    itemNumber: 11,
    name: '수선유지비',
    category: '수선유지비',
    classification: 'usage_based',
    description: '건물, 전원, 환경, 네트워크 및 액체냉각 설비 정기 점검 및 수리 비용',
    status: 'entered',
    subItems: [
      { name: '건물 수선유지비', description: '외벽 방수, 방화문 및 크랙 보수', status: 'entered' },
      { name: '전원설비 수선유지비', description: 'UPS 배터리 셀 교체, 변압기 오일 교체', status: 'entered' },
      { name: '환경설비 수선유지비', description: 'CRAC 필터, 냉동기 냉매 충전, 팬 모터 교체', status: 'entered' },
      { name: '네트워크설비 수선유지비', description: '광패치코드 교체, 광트랜시버 예비품 수급', status: 'entered' },
      { name: '제조사 유지보수(OEM)', description: '서버/스위치 벤더 연간 기술지원 SLA 계약', status: 'entered' },
      { name: '액체냉각 관련 유지보수', description: '유전체 냉매 산도 분석, 펌프 씰 교체, 미세 필터 교체', status: 'entered' },
    ],
  },
];

/**
 * Additional Conditional Cost Items
 * Condition descriptions and explicit status distinctions
 */
export const CONDITIONAL_COST_ITEMS: ConditionalCostItem[] = [
  {
    id: 'cond-1',
    name: '상수도 식수',
    classification: 'usage_based',
    conditionDescription: '수도세 인상률 연동 적용 항목',
    status: 'entered',
    growthRatePercent: 3.8,
  },
  {
    id: 'cond-2',
    name: '정규직 인건비',
    classification: 'fixed',
    conditionDescription: '센터 총괄 관리자 및 엔지니어링 정규직 고정비',
    status: 'entered',
  },
  {
    id: 'cond-3',
    name: '시설 운영 및 네트워크 운영 소모품비',
    classification: 'conditional',
    conditionDescription: '입력값이 있을 때만 반영 (현재 미입력 상태)',
    status: 'not_entered', // 미입력 또는 산정 제외
  },
  {
    id: 'cond-4',
    name: '보험료',
    classification: 'fixed',
    conditionDescription: '화재보험, 기계배상책임보험 및 패키지 보험 고정비',
    status: 'entered',
  },
  {
    id: 'cond-5',
    name: '세금과공과',
    classification: 'fixed',
    conditionDescription: '재산세, 종합토지세, 환경개선부담금 등 법정 공과금',
    status: 'entered',
  },
  {
    id: 'cond-6',
    name: '센터 운영 및 인증·검사 지급수수료',
    classification: 'conditional',
    conditionDescription: 'Tier 인증, 녹색건축인증, 안전진단 등 입력값이 있을 때만 반영 (산정 제외 상태)',
    status: 'excluded', // 산정 제외
  },
];

/**
 * Realistic Sample Documents for Immediate Testing
 */
export const SAMPLE_DATA_CENTER_PRESETS: PresetSampleDoc[] = [
  {
    id: 'h100-512-datacenter',
    name: 'AI_Datacenter_Cluster_TCO_Audit_Report.pdf',
    fileSizeBytes: 4784128, // 4.56 MB
    pageCount: 32,
    label: '하이퍼스케일 AI 전용 데이터센터',
    summary: 'NVIDIA H100 512기 클러스터의 전력(PUE 1.45), 회선, 액체냉각 구축비 및 11개 운영비 항목 감사 보고서',
    primaryGpuSpec: 'NVIDIA H100 SXM5 512기',
    dataCenterType: 'Tier-3+ 엔터프라이즈 AI 데이터센터',
  },
  {
    id: 'hybrid-dc-audit',
    name: 'Enterprise_DC_Power_Cooling_Assessment.pdf',
    fileSizeBytes: 3145728, // 3.00 MB
    pageCount: 24,
    label: '기업형 하이브리드 데이터센터',
    summary: '256기 혼합 가속기 인프라의 전력계량기 청구서, 공랭/수냉 설비 유지보수 계약서 및 감가상각 내역서',
    primaryGpuSpec: 'NVIDIA A100/H100 256기',
    dataCenterType: '하이브리드 공랭/수냉 데이터센터',
  },
  {
    id: 'cloud-hyperscale-spec',
    name: 'Cloud_Hosting_Facility_Monthly_Billing.pdf',
    fileSizeBytes: 2097152, // 2.00 MB
    pageCount: 18,
    label: '코로케이션 상면 및 전용회선 청구서',
    summary: '상면 임대료, 외주 용역비, 400G 백본 전용회선 서비스 및 전원설비 수선유지비 분기별 정산서',
    primaryGpuSpec: '코로케이션 랙 16개 상면',
    dataCenterType: '코로케이션 호스팅 데이터센터',
  },
];
