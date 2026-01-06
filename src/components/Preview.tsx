import React, { useMemo } from 'react';
import { ExcelData, GeneratorConfig } from '../types';
import { ChevronLeft, FileDown, FileSpreadsheet, CheckCircle2 } from 'lucide-react';
import { colToLetter, getFlatHeaders } from '../utils/excel';

interface PreviewProps {
  data: ExcelData;
  config: GeneratorConfig;
  onExportXLSX: () => void;
  onBack: () => void;
  isProcessing?: boolean;
  progress?: number;
}

/**
 * 预览与导出组件
 * 
 * 展示生成的成绩条效果预览，并触发最终的导出流程。
 * 支持普通模式和模板模式的预览。
 */
const Preview: React.FC<PreviewProps> = ({ 
  data, 
  config, 
  onExportXLSX, 
  onBack,
  isProcessing = false,
  progress = 0
}) => {
  // 计算总学生数
  const totalStudents = Math.ceil(data.rows.length / (config.rowsPerStudent || 1));
  // 预览前 3 个成绩条
  const previewCount = Math.min(3, totalStudents);
  
  // 计算最大列数，确保预览宽度一致
  const maxCols = useMemo(() => {
    let max = 0;
    data.headers.forEach(h => { if (h.length > max) max = h.length; });
    data.rows.forEach(r => { if (r.length > max) max = r.length; });
    return max;
  }, [data.headers, data.rows]);

  // 提取预览学生的行数据
  const getPreviewStudentRows = (studentIdx: number) => {
    const startIdx = studentIdx * (config.rowsPerStudent || 1);
    return data.rows.slice(startIdx, startIdx + (config.rowsPerStudent || 1));
  };

  /**
   * 检查某个单元格是否被合并单元格覆盖 (针对普通模式表头)
   */
  const getHeaderCellSpan = (r: number, c: number) => {
    const merge = data.headerMerges?.find(m => 
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

  /**
   * 检查某个单元格是否被合并单元格覆盖 (针对普通模式数据行)
   */
  const getDataCellSpan = (studentIdx: number, relativeRowIdx: number, colIdx: number) => {
    const originalHeaderRows = data.headers.length;
    const absoluteRowIdx = studentIdx * config.rowsPerStudent + relativeRowIdx + originalHeaderRows;
    
    const merge = data.merges?.find(m => 
      absoluteRowIdx >= m.s.r && absoluteRowIdx <= m.e.r && colIdx >= m.s.c && colIdx <= m.e.c
    );

    if (merge) {
      if (absoluteRowIdx === merge.s.r && colIdx === merge.s.c) {
        return {
          rendered: true,
          rowSpan: Math.min(merge.e.r - merge.s.r + 1, config.rowsPerStudent - relativeRowIdx),
          colSpan: merge.e.c - merge.s.c + 1
        };
      }
      return { rendered: false, rowSpan: 1, colSpan: 1 };
    }

    return { rendered: true, rowSpan: 1, colSpan: 1 };
  };

  /**
   * 检查模板模式下的单元格合并
   */
  const getTemplateCellSpan = (r: number, c: number) => {
    if (!data.template?.merges) return { rendered: true, rowSpan: 1, colSpan: 1 };
    const merge = data.template.merges.find(m => 
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

  /**
   * 获取模板单元格的显示值
   */
  const getTemplateCellValue = (studentIdx: number, rIdx: number, cIdx: number) => {
    if (!data.template) return '';
    const address = `${colToLetter(cIdx)}${rIdx + 1}`;
    const mapping = data.template.mappings.find(m => m.cellAddress === address);
    
    if (mapping) {
      // 获取当前学生的数据
      const studentRows = getPreviewStudentRows(studentIdx);
      const flatHeaders = getFlatHeaders(data.headers);
      
      const headerIdx = flatHeaders.indexOf(mapping.headerName);
      if (headerIdx !== -1) {
        return studentRows[0][headerIdx] ?? '';
      }
    }
    
    return data.template.rows?.[rIdx]?.[cIdx] ?? '';
  };

  const templateMaxCols = useMemo(() => {
    let max = 0;
    data.template?.rows?.forEach(row => {
      if (row.length > max) max = row.length;
    });
    return Math.max(max, 5);
  }, [data.template]);

  const templateMaxRows = useMemo(() => {
    if (!data.template) return 0;
    let max = data.template.rows?.length || 0;
    
    // 检查是否有映射超出了当前行数
    data.template.mappings.forEach(m => {
      const rowMatch = m.cellAddress.match(/\d+/);
      if (rowMatch) {
        const row = parseInt(rowMatch[0]);
        if (row > max) max = row;
      }
    });
    
    // 检查合并单元格
    data.template.merges?.forEach(m => {
      if (m.e.r + 1 > max) max = m.e.r + 1;
    });

    return Math.max(max, 5);
  }, [data.template]);

  return (
    <div className="flex flex-col h-full relative">
      {isProcessing && (
        <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
          <div className="w-full max-w-md">
            <div className="mb-4 flex justify-between items-end">
              <span className="text-blue-600 font-bold text-lg">正在生成文件...</span>
              <span className="text-gray-500 font-medium">{progress}%</span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-100">
              <div 
                className="h-full bg-blue-600 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-4 text-gray-500 text-sm italic">请不要关闭页面，处理完成后将自动开始下载</p>
          </div>
        </div>
      )}

      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800">生成预览</h2>
        {data.template ? (
          <div className="mt-2 flex items-center justify-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-full inline-flex mx-auto border border-blue-100">
            <FileSpreadsheet size={16} />
            <span className="text-sm font-bold">已启用模板: {data.template.fileName}</span>
          </div>
        ) : (
          <p className="text-gray-500 mt-2">预览生成效果，确认无误后导出文件</p>
        )}
      </div>

      <div className="flex-1 overflow-auto bg-gray-100 p-6 rounded-2xl mb-8 flex flex-col items-center gap-4">
        <div className="bg-white p-8 shadow-sm w-full max-w-5xl border border-gray-200 overflow-x-auto">
          <div className="space-y-8 min-w-max px-4">
            {Array.from({ length: previewCount }).map((_, studentIdx) => (
              <React.Fragment key={studentIdx}>
                <div className="border border-gray-200 shadow-sm rounded-sm bg-white">
                  {data.template ? (
                    // 模板模式预览
                    <table className="w-full text-sm text-center border-collapse">
                      <tbody>
                        {Array.from({ length: templateMaxRows }).map((_, rIdx) => (
                          <tr key={rIdx}>
                            {Array.from({ length: templateMaxCols }).map((_, cIdx) => {
                              const span = getTemplateCellSpan(rIdx, cIdx);
                              if (!span.rendered) return null;
                              
                              const val = getTemplateCellValue(studentIdx, rIdx, cIdx);
                              const isMapped = data.template?.mappings.some(m => m.cellAddress === `${colToLetter(cIdx)}${rIdx + 1}`);
                              
                              return (
                                <td 
                                  key={cIdx} 
                                  rowSpan={span.rowSpan}
                                  colSpan={span.colSpan}
                                  className={`
                                    border border-gray-200 px-4 py-2 whitespace-nowrap min-w-[80px]
                                    ${isMapped ? 'font-bold text-blue-600 bg-blue-50/30' : 'text-gray-600'}
                                  `}
                                >
                                  {String(val ?? '')}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    // 普通模式预览
                    <table className="w-full text-sm text-center border-collapse">
                      <thead className={config.useOptimizedStyle ? 'bg-gray-100' : 'bg-gray-50'}>
                        {data.headers.map((headerRow, hIdx) => (
                          <tr key={hIdx}>
                            {Array.from({ length: maxCols }).map((_, i) => {
                              const h = headerRow[i];
                              const span = getHeaderCellSpan(hIdx, i);
                              if (!span.rendered) return null;
                              return (
                                <th 
                                  key={i} 
                                  rowSpan={span.rowSpan}
                                  colSpan={span.colSpan}
                                  className="border border-gray-200 px-4 py-2.5 font-bold whitespace-nowrap"
                                >
                                  {String(h ?? '')}
                                </th>
                              );
                            })}
                          </tr>
                        ))}
                      </thead>
                      <tbody>
                        {getPreviewStudentRows(studentIdx).map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-gray-50/50 transition-colors">
                            {Array.from({ length: maxCols }).map((_, i) => {
                              const cell = row[i];
                              const span = getDataCellSpan(studentIdx, rIdx, i);
                              if (!span.rendered) return null;
                              return (
                                <td 
                                  key={i} 
                                  rowSpan={span.rowSpan}
                                  colSpan={span.colSpan}
                                  className="border border-gray-200 px-4 py-2 whitespace-nowrap"
                                >
                                  {String(cell ?? '')}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
                {studentIdx < previewCount - 1 && (
                  <div className="flex flex-col items-center gap-1 py-2 opacity-30">
                    {Array.from({ length: config.gapRows }).map((_, i) => (
                      <div key={i} className="w-full border-t border-dashed border-gray-400 h-1" />
                    ))}
                    <span className="text-[10px] text-gray-400">间隔行 ({config.gapRows})</span>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {totalStudents > previewCount && (
          <div className="flex flex-col items-center gap-2 py-4 px-6 bg-white/50 backdrop-blur-sm rounded-xl border border-white shadow-sm">
            <p className="text-gray-500 text-sm font-medium">
              预览仅展示前 <span className="text-blue-600 font-bold">{previewCount}</span> 条成绩条
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-pulse" />
              还有 <span className="font-bold text-gray-600">{totalStudents - previewCount}</span> 名学生数据将在导出时自动生成
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 mb-8">
        <button
          onClick={onExportXLSX}
          className="flex items-center justify-between p-6 bg-white border-2 border-green-100 hover:border-green-500 rounded-2xl transition-all group shadow-sm hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-xl group-hover:bg-green-600 group-hover:text-white transition-colors">
              <FileSpreadsheet size={24} />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-gray-800">导出为 Excel</h4>
              <p className="text-xs text-gray-500">支持继续编辑样式</p>
            </div>
          </div>
          <FileDown className="text-green-500" />
        </button>
      </div>

      <div className="flex justify-between items-center pt-6 border-t">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-2.5 text-gray-600 hover:text-gray-800 font-medium transition-colors"
        >
          <ChevronLeft size={20} />
          <span>返回修改设置</span>
        </button>
        
        <div className="flex items-center gap-2 text-green-600 font-medium">
          <CheckCircle2 size={20} />
          <span>就绪，可随时下载</span>
        </div>
      </div>
    </div>
  );
};

export default Preview;
