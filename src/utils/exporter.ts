import { ExcelData, GeneratorConfig } from '../types';
import { exportWithTemplate } from './template';
import { exportStandard } from './standard';

/**
 * 导出 XLSX 的统一入口函数
 * 
 * 根据数据中是否包含模板配置，自动选择“模板导出”或“常规导出”逻辑。
 * 
 * @param data 原始 Excel 数据及元数据
 * @param config 生成配置（间隔行、样式偏好、单人行数等）
 * @param onProgress 进度百分比回调函数 (0-100)
 */
export const exportToXLSX = async (
  data: ExcelData, 
  config: GeneratorConfig,
  onProgress?: (p: number) => void
) => {
  const { template } = data;

  // 如果有模板且配置了映射，走模板导出逻辑
  if (template && template.rawBuffer && template.mappings.length > 0) {
    return exportWithTemplate(data, config, onProgress);
  }

  // 否则走常规导出逻辑
  return exportStandard(data, config, onProgress);
};

// 重新导出子模块，以便外部在特殊情况下直接调用
export * from './template';
export * from './standard';
