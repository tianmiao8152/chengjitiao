import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ExcelData, GeneratorConfig } from '../types';

/**
 * 生成成绩条并导出为 XLSX
 * @param data 原始数据
 * @param config 生成配置
 * @param onProgress 进度回调
 */
export const exportToXLSX = async (
  data: ExcelData, 
  config: GeneratorConfig,
  onProgress?: (p: number) => void
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('成绩条');

  const { headers, rows, headerMerges = [] } = data;
  const { gapRows } = config;

  let currentRow = 1;
  const total = rows.length;
  const headerCount = headers.length;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const startRowOfStrip = currentRow;
    
    // 添加多行表头
    headers.forEach((headerRowData, hIdx) => {
      const hRow = worksheet.getRow(currentRow);
      hRow.values = headerRowData;
      hRow.font = { bold: true };
      hRow.alignment = { horizontal: 'center', vertical: 'middle' };
      
      // 样式处理
      if (config.useOptimizedStyle) {
        hRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF5F5F5' }
        };
      }

      headerRowData.forEach((_, colIdx) => {
        const cell = hRow.getCell(colIdx + 1);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
      currentRow++;
    });

    // 应用表头合并单元格
    headerMerges.forEach(m => {
      worksheet.mergeCells(
        startRowOfStrip + m.s.r,
        m.s.c + 1,
        startRowOfStrip + m.e.r,
        m.e.c + 1
      );
    });

    // 添加数据行
    const dataRow = worksheet.getRow(currentRow);
    dataRow.values = row;
    dataRow.alignment = { horizontal: 'center', vertical: 'middle' };
    
    row.forEach((_, colIdx) => {
      const cell = dataRow.getCell(colIdx + 1);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    currentRow++;

    // 添加间隔行
    for (let j = 0; j < gapRows; j++) {
      currentRow++;
    }

    if (onProgress && i % 50 === 0) {
      onProgress(Math.round((i / total) * 100));
      // 给 UI 线程喘息的机会
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  onProgress?.(100);

  // 自动调整列宽
  worksheet.columns.forEach(column => {
    column.width = 15;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `成绩条_${new Date().getTime()}.xlsx`);
};
