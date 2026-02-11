import React, { useEffect, useState } from 'react';
import { Toast as ToastType, ToastVariant } from '../types';

interface ToastProps {
  toast: ToastType;
  onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const duration = toast.duration || 4000;
    const interval = 50; // Update every 50ms
    const decrement = (100 / (duration / interval));

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= decrement) {
          clearInterval(timer);
          return 0;
        }
        return prev - decrement;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [toast.duration]);

  const variantConfig: Record<ToastVariant, { bg: string; icon: string; textColor: string; progressColor: string }> = {
    success: {
      bg: 'bg-emerald-500',
      icon: 'check_circle',
      textColor: 'text-white',
      progressColor: 'bg-white/30',
    },
    error: {
      bg: 'bg-red-500',
      icon: 'error',
      textColor: 'text-white',
      progressColor: 'bg-white/30',
    },
    info: {
      bg: 'bg-blue-500',
      icon: 'info',
      textColor: 'text-white',
      progressColor: 'bg-white/30',
    },
  };

  const config = variantConfig[toast.variant];

  return (
    <div className={`${config.bg} ${config.textColor} rounded-2xl shadow-2xl p-4 min-w-[300px] max-w-[400px] animate-slide-in-right relative overflow-hidden`}>
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div
          className={`h-full ${config.progressColor} transition-all duration-50 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-[24px] flex-shrink-0">{config.icon}</span>
        <p className="text-sm font-medium flex-1 pr-6">{toast.message}</p>
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Dismiss"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  );
};

export default Toast;
