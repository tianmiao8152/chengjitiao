import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Table, Settings, Eye, Download, Trash2, WifiOff } from 'lucide-react';
import { ExcelData, GeneratorConfig, AppStep, ProgressStatus } from './types';
import { readExcelFile, validateExcelFile } from './utils/excel';
import { exportToXLSX } from './utils/exporter';
import StepIndicator from './components/StepIndicator';
import FileUploader from './components/FileUploader';
import HeaderSelector from './components/HeaderSelector';
import ConfigPanel from './components/ConfigPanel';
import Preview from './components/Preview';
import PWAHandler from './components/PWAHandler';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('upload');
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [config, setConfig] = useState<GeneratorConfig>({
    gapRows: 1,
    useOptimizedStyle: true,
    headerRows: 1
  });
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [progress, setProgress] = useState<ProgressStatus | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!validateExcelFile(file)) {
      alert('请上传有效的 Excel 文件 (.xlsx 或 .xls)');
      return;
    }
    try {
      const data = await readExcelFile(file);
      setExcelData(data);
      setStep('select');
    } catch (error) {
      alert(error instanceof Error ? error.message : '解析文件失败');
    }
  };

  const handleClearData = () => {
    if (confirm('确定要清除所有本地数据吗？')) {
      setExcelData(null);
      setStep('upload');
    }
  };

  const handleExportXLSX = async () => {
    if (!excelData) return;
    setProgress({ current: 0, total: 100, message: '正在生成 Excel 文件...' });
    try {
      await exportToXLSX(excelData, config, (p) => {
        setProgress(prev => prev ? { ...prev, current: p } : null);
      });
    } catch (e) {
      alert('导出失败');
    } finally {
      setProgress(null);
    }
  };

  const steps = [
    { id: 'upload', title: '上传文件', icon: <Upload size={20} /> },
    { id: 'select', title: '选择表头', icon: <Table size={20} /> },
    { id: 'config', title: '生成设置', icon: <Settings size={20} /> },
    { id: 'preview', title: '预览导出', icon: <Eye size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <PWAHandler />
      {/* 顶部状态栏 */}
      {isOffline && (
        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 flex items-center justify-center gap-2 text-sm">
          <WifiOff size={16} />
          <span>您当前处于离线状态，但功能依然可用 🚀</span>
        </div>
      )}

      <header className="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Table size={24} />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            离线成绩条生成器
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {excelData && (
            <button
              onClick={handleClearData}
              className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
            >
              <Trash2 size={16} />
              <span>清除数据</span>
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <StepIndicator steps={steps} currentStep={step} />

        <div className="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 min-h-[400px] overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-6 md:p-8"
            >
              {step === 'upload' && (
                <FileUploader onUpload={handleFileUpload} />
              )}
              {step === 'select' && excelData && (
                <HeaderSelector 
                  data={excelData} 
                  onConfirm={(newHeaders, rows, headerMerges) => {
                    setExcelData({ ...excelData, headers: newHeaders, rows, headerMerges });
                    setStep('config');
                  }}
                  onBack={() => setStep('upload')}
                />
              )}
              {step === 'config' && (
                <ConfigPanel 
                  config={config} 
                  onChange={setConfig}
                  onNext={() => setStep('preview')}
                  onBack={() => setStep('select')}
                />
              )}
              {step === 'preview' && excelData && (
                <Preview 
                  data={excelData} 
                  config={config}
                  onExportXLSX={handleExportXLSX}
                  onBack={() => setStep('config')}
                  isProcessing={!!progress}
                  progress={progress?.current || 0}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <footer className="py-8 text-center text-gray-400 text-sm">
        <p>所有处理均在本地浏览器完成，数据不会上传到服务器</p>
        <p className="mt-1">© 2024 离线成绩条生成器</p>
      </footer>
    </div>
  );
};

export default App;
