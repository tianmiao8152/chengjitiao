import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { ToastItem, ToastType } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并 Tailwind 类名
 * @param inputs 类名数组
 * @returns 合并后的类名字符串
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Toast 通知系统 Provider 组件
 * @param children 子组件
 */
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // 如果是错误类型，同时在控制台输出
    if (type === 'error') {
      console.error(`[Error] ${message}`);
    } else {
      console.log(`[${type}] ${message}`);
    }

    // 3秒后自动移除
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

/**
 * 使用 Toast 的 Hook
 * @returns showToast 函数
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProps {
  toast: ToastItem;
  onClose: () => void;
}

/**
 * 单个 Toast 组件
 * @param toast 通知项数据
 * @param onClose 关闭回调
 */
const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[300px] pointer-events-auto',
        styles[toast.type]
      )}
    >
      <div className="flex-shrink-0">{icons[toast.type]}</div>
      <p className="flex-grow text-sm font-medium">{toast.message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 ml-2 hover:opacity-70 transition-opacity"
        aria-label="Close"
      >
        <X className="w-4 h-4 opacity-50" />
      </button>
    </motion.div>
  );
};
