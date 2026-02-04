import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Step {
  id: string;
  title: string;
  icon: React.ReactNode;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: string;
}

/**
 * 步骤进度指示器组件
 * 
 * 视觉化展示当前流程进度，包括：
 * 1. 节点状态：已完成（蓝色）、进行中（高亮蓝色）、待处理（灰色）。
 * 2. 连接线动画：随着步骤推进，连接线会有从左往右的填充动画。
 * 3. 响应式布局：在各种屏幕尺寸下保持居中对齐。
 */
const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="flex items-center justify-between w-full max-w-4xl mx-auto px-4">
      {steps.map((step, index) => {
        const isActive = index <= currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center relative group">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 z-10",
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                    : "bg-gray-200 text-gray-500"
                )}
              >
                {step.icon}
              </div>
              <span 
                className={cn(
                  "mt-2 text-xs font-medium transition-colors",
                  isCurrent ? "text-blue-600" : "text-gray-400"
                )}
              >
                {step.title}
              </span>
            </div>
            
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-2 -mt-6 bg-gray-100 overflow-hidden">
                <div 
                  className={cn(
                    "h-full bg-blue-600 transition-all duration-500 ease-in-out",
                    index < currentIndex ? "w-full" : "w-0"
                  )}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepIndicator;
