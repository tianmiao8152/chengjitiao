import React from 'react';
import { GeneratorConfig } from '../types';
import { Layout, Rows, Sparkles } from 'lucide-react';

interface ConfigPanelProps {
  config: GeneratorConfig;
  onChange: (config: GeneratorConfig) => void;
}

/**
 * 生成配置面板组件
 * 
 * 提供用户界面用于调整生成成绩条的参数，包括：
 * - 间隔行数：设置成绩条之间的空行，方便手动裁剪。
 * - 样式选择：原始样式或针对打印优化的加重样式。
 * - 结构设置：设置每个学生数据占用的原始行数。
 */
const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onChange }) => {
  return (
    <div className="flex flex-col h-full space-y-10">
      {/* 间距设置 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <Rows size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-base">裁剪间距</h3>
            <p className="text-xs text-gray-400">设置成绩条之间的留白距离</p>
          </div>
        </div>
        
        <div className="px-1">
          <div className="flex justify-between items-center mb-4">
            <label className="text-sm font-semibold text-gray-600">
              空行数量
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                {config.gapRows} 行
              </span>
            </div>
          </div>
          <div className="relative flex items-center group">
            <input 
              type="range" 
              min="0" 
              max="5" 
              step="1"
              value={config.gapRows}
              onChange={(e) => onChange({ ...config, gapRows: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:bg-gray-300 transition-colors"
            />
          </div>
          <div className="flex justify-between mt-3 px-1 text-[11px] font-medium text-gray-400">
            <span>紧凑 (0)</span>
            <span>适中 (2)</span>
            <span>宽松 (5)</span>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      {/* 样式设置 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
            <Layout size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-base">视觉风格</h3>
            <p className="text-xs text-gray-400">选择生成的表格外观样式</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={() => onChange({ ...config, useOptimizedStyle: false })}
            className={`
              p-4 rounded-2xl border-2 transition-all text-left flex items-start gap-4
              ${!config.useOptimizedStyle 
                ? 'border-blue-500 bg-blue-50/50 ring-4 ring-blue-50' 
                : 'border-gray-100 bg-white hover:border-gray-300 hover:bg-gray-50'}
            `}
          >
            <div className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${!config.useOptimizedStyle ? 'border-blue-600' : 'border-gray-300'}`}>
              {!config.useOptimizedStyle && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
            </div>
            <div>
              <span className={`block font-bold text-sm ${!config.useOptimizedStyle ? 'text-blue-700' : 'text-gray-700'}`}>
                经典简约
              </span>
              <span className="text-xs text-gray-400 mt-1 block">
                标准的表格线条，适合节省墨水
              </span>
            </div>
          </button>
          
          <button
            onClick={() => onChange({ ...config, useOptimizedStyle: true })}
            className={`
              p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden flex items-start gap-4
              ${config.useOptimizedStyle 
                ? 'border-blue-500 bg-blue-50/50 ring-4 ring-blue-50' 
                : 'border-gray-100 bg-white hover:border-gray-300 hover:bg-gray-50'}
            `}
          >
            {config.useOptimizedStyle && (
              <div className="absolute top-0 right-0 p-1.5 bg-blue-500 text-white rounded-bl-xl">
                <Sparkles size={12} />
              </div>
            )}
            <div className={`mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center ${config.useOptimizedStyle ? 'border-blue-600' : 'border-gray-300'}`}>
              {config.useOptimizedStyle && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
            </div>
            <div>
              <span className={`block font-bold text-sm ${config.useOptimizedStyle ? 'text-blue-700' : 'text-gray-700'}`}>
                打印优化
              </span>
              <span className="text-xs text-gray-400 mt-1 block">
                加重表头与隔行变色，易于阅读
              </span>
            </div>
          </button>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      {/* 结构设置 */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
            <Rows size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-base">数据结构</h3>
            <p className="text-xs text-gray-400">处理复杂的 Excel 多行数据</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-semibold text-gray-700">单人占行数</label>
            <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
              <button 
                onClick={() => onChange({ ...config, rowsPerStudent: Math.max(1, config.rowsPerStudent - 1) })}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 active:scale-90 transition-all"
              >
                -
              </button>
              <span className="w-8 text-center font-black text-gray-800 text-base">{config.rowsPerStudent}</span>
              <button 
                onClick={() => onChange({ ...config, rowsPerStudent: Math.min(10, config.rowsPerStudent + 1) })}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 active:scale-90 transition-all"
              >
                +
              </button>
            </div>
          </div>
          <div className="flex gap-2 bg-orange-50/50 p-3 rounded-xl">
            <div className="text-orange-500 shrink-0 mt-0.5">
              <Sparkles size={14} />
            </div>
            <p className="text-[11px] text-orange-700/80 leading-relaxed">
              如果原始表中一个学生占用了多行（如包含评语），请增加此数值以完整提取。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ConfigPanel;
