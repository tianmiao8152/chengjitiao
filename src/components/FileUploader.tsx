import React, { useCallback, useState } from 'react';
import { Upload, FileType, AlertCircle } from 'lucide-react';

interface FileUploaderProps {
  onUpload: (file: File) => void;
}

/**
 * 文件上传组件
 * 
 * 实现了一个美观的上传区域，支持：
 * 1. 原生文件选择：点击区域触发隐形的 input[type="file"]。
 * 2. 拖拽上传：支持 drag/drop 交互，并有视觉反馈。
 * 3. 安全提示：明确告知用户数据在本地处理。
 */
const FileUploader: React.FC<FileUploaderProps> = ({ onUpload }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onUpload(files[0]);
    }
  }, [onUpload]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onUpload(files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-gray-800">上传 Excel 文件</h2>
        <p className="text-gray-500 mt-2">支持 .xlsx 和 .xls 格式，单个文件建议不超过 10,000 行</p>
      </div>

      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`
          w-full max-w-xl border-2 border-dashed rounded-3xl p-12
          flex flex-col items-center justify-center transition-all duration-300
          cursor-pointer group
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'}
        `}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".xlsx, .xls"
          className="hidden"
          onChange={handleFileInput}
        />
        
        <div className={`
          w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300
          ${isDragging ? 'scale-110 bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500'}
        `}>
          <Upload size={40} />
        </div>

        <p className="text-lg font-medium text-gray-700">
          点击或拖拽文件到此处
        </p>
        <p className="text-sm text-gray-400 mt-2">
          所有数据处理仅在本地进行，确保隐私安全
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-4xl">
        {[
          { icon: <FileType className="text-blue-500" />, title: "格式支持", desc: ".xlsx / .xls" },
          { icon: <FileType className="text-purple-500" />, title: "模板匹配", desc: "支持自定义导出样式" },
          { icon: <AlertCircle className="text-green-500" />, title: "本地安全", desc: "不上传服务器" },
          { icon: <FileType className="text-orange-500" />, title: "离线可用", desc: "PWA 缓存支持" },
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="mt-1">{item.icon}</div>
            <div>
              <h4 className="font-semibold text-sm">{item.title}</h4>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileUploader;
