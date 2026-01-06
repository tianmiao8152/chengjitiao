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
import { ToastProvider, useToast } from './components/Toast';

import * as XLSX from 'xlsx';

/**
 * 核心逻辑组件
 */
const AppContent: React.FC = () => {
  const [step, setStep] = useState<AppStep>('upload');
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [config, setConfig] = useState<GeneratorConfig>({
    gapRows: 1,
    useOptimizedStyle: true,
    headerRows: 1,
    rowsPerStudent: 1
  });
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [progress, setProgress] = useState<ProgressStatus | null>(null);
  const { showToast } = useToast();

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

  /**
   * 全局错误监听
   */
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      showToast(`系统错误: ${event.message}`, 'error');
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message = event.reason instanceof Error ? event.reason.message : String(event.reason);
      showToast(`异步错误: ${message}`, 'error');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [showToast]);

  const handleFileUpload = async (file: File) => {
    if (!validateExcelFile(file)) {
      showToast('请上传有效的 Excel 文件 (.xlsx 或 .xls)', 'error');
      return;
    }
    try {
      const { workbook: wb, ...data } = await readExcelFile(file);
      setExcelData(data);
      setWorkbook(wb);
      setStep('select');
      showToast('文件解析成功', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : '解析文件失败', 'error');
    }
  };

  const handleClearData = () => {
    if (confirm('确定要清除所有本地数据吗？')) {
      setExcelData(null);
      setWorkbook(null);
      setStep('upload');
      showToast('数据已清除', 'info');
    }
  };

  const handleExportXLSX = async () => {
    if (!excelData) return;
    setProgress({ current: 0, total: 100, message: '正在生成 Excel 文件...' });
    try {
      await exportToXLSX(excelData, config, (p) => {
        setProgress(prev => prev ? { ...prev, current: p } : null);
      });
      showToast('文件导出成功', 'success');
    } catch (e) {
      const message = e instanceof Error ? e.message : '导出失败';
      showToast(message, 'error');
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
          <div className="bg-blue-600 p-2 rounded-lg">
            <Table className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">成绩条生成器</h1>
            <p className="text-xs text-gray-500">Fast & Offline Excel Splitter</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {excelData && (
            <button
              onClick={handleClearData}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="清除数据"
            >
              <Trash2 size={20} />
            </button>
          )}
          <a
            href="https://github.com/TianMiao8152/chengjitiao"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <StepIndicator steps={steps} currentStep={step} />

        <div className="mt-8">
          <AnimatePresence mode="wait">
            {step === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <FileUploader onUpload={handleFileUpload} />
              </motion.div>
            )}

            {step === 'select' && excelData && (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <HeaderSelector
                  data={excelData}
                  workbook={workbook || undefined}
                  onSheetChange={(newData) => setExcelData(newData)}
                  onConfirm={(headers, rows, headerMerges) => {
                    setExcelData({ ...excelData, headers, rows, headerMerges });
                    setStep('config');
                    showToast('表头设置已保存', 'success');
                  }}
                  onBack={() => setStep('upload')}
                />
              </motion.div>
            )}

            {step === 'config' && (
              <motion.div
                key="config"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <ConfigPanel
                  config={config}
                  onChange={setConfig}
                  onNext={() => setStep('preview')}
                  onBack={() => setStep('select')}
                />
              </motion.div>
            )}

            {step === 'preview' && excelData && (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Preview
                  data={excelData}
                  config={config}
                  onExportXLSX={handleExportXLSX}
                  onBack={() => setStep('config')}
                  isProcessing={!!progress}
                  progress={progress?.current || 0}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="py-8 text-center text-gray-400 text-sm">
        <p>所有处理均在本地浏览器完成，数据不会上传到服务器</p>
        <p className="mt-1">Powered By <a href="https://github.com/TianMiao8152/chengjitiao" target="_blank" rel="noopener noreferrer">TianMiao</a></p>
      </footer>

      {/* 全局加载进度 */}
      <AnimatePresence>
        {progress && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
                <h3 className="text-lg font-bold mb-2">{progress.message}</h3>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
                  <motion.div
                    className="bg-blue-600 h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.current}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500">{Math.round(progress.current)}% 完成</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * 应用根组件
 * 
 * 管理整个成绩条生成流程的状态，包括：
 * 1. 流程控制：upload -> select -> config -> preview。
 * 2. 数据管理：存储解析后的 Excel 数据。
 * 3. 配置管理：存储用户对生成样式的偏好。
 * 4. 离线支持：监听网络状态。
 */
const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;
