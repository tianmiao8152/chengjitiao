import React, { useState, useMemo } from 'react';
import { X, Table as TableIcon, MapPin, AlertCircle, MousePointer2 } from 'lucide-react';
import { TemplateMapping, ExcelMerge } from '../types';
import { colToLetter } from '../utils/excel';

interface TemplateMapperProps {
  headers: string[];
  templateRows?: any[][];
  templateMerges?: ExcelMerge[];
  initialMappings?: TemplateMapping[];
  onMappingChange: (mappings: TemplateMapping[]) => void;
  onClose: () => void;
}

/**
 * 模板映射配置组件
 * 
 * 用于让用户设置原始表头与模板单元格之间的对应关系。
 * 支持通过 UI 界面直接点击模板单元格进行选择。
 */
const TemplateMapper: React.FC<TemplateMapperProps> = ({ 
  headers, 
  templateRows = [],
  templateMerges = [],
  initialMappings = [], 
  onMappingChange,
  onClose 
}) => {
  const [mappings, setMappings] = useState<TemplateMapping[]>(
    headers.map(h => {
      const existing = initialMappings.find(m => m.headerName === h);
      return existing || { headerName: h, cellAddress: '' };
    })
  );
  const [activeHeader, setActiveHeader] = useState<string | null>(headers[0] || null);

  const handleAddressChange = (headerName: string, address: string) => {
    const newMappings = mappings.map(m => 
      m.headerName === headerName ? { ...m, cellAddress: address.toUpperCase() } : m
    );
    setMappings(newMappings);
    onMappingChange(newMappings);
  };

  const handleCellClick = (rowIndex: number, colIndex: number) => {
    if (!activeHeader) return;
    const address = `${colToLetter(colIndex)}${rowIndex + 1}`;
    handleAddressChange(activeHeader, address);
    
    // 自动切换到下一个未设置的表头
    const nextHeaderIdx = headers.indexOf(activeHeader) + 1;
    if (nextHeaderIdx < headers.length) {
      setActiveHeader(headers[nextHeaderIdx]);
    }
  };

  /**
   * 检查某个单元格是否被合并单元格覆盖
   */
  const getCellSpan = (r: number, c: number) => {
    const merge = templateMerges.find(m => 
      r >= m.s.r && r <= m.e.r && c >= m.s.c && c <= m.e.c
    );

    if (merge) {
      if (r === merge.s.r && c === merge.s.c) {
        return {
          rendered: true,
          rowSpan: merge.e.r - merge.s.r + 1,
          colSpan: merge.e.c - merge.s.c + 1
        };
      }
      return { rendered: false, rowSpan: 1, colSpan: 1 };
    }

    return { rendered: true, rowSpan: 1, colSpan: 1 };
  };

  const maxCols = useMemo(() => {
    let max = 0;
    templateRows.forEach(row => {
      if (row.length > max) max = row.length;
    });
    return Math.max(max, 5); // 至少显示 5 列
  }, [templateRows]);

  const displayRows = useMemo(() => {
    const rows = [...templateRows];
    // 确保至少有 10 行可供显示，方便用户选择
    while (rows.length < 10) {
      rows.push(new Array(maxCols).fill(null));
    }
    return rows;
  }, [templateRows, maxCols]);

  return (
    <div className="bg-white rounded-2xl border border-blue-100 shadow-xl overflow-hidden mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="bg-blue-600 px-6 py-4 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <TableIcon size={20} />
          <h3 className="font-bold">设置模板映射</h3>
        </div>
        <button 
          onClick={onClose}
          className="hover:bg-blue-700 p-1 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧：表头列表 */}
        <div className="lg:col-span-4 flex flex-col h-[500px]">
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100 mb-4">
            <MousePointer2 className="text-blue-500 mt-0.5 shrink-0" size={16} />
            <div className="text-xs text-blue-800">
              <p className="font-bold mb-1">交互说明：</p>
              <p>1. 点击左侧列表选中一个字段</p>
              <p>2. 在右侧模板预览中点击目标单元格</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
            {mappings.map((mapping, idx) => {
              const isActive = activeHeader === mapping.headerName;
              return (
                <div 
                  key={idx}
                  onClick={() => setActiveHeader(mapping.headerName)}
                  className={`
                    flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer
                    ${isActive 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                      : 'bg-gray-50 border-gray-100 hover:border-blue-200 text-gray-700'}
                  `}
                >
                  <div className="flex-1 min-w-0">
                    <div className={`text-[10px] uppercase font-bold mb-0.5 ${isActive ? 'text-blue-200' : 'text-gray-400'}`}>
                      原始表头
                    </div>
                    <div className="font-bold truncate text-sm" title={mapping.headerName}>
                      {mapping.headerName}
                    </div>
                  </div>
                  
                  <div className={`w-20 shrink-0 text-right`}>
                    <div className={`text-[10px] uppercase font-bold mb-0.5 ${isActive ? 'text-blue-200' : 'text-gray-400'}`}>
                      单元格
                    </div>
                    <div className={`font-mono font-bold text-sm ${mapping.cellAddress ? (isActive ? 'text-white' : 'text-blue-600') : 'text-gray-300 italic'}`}>
                      {mapping.cellAddress || '未设置'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 右侧：模板预览 */}
        <div className="lg:col-span-8 flex flex-col h-[500px] border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
          <div className="bg-white border-b px-4 py-2 flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">模板预览 (仅展示前 20 行)</span>
            {activeHeader && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">正在设置:</span>
                <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  {activeHeader}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-auto p-4 custom-scrollbar">
            <div className="bg-white shadow-sm border border-gray-200 rounded overflow-hidden inline-block min-w-full">
              <table className="text-xs border-collapse w-full">
                <thead>
                  <tr>
                    <th className="bg-gray-100 border border-gray-200 w-8 h-8"></th>
                    {Array.from({ length: maxCols }).map((_, i) => (
                      <th key={i} className="bg-gray-100 border border-gray-200 px-2 py-1 font-bold text-gray-500 min-w-[60px]">
                        {colToLetter(i)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayRows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      <td className="bg-gray-100 border border-gray-200 text-center font-bold text-gray-500 w-8 h-8">
                        {rIdx + 1}
                      </td>
                      {Array.from({ length: maxCols }).map((_, cIdx) => {
                        const cell = row[cIdx];
                        const span = getCellSpan(rIdx, cIdx);
                        if (!span.rendered) return null;
                        
                        const address = `${colToLetter(cIdx)}${rIdx + 1}`;
                        const isMapped = mappings.some(m => m.cellAddress === address);
                        const mappedTo = mappings.find(m => m.cellAddress === address)?.headerName;

                        return (
                          <td 
                            key={cIdx} 
                            rowSpan={span.rowSpan}
                            colSpan={span.colSpan}
                            onClick={() => handleCellClick(rIdx, cIdx)}
                            className={`
                              border border-gray-200 p-2 min-w-[60px] h-8 cursor-cell transition-all
                              ${isMapped ? 'bg-blue-50' : 'hover:bg-blue-50/50'}
                            `}
                          >
                            <div className="flex flex-col gap-1">
                              <span className="text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis">
                                {cell !== undefined && cell !== null ? String(cell) : ''}
                              </span>
                              {isMapped && (
                                <span className="text-[9px] bg-blue-600 text-white px-1 rounded truncate" title={mappedTo}>
                                  {mappedTo}
                                </span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateMapper;
