import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ExcelData, GeneratorConfig } from '../types';

/**
 * 将源工作表的样式和内容复制到目标工作表的指定位置
 * @param srcSheet 源工作表
 * @param destSheet 目标工作表
 * @param startRow 目标起始行
 */
const copyTemplateSheet = (srcSheet: ExcelJS.Worksheet, destSheet: ExcelJS.Worksheet, startRow: number) => {
  srcSheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
    const destRow = destSheet.getRow(startRow + rowNumber - 1);
    destRow.height = row.height;
    
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const destCell = destRow.getCell(colNumber);
      destCell.value = cell.value;
      destCell.style = JSON.parse(JSON.stringify(cell.style)); // 深度克隆样式
    });
  });

  // 复制合并单元格
  if (srcSheet.model.merges) {
    srcSheet.model.merges.forEach(mergeRange => {
      const [topLeft, bottomRight] = mergeRange.split(':');
      const tlCell = srcSheet.getCell(topLeft);
      const brCell = srcSheet.getCell(bottomRight);
      
      destSheet.mergeCells(
        startRow + Number(tlCell.row) - 1,
        Number(tlCell.col),
        startRow + Number(brCell.row) - 1,
        Number(brCell.col)
      );
    });
  }
};

/**
 * 使用模板导出成绩条
 * @param data Excel 数据
 * @param config 生成配置
 * @param onProgress 进度回调
 */
export const exportWithTemplate = async (
  data: ExcelData,
  config: GeneratorConfig,
  onProgress?: (p: number) => void
) => {
  if (!data.template) return;

  const templateWorkbook = new ExcelJS.Workbook();
  await templateWorkbook.xlsx.load(data.template.rawBuffer);
  const templateSheet = templateWorkbook.worksheets[0];
  const templateRowCount = templateSheet.rowCount;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('成绩条');

  const { rows, template, headers } = data;
  const { gapRows, rowsPerStudent = 1 } = config;
  const studentCount = Math.ceil(rows.length / rowsPerStudent);
  
  // 获取扁平化后的表头
  const lastHeaderRow = headers[headers.length - 1];
  const flatHeaders = lastHeaderRow.map((h, i) => {
    if (h !== undefined && h !== null && h !== '') return String(h);
    for (let r = headers.length - 2; r >= 0; r--) {
      const val = headers[r][i];
      if (val !== undefined && val !== null && val !== '') return String(val);
    }
    return `列 ${i + 1}`;
  });

  let currentRow = 1;

  for (let i = 0; i < rows.length; i += rowsPerStudent) {
    const currentStudentIdx = Math.floor(i / rowsPerStudent);
    const studentRows = rows.slice(i, i + rowsPerStudent);
    
    const startRowOfStrip = currentRow;
    copyTemplateSheet(templateSheet, worksheet, startRowOfStrip);

    template.mappings.forEach(mapping => {
      if (!mapping.cellAddress) return;
      
      const headerIdx = flatHeaders.indexOf(mapping.headerName);
      if (headerIdx === -1) return;

      const cellValue = studentRows[0][headerIdx];
      
      const templateCell = templateSheet.getCell(mapping.cellAddress);
      const relativeRow = Number(templateCell.row);
      const targetCell = worksheet.getRow(startRowOfStrip + relativeRow - 1).getCell(templateCell.col);
      
      targetCell.value = cellValue;

      const borderStyle: ExcelJS.BorderStyle = 'thin';
      targetCell.border = {
        top: { style: borderStyle },
        left: { style: borderStyle },
        bottom: { style: borderStyle },
        right: { style: borderStyle }
      };
      targetCell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    currentRow += templateRowCount + gapRows;

    if (onProgress && currentStudentIdx % 20 === 0) {
      onProgress(Math.round((currentStudentIdx / studentCount) * 100));
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  onProgress?.(100);

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `成绩条_模板导出_${new Date().getTime()}.xlsx`);
};
