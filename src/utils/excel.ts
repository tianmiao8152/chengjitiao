import * as XLSX from 'xlsx';
import { ExcelData } from '../types';

/**
 * 读取 Excel 文件并解析为二维数组
 * @param file 上传的文件对象
 * @returns 解析后的 Excel 数据
 */
export const readExcelFile = async (file: File): Promise<ExcelData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // 默认读取第一个工作表
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // 转换为二维数组，保留所有原始数据
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        
        if (jsonData.length === 0) {
          throw new Error('文件内容为空');
        }

        // 提取合并单元格信息
        const merges = worksheet['!merges'] || [];

        // 提取表头（默认第一行）和数据行
        const headers = [jsonData[0]];
        const rows = jsonData.slice(1);

        resolve({
          headers,
          rows,
          fileName: file.name,
          merges: merges.map(m => ({
            s: { r: m.s.r, c: m.s.c },
            e: { r: m.e.r, c: m.e.c }
          }))
        });
      } catch (error) {
        reject(new Error('解析 Excel 失败，请确保文件格式正确'));
      }
    };

    reader.onerror = () => reject(new Error('文件读取错误'));
    reader.readAsArrayBuffer(file);
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
