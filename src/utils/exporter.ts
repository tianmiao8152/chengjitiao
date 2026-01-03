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

  const { headers, rows, headerMerges = [], merges = [] } = data;
  const { gapRows, rowsPerStudent = 1 } = config;

  let currentRow = 1;
  // 按照单人行数分组计算总进度
  const studentCount = Math.ceil(rows.length / rowsPerStudent);
  const headerCount = headers.length;

  for (let i = 0; i < rows.length; i += rowsPerStudent) {
    const startRowOfStrip = currentRow;
    const currentStudentIdx = Math.floor(i / rowsPerStudent);
    
    // 1. 添加多行表头
    headers.forEach((headerRowData, hIdx) => {
      const hRow = worksheet.getRow(currentRow);
      hRow.values = headerRowData;
      hRow.font = { bold: true };
      hRow.alignment = { horizontal: 'center', vertical: 'middle' };
      
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
      dRow.values = rowData;
      dRow.alignment = { horizontal: 'center', vertical: 'middle' };
      
      rowData.forEach((_, colIdx) => {
        const cell = dRow.getCell(colIdx + 1);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
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

  // 自动调整列宽
  worksheet.columns.forEach(column => {
    column.width = 15;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `成绩条_${new Date().getTime()}.xlsx`);
};
