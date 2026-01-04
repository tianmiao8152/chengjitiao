import React, { useState } from 'react';
import { ExcelData, ExcelMerge } from '../types';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface HeaderSelectorProps {
  data: ExcelData;
  onConfirm: (headers: any[][], rows: any[][], headerMerges: ExcelMerge[]) => void;
  onBack: () => void;
}

/**
 * 表头选择器组件
 * 
 * 用于让用户从读取到的 Excel 数据前几行中选择表头。
 * 功能特性：
 * 1. 多行选择：支持选择单行或连续的多行作为复杂表头。
 * 2. 自动切分：确认表头后，自动将所选行之后的所有行识别为学生数据。
 * 3. 合并单元格提取：自动过滤并转换属于表头区域的合并单元格信息。
 * 4. 连续性校验：强制要求所选表头必须是连续的行。
 */
const HeaderSelector: React.FC<HeaderSelectorProps> = ({ data, onConfirm, onBack }) => {
  const [selectedRows, setSelectedRows] = useState<number[]>([0]); // 默认第一行
  
  const allRows = [data.headers[0], ...data.rows];

  const toggleRow = (index: number) => {
    setSelectedRows(prev => {
      if (prev.includes(index)) {
        if (prev.length === 1) return prev; // 至少保留一行
        return prev.filter(i => i !== index).sort((a, b) => a - b);
      }
      return [...prev, index].sort((a, b) => a - b);
    });
  };

  const handleConfirm = () => {
    // 检查选择是否连续
    const sorted = [...selectedRows].sort((a, b) => a - b);
    const isContinuous = sorted.every((val, i) => i === 0 || val === sorted[i-1] + 1);
    
    if (!isContinuous) {
      alert('请选择连续的行作为表头');
      return;
    }

    const headers = sorted.map(i => allRows[i]);
    const maxIndex = Math.max(...sorted);
    const minIndex = Math.min(...sorted);
    const rows = allRows.slice(maxIndex + 1);

    // 提取属于表头范围的合并单元格，并转换为相对坐标
    const headerMerges = (data.merges || [])
      .filter(m => m.s.r >= minIndex && m.e.r <= maxIndex)
      .map(m => ({
        s: { r: m.s.r - minIndex, c: m.s.c },
        e: { r: m.e.r - minIndex, c: m.e.c }
      }));
    
    onConfirm(headers, rows, headerMerges);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">选择表头范围</h2>
        <p className="text-gray-500 mt-2">点击选择一行或多行连续数据作为“表头”（支持多级表头）</p>
      </div>

      <div className="flex-1 overflow-auto border border-gray-100 rounded-xl mb-6">
        <table className="w-full text-sm text-left">
          <thead className="sticky top-0 bg-gray-50">
            <tr>
              <th className="px-4 py-3 w-20 text-center text-gray-400 font-normal">选择</th>
              {allRows[0].map((_, i) => (
                <th key={i} className="px-4 py-3 bg-gray-100/50 border-x border-white">列 {i + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allRows.slice(0, 15).map((row, rowIndex) => {
              const isSelected = selectedRows.includes(rowIndex);
              return (
                <tr 
                  key={rowIndex}
                  onClick={() => toggleRow(rowIndex)}
                  className={`
                    cursor-pointer transition-colors border-b border-gray-50
                    ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                  `}
                >
                  <td className="px-4 py-3 text-center">
                    <div className={`
                      w-5 h-5 rounded border flex items-center justify-center mx-auto transition-colors
                      ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 bg-white'}
                    `}>
                      {isSelected && <Check size={14} />}
                    </div>
                  </td>
                  {row.map((cell, cellIndex) => (
                    <td 
                      key={cellIndex} 
                      className={`px-4 py-3 border-x border-gray-50/50 ${isSelected ? 'font-bold text-blue-700' : 'text-gray-600'}`}
                    >
                      {String(cell || '')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-auto pt-6 border-t">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-2.5 text-gray-600 hover:text-gray-800 font-medium transition-colors"
        >
          <ChevronLeft size={20} />
          <span>返回重新上传</span>
        </button>
        
        <button
          onClick={handleConfirm}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
        >
          <span>确认选择</span>
          <Check size={20} />
        </button>
      </div>
    </div>
  );
};

export default HeaderSelector;
