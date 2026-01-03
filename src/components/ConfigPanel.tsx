import React from 'react';
import { GeneratorConfig } from '../types';
import { ChevronLeft, ChevronRight, Layout, Rows, Sparkles } from 'lucide-react';

interface ConfigPanelProps {
  config: GeneratorConfig;
  onChange: (config: GeneratorConfig) => void;
  onNext: () => void;
  onBack: () => void;
}

/**
 * 生成配置面板组件
 */
const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onChange, onNext, onBack }) => {
  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto">
      <div className="mb-10 text-center">
        <h2 className="text-2xl font-bold text-gray-800">设置生成参数</h2>
        <p className="text-gray-500 mt-2">个性化您的成绩条样式和间距</p>
      </div>

      <div className="space-y-8">
        {/* 间距设置 */}
        <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Rows size={20} />
            </div>
            <h3 className="font-bold text-gray-800">间隔设置</h3>
          </div>
          <div className="flex flex-col gap-4">
            <label className="text-sm text-gray-600">
              每个成绩条之间的空行数量
            </label>
            <div className="flex items-center gap-6">
              <input 
                type="range" 
                min="0" 
                max="5" 
                step="1"
                value={config.gapRows}
                onChange={(e) => onChange({ ...config, gapRows: parseInt(e.target.value) })}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <span className="w-12 text-center font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-md border border-blue-100">
                {config.gapRows}
              </span>
            </div>
            <p className="text-xs text-gray-400">设置为 0 表示紧凑排列，推荐设置为 1 或 2 以便裁剪。</p>
          </div>
        </section>

        {/* 样式设置 */}
        <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <Layout size={20} />
            </div>
            <h3 className="font-bold text-gray-800">样式与结构</h3>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => onChange({ ...config, useOptimizedStyle: false })}
                className={`
                  p-4 rounded-xl border-2 transition-all text-left
                  ${!config.useOptimizedStyle 
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100' 
                    : 'border-white bg-white hover:border-gray-200'}
                `}
              >
                <h4 className="font-bold text-gray-800 mb-1">原始样式</h4>
                <p className="text-xs text-gray-500">保留表格的基础线条和默认间距。</p>
              </button>
              <button
                onClick={() => onChange({ ...config, useOptimizedStyle: true })}
                className={`
                  p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden
                  ${config.useOptimizedStyle 
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100' 
                    : 'border-white bg-white hover:border-gray-200'}
                `}
              >
                {config.useOptimizedStyle && (
                  <div className="absolute top-0 right-0 p-1 bg-blue-500 text-white rounded-bl-lg">
                    <Sparkles size={12} />
                  </div>
                )}
                <h4 className="font-bold text-gray-800 mb-1">打印优化</h4>
                <p className="text-xs text-gray-500">更清晰的边框和对比度，适合批量打印。</p>
              </button>
            </div>

            <div className="flex flex-col gap-3 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700">单人成绩行数</label>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => onChange({ ...config, rowsPerStudent: Math.max(1, config.rowsPerStudent - 1) })}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-blue-600">{config.rowsPerStudent}</span>
                  <button 
                    onClick={() => onChange({ ...config, rowsPerStudent: Math.min(10, config.rowsPerStudent + 1) })}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600"
                  >
                    +
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400">
                如果原始表格中一个学生的数据占用了多行（例如包含评语行），请设置此参数。
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="flex justify-between items-center mt-12 pt-8 border-t">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-2.5 text-gray-600 hover:text-gray-800 font-medium transition-colors"
        >
          <ChevronLeft size={20} />
          <span>上一步</span>
        </button>
        
        <button
          onClick={onNext}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
        >
          <span>预览结果</span>
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default ConfigPanel;
