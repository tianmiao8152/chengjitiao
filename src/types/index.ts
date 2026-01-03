export interface ExcelMerge {
  s: { r: number; c: number };
  e: { r: number; c: number };
}

export interface ExcelData {
  headers: any[][];
  rows: any[][];
  fileName: string;
  merges?: ExcelMerge[];
  headerMerges?: ExcelMerge[];
}

export interface GeneratorConfig {
  gapRows: number;
  useOptimizedStyle: boolean;
  headerRows: number;
}

export type AppStep = 'upload' | 'select' | 'config' | 'preview';

export interface ProgressStatus {
  total: number;
  current: number;
  message: string;
}
