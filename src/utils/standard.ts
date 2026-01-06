import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ExcelData, GeneratorConfig } from '../types';

/**
 * 常规导出成绩条（不使用模板）
 * @param data Excel 数据
 * @param config 生成配置
 * @param onProgress 进度回调
 */
export const exportStandard = async (
  data: ExcelData,
  config: GeneratorConfig,
  onProgress?: (p: number) => void
) => {
  const { headers, rows, headerMerges = [], merges = [] } = data;
  const { gapRows, rowsPerStudent = 1 } = config;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('成绩条');

  let maxCols = 0;
  headers.forEach(h => { if (h.length > maxCols) maxCols = h.length; });
  rows.forEach(r => { if (r.length > maxCols) maxCols = r.length; });

  let currentRow = 1;
  const studentCount = Math.ceil(rows.length / rowsPerStudent);
  const colWidths: number[] = new Array(maxCols).fill(10);

  for (let i = 0; i < rows.length; i += rowsPerStudent) {
    const startRowOfStrip = currentRow;
    const currentStudentIdx = Math.floor(i / rowsPerStudent);
    
    // 1. 添加多行表头
    headers.forEach((headerRowData, hIdx) => {
      const hRow = worksheet.getRow(currentRow);
      hRow.font = { bold: true };
      hRow.alignment = { horizontal: 'center', vertical: 'middle' };
      
      if (config.useOptimizedStyle) {
        hRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF5F5F5' }
        };
      }

      for (let colIdx = 0; colIdx < maxCols; colIdx++) {
        const cell = hRow.getCell(colIdx + 1);
        const val = headerRowData[colIdx];
        if (val !== undefined && val !== null) {
          cell.value = val;
          const valLen = String(val).replace(/[^\x00-\xff]/g, 'aa').length;
          colWidths[colIdx] = Math.max(colWidths[colIdx], valLen + 2);
        }
        
        const borderStyle: ExcelJS.BorderStyle = 'thin';
        cell.border = {
          top: { style: borderStyle },
          left: { style: borderStyle },
          bottom: { style: borderStyle },
          right: { style: borderStyle }
        };
      }
      currentRow++;
    });

    // 2. 应用表头合并单元格
    headerMerges.forEach(m => {
      worksheet.mergeCells(
        startRowOfStrip + m.s.r,
        m.s.c + 1,
        startRowOfStrip + m.e.r,
        m.e.c + 1
      );
    });

    // 3. 添加该学生的所有数据行
    const studentDataStartRow = currentRow;
    for (let r = 0; r < rowsPerStudent; r++) {
      const rowIndex = i + r;
      if (rowIndex >= rows.length) break;

      const rowData = rows[rowIndex];
      const dRow = worksheet.getRow(currentRow);
      dRow.alignment = { horizontal: 'center', vertical: 'middle' };
      
      for (let colIdx = 0; colIdx < maxCols; colIdx++) {
        const cell = dRow.getCell(colIdx + 1);
        const val = rowData[colIdx];
        if (val !== undefined && val !== null) {
          cell.value = val;
          const valLen = String(val).replace(/[^\x00-\xff]/g, 'aa').length;
          colWidths[colIdx] = Math.max(colWidths[colIdx], valLen + 2);
        }

        const borderStyle: ExcelJS.BorderStyle = 'thin';
        cell.border = {
          top: { style: borderStyle },
          left: { style: borderStyle },
          bottom: { style: borderStyle },
          right: { style: borderStyle }
        };
      }
      currentRow++;
    }

    // 4. 处理该学生数据行内的合并单元格
    const originalHeaderRows = headers.length;
    const studentDataRangeStart = i + originalHeaderRows;
    const studentDataRangeEnd = studentDataRangeStart + rowsPerStudent - 1;

    merges.forEach(m => {
      if (m.s.r >= studentDataRangeStart && m.e.r <= studentDataRangeEnd) {
        const offset = m.s.r - studentDataRangeStart;
        const rowSpan = m.e.r - m.s.r;
        
        worksheet.mergeCells(
          studentDataStartRow + offset,
          m.s.c + 1,
          studentDataStartRow + offset + rowSpan,
          m.e.c + 1
        );
      }
    });

    // 5. 添加间隔行
    for (let j = 0; j < gapRows; j++) {
      currentRow++;
    }

    if (onProgress && currentStudentIdx % 20 === 0) {
      onProgress(Math.round((currentStudentIdx / studentCount) * 100));
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  onProgress?.(100);

  // 应用计算出的列宽
  colWidths.forEach((width, idx) => {
    const column = worksheet.getColumn(idx + 1);
    column.width = Math.min(Math.max(width, 8), 50);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `成绩条_${new Date().getTime()}.xlsx`);
};
