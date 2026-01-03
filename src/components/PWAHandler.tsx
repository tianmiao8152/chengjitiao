import React, { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Download, X, RefreshCw } from 'lucide-react';

/**
 * PWA 处理器，负责显示安装提示和更新通知
 */
const PWAHandler: React.FC = () => {
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    });
  }, []);

  /**
   * 处理安装操作，触发浏览器安装提示
   */
  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  /**
   * 关闭所有提示通知
   */
  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
    setShowInstallBanner(false);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {/* 离线就绪提示 */}
      {offlineReady && (
        <div className="bg-green-600 text-white p-4 rounded-xl shadow-2xl flex items-center justify-between pointer-events-auto animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3">
            <RefreshCw size={20} />
            <span className="text-sm font-medium">应用已就绪，可离线使用！</span>
          </div>
          <button onClick={close} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>
      )}

      {/* 更新提示 */}
      {needRefresh && (
        <div className="bg-blue-600 text-white p-4 rounded-xl shadow-2xl flex items-center justify-between pointer-events-auto animate-in slide-in-from-bottom-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-bold">新版本已就绪</span>
            <span className="text-xs opacity-90">点击刷新以获取最新功能</span>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => updateServiceWorker(true)}
              className="bg-white text-blue-600 px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-50 transition-colors"
            >
              刷新
            </button>
            <button onClick={close} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* 安装提示 */}
      {showInstallBanner && (
        <div className="bg-white border border-blue-100 p-4 rounded-xl shadow-2xl flex items-center justify-between pointer-events-auto animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <Download size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-gray-800">安装成绩条生成器</span>
              <span className="text-xs text-gray-500">添加到主屏幕，使用更方便</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleInstall}
              className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
            >
              安装
            </button>
            <button onClick={close} className="p-1 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PWAHandler;
