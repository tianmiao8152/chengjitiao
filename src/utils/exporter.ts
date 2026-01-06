import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ExcelData, GeneratorConfig } from '../types';

/**
 * 生成成绩条并导出为 XLSX 格式
 * 
 * 该函数使用 exceljs 库创建一个新的工作簿，并根据用户配置生成成绩条。
 * 支持以下特性：
 * 1. 多行表头复制：每个成绩条都会带上选定的多行表头。
 * 2. 样式优化：根据配置应用灰色背景和边框，提高打印清晰度。
 * 3. 单人多行支持：处理一个学生数据占用多行的情况，并保留其内部合并单元格。
 * 4. 自动调整列宽：基础的列宽自适应。
 * 5. 进度回调：支持大批量数据处理时的进度展示。
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
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('成绩条');

  const { headers, rows, headerMerges = [], merges = [] } = data;
  const { gapRows, rowsPerStudent = 1 } = config;

  // 计算最大列数，确保所有行宽度一致 (使用更安全的方式遍历)
  let maxCols = 0;
  headers.forEach(h => { if (h.length > maxCols) maxCols = h.length; });
  rows.forEach(r => { if (r.length > maxCols) maxCols = r.length; });

  let currentRow = 1;
  // 按照单人行数分组计算总进度
  const studentCount = Math.ceil(rows.length / rowsPerStudent);
  const headerCount = headers.length;

  // 记录每列的最大字符长度，用于自动调整列宽
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

      // 遍历到最大列数，确保每一项都有边框
      for (let colIdx = 0; colIdx < maxCols; colIdx++) {
        const cell = hRow.getCell(colIdx + 1);
        const val = headerRowData[colIdx];
        if (val !== undefined && val !== null) {
          cell.value = val;
          // 更新列宽参考
          const valLen = String(val).replace(/[^\x00-\xff]/g, 'aa').length;
          colWidths[colIdx] = Math.max(colWidths[colIdx], valLen + 2);
        }
        
        const borderStyle = 'thin';
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
      
      // 遍历到最大列数，确保每一项都有边框
      for (let colIdx = 0; colIdx < maxCols; colIdx++) {
        const cell = dRow.getCell(colIdx + 1);
        const val = rowData[colIdx];
        if (val !== undefined && val !== null) {
          cell.value = val;
          // 更新列宽参考
          const valLen = String(val).replace(/[^\x00-\xff]/g, 'aa').length;
          colWidths[colIdx] = Math.max(colWidths[colIdx], valLen + 2);
        }

        const borderStyle = 'thin';
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
    // 我们需要找出位于当前学生数据行范围内的合并单元格
    // 原始数据的行索引是从 headerRows 开始的
    const originalHeaderRows = data.headers.length; // 注意：这里的 data.headers 是原始的，或者是处理后的？
    // 实际上 rows 是从 headerRows 之后开始的，所以原始行号是 i + originalHeaderRows
    const studentDataRangeStart = i + originalHeaderRows;
    const studentDataRangeEnd = studentDataRangeStart + rowsPerStudent - 1;

    merges.forEach(m => {
      // 如果合并单元格在当前处理的学生行范围内
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
    // 限制最小和最大宽度
    column.width = Math.min(Math.max(width, 8), 50);
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `成绩条_${new Date().getTime()}.xlsx`);
};
