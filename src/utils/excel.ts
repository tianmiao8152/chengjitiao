import * as XLSX from 'xlsx';
import { ExcelData } from '../types';

/**
 * 解析指定的 Sheet 数据
 */
export const parseSheetData = (workbook: XLSX.WorkBook, sheetName: string): Omit<ExcelData, 'fileName' | 'sheets'> => {
  const worksheet = workbook.Sheets[sheetName];
  
  // 获取工作表的完整范围
  const ref = worksheet['!ref'] || 'A1';
  const range = XLSX.utils.decode_range(ref);
  const jsonData: any[][] = [];

  // 手动遍历范围以确保捕获所有单元格（包括空单元格）
  for (let r = 0; r <= range.e.r; r++) {
    const row: any[] = [];
    for (let c = 0; c <= range.e.c; c++) {
      const cellAddress = XLSX.utils.encode_cell({ r, c });
      const cell = worksheet[cellAddress];
      row.push(cell ? cell.v : null);
    }
    jsonData.push(row);
  }
  
  if (jsonData.length === 0) {
    throw new Error('工作表内容为空');
  }

  // 提取合并单元格信息
  const merges = worksheet['!merges'] || [];

  // 提取表头（默认第一行）和数据行
  const headers = [jsonData[0]];
  const rows = jsonData.slice(1);

  return {
    headers,
    rows,
    currentSheet: sheetName,
    merges: merges.map(m => ({
      s: { r: m.s.r, c: m.s.c },
      e: { r: m.e.r, c: m.e.c }
    }))
  };
};

/**
 * 读取 Excel 文件并解析为二维数组及元数据
 * 
 * 该函数使用 FileReader 读取文件，并通过 xlsx 库解析工作簿。
 * 它会返回第一个工作表的数据以及所有工作表的名称。
 * 
 * @param file 上传的 File 对象
 * @returns Promise<ExcelData & { workbook: XLSX.WorkBook }> 包含解析后的数据及原始工作簿对象
 */
export const readExcelFile = async (file: File): Promise<ExcelData & { workbook: XLSX.WorkBook }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const sheets = workbook.SheetNames;
        if (sheets.length === 0) {
          throw new Error('Excel 文件中没有工作表');
        }

        const firstSheetName = sheets[0];
        const sheetData = parseSheetData(workbook, firstSheetName);

        resolve({
          ...sheetData,
          fileName: file.name,
          sheets,
          workbook
        });
      } catch (error) {
        reject(new Error(error instanceof Error ? error.message : '解析 Excel 失败，请确保文件格式正确'));
      }
    };

    reader.onerror = () => reject(new Error('文件读取错误'));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * 将列索引转换为 Excel 列字母 (0 -> A, 1 -> B, ...)
 * @param col 列索引
 */
export const colToLetter = (col: number): string => {
  let letter = '';
  while (col >= 0) {
    letter = String.fromCharCode((col % 26) + 65) + letter;
    col = Math.floor(col / 26) - 1;
  }
  return letter;
};

/**
 * 获取扁平化后的表头名称
 * @param headers 多行表头数据
 */
export const getFlatHeaders = (headers: any[][]): string[] => {
  if (headers.length === 0) return [];
  const lastHeaderRow = headers[headers.length - 1];
  return lastHeaderRow.map((h, i) => {
    if (h !== undefined && h !== null && h !== '') return String(h);
    // 如果最后一行对应位置为空，向上寻找
    for (let r = headers.length - 2; r >= 0; r--) {
      const val = headers[r][i];
      if (val !== undefined && val !== null && val !== '') return String(val);
    }
    return `列 ${i + 1}`;
  });
};

/**
 * 验证文件格式
 * @param file 文件对象
 * @returns 是否为有效的 Excel 文件
 */
export const validateExcelFile = (file: File): boolean => {
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];
  return validTypes.includes(file.type) || 
         file.name.endsWith('.xlsx') || 
         file.name.endsWith('.xls');
};
