import React from 'react';
import { ExcelData, GeneratorConfig } from '../types';
import { ChevronLeft, FileDown, FileSpreadsheet, FileText, CheckCircle2 } from 'lucide-react';

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
 * 主要功能：
 * 1. 实时预览：根据用户配置（间距、样式、单人行数）实时展示前 3 个成绩条。
 * 2. 导出触发：调用 exporter.ts 进行 Excel 文件的后台生成与下载。
 * 3. 进度展示：在导出大文件时显示遮罩层和百分比进度条。
 * 4. 样式同步：预览效果与最终导出的 Excel 样式高度一致。
 */
const Preview: React.FC<PreviewProps> = ({ 
  data, 
  config, 
  onExportXLSX, 
  onBack,
  isProcessing = false,
  progress = 0
}) => {
  // 预览前 3 个成绩条
  const previewCount = Math.min(3, Math.ceil(data.rows.length / config.rowsPerStudent));
  
  // 提取预览学生的行数据
  const getPreviewStudentRows = (studentIdx: number) => {
    const startIdx = studentIdx * config.rowsPerStudent;
    return data.rows.slice(startIdx, startIdx + config.rowsPerStudent);
  };

  /**
   * 检查某个单元格是否被合并单元格覆盖 (针对表头)
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
   * 检查某个单元格是否被合并单元格覆盖 (针对数据行)
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
        <p className="text-gray-500 mt-2">预览生成效果，确认无误后导出文件</p>
      </div>

      <div className="flex-1 overflow-auto bg-gray-100 p-6 rounded-2xl mb-8 flex flex-col items-center gap-4">
        <div className="bg-white p-8 shadow-sm w-full max-w-2xl border border-gray-200">
          <div className="space-y-6">
            {Array.from({ length: previewCount }).map((_, studentIdx) => {
              const studentRows = getPreviewStudentRows(studentIdx);
              return (
                <React.Fragment key={studentIdx}>
                  <div className={`border ${config.useOptimizedStyle ? 'border-gray-300' : 'border-gray-200'}`}>
                    <table className="w-full text-xs text-center border-collapse">
                      <thead className={config.useOptimizedStyle ? 'bg-gray-50' : ''}>
                        {data.headers.map((headerRow, hIdx) => (
                          <tr key={hIdx}>
                            {headerRow.map((h, i) => {
                              const span = getHeaderCellSpan(hIdx, i);
                              if (!span.rendered) return null;
                              return (
                                <th 
                                  key={i} 
                                  rowSpan={span.rowSpan}
                                  colSpan={span.colSpan}
                                  className={`border px-2 py-1 font-bold ${config.useOptimizedStyle ? 'border-gray-300' : 'border-gray-200'}`}
                                >
                                  {String(h || '')}
                                </th>
                              );
                            })}
                          </tr>
                        ))}
                      </thead>
                      <tbody>
                        {studentRows.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {row.map((cell, i) => {
                              const span = getDataCellSpan(studentIdx, rIdx, i);
                              if (!span.rendered) return null;
                              return (
                                <td 
                                  key={i} 
                                  rowSpan={span.rowSpan}
                                  colSpan={span.colSpan}
                                  className={`border px-2 py-1 ${config.useOptimizedStyle ? 'border-gray-300' : 'border-gray-200'}`}
                                >
                                  {String(cell || '')}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
              );
            })}
            
            {Math.ceil(data.rows.length / config.rowsPerStudent) > previewCount && (
              <div className="text-center py-4 border-t border-dashed text-gray-400 text-sm">
                ... 还有 {Math.ceil(data.rows.length / config.rowsPerStudent) - previewCount} 名学生数据未显示 ...
              </div>
            )}
          </div>
        </div>
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
