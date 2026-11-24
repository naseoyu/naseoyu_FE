export * from './cost';

// Re-export core types for components
export interface PresetSampleDoc {
  id: string;
  name: string;
  fileSizeBytes: number;
  pageCount: number;
  label: string;
  summary: string;
  primaryGpuSpec: string;
  dataCenterType: string;
}
