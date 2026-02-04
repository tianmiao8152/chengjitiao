/**
 * 表示 Excel 中的合并单元格区域
 */
export interface ExcelMerge {
  s: { r: number; c: number }; // 起始行(r)和列(c)
  e: { r: number; c: number }; // 结束行(r)和列(c)
}

/**
 * 模板匹配映射关系
 */
export interface TemplateMapping {
  headerName: string;   // 原始表头名称
  cellAddress: string;  // 模板中的单元格地址，如 "A1", "B2"
}

/**
 * 模板数据
 */
export interface TemplateData {
  fileName: string;
  mappings: TemplateMapping[];
  rawBuffer: ArrayBuffer; // 存储模板文件的原始二进制数据
  rows?: any[][];         // 模板的第一页行数据，用于 UI 展示
  merges?: ExcelMerge[];  // 模板中的合并单元格信息
}

/**
 * 解析后的 Excel 数据结构
 */
export interface ExcelData {
  headers: any[][];        // 已选定的多行表头数据
  rows: any[][];           // 学生成绩行数据
  fileName: string;        // 原始文件名
  merges?: ExcelMerge[];   // 原始文件中所有的合并单元格信息
  headerMerges?: ExcelMerge[]; // 仅属于表头区域的合并单元格信息（相对坐标）
  sheets?: string[];       // 所有工作表名称
  currentSheet?: string;   // 当前选中的工作表名称
  template?: TemplateData;  // 可选的模板信息
}

/**
 * 生成成绩条的配置参数
 */
export interface GeneratorConfig {
  gapRows: number;          // 成绩条之间的间隔空行数
  useOptimizedStyle: boolean; // 是否使用针对打印优化的加重边框样式
  headerRows: number;       // 表头占用的行数（已弃用，由 headerSelector 决定）
  rowsPerStudent: number;   // 每个学生在原始数据中占用的行数（如包含评语行）
}

/**
 * 应用当前的步骤状态
 */
export type AppStep = 'upload' | 'select' | 'preview';

/**
 * 任务处理进度状态
 */
export interface ProgressStatus {
  total: number;    // 总量
  current: number;  // 当前完成量
  message: string;  // 提示信息
}

/**
 * 通知提示类型
 */
export type ToastType = 'success' | 'error' | 'info';

/**
 * 通知提示项
 */
export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}
