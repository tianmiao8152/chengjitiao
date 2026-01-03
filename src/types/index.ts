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
  rowsPerStudent: number; // 每个学生占用的数据行数
}

export type AppStep = 'upload' | 'select' | 'config' | 'preview';

export interface ProgressStatus {
  total: number;
  current: number;
  message: string;
}
