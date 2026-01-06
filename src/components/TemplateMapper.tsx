import React, { useState, useEffect } from 'react';
import { X, Table as TableIcon, MapPin, AlertCircle } from 'lucide-react';
import { TemplateMapping } from '../types';

interface TemplateMapperProps {
  headers: string[];
  initialMappings?: TemplateMapping[];
  onMappingChange: (mappings: TemplateMapping[]) => void;
  onClose: () => void;
}

/**
 * 模板映射配置组件
 * 
 * 用于让用户设置原始表头与模板单元格之间的对应关系。
 * @param headers 原始 Excel 的表头列表
 * @param initialMappings 初始映射关系
 * @param onMappingChange 映射关系变更回调
 * @param onClose 关闭回调
 */
const TemplateMapper: React.FC<TemplateMapperProps> = ({ 
  headers, 
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

  const handleAddressChange = (headerName: string, address: string) => {
    const newMappings = mappings.map(m => 
      m.headerName === headerName ? { ...m, cellAddress: address.toUpperCase() } : m
    );
    setMappings(newMappings);
    onMappingChange(newMappings);
  };

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

      <div className="p-6">
        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100 mb-6">
          <AlertCircle className="text-amber-500 mt-0.5 shrink-0" size={18} />
          <div className="text-sm text-amber-800">
            <p className="font-bold mb-1">使用说明：</p>
            <p>请为每个需要导出的字段指定模板中的单元格位置（例如：A1, B5）。</p>
            <p>留空的字段将不会被填入模板。</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {mappings.map((mapping, idx) => (
            <div 
              key={idx}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-400 mb-1">原始表头</div>
                <div className="font-bold text-gray-700 truncate" title={mapping.headerName}>
                  {mapping.headerName}
                </div>
              </div>
              
              <div className="w-px h-8 bg-gray-200" />
              
              <div className="w-32 shrink-0">
                <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                  <MapPin size={12} />
                  <span>模板位置</span>
                </div>
                <input
                  type="text"
                  placeholder="如: A1"
                  value={mapping.cellAddress}
                  onChange={(e) => handleAddressChange(mapping.headerName, e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateMapper;
