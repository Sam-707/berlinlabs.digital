import React from 'react';
import { Toast } from '../types';
import ToastComponent from './Toast';

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  // Show max 3 toasts, newest first
  const visibleToasts = toasts.slice(-3).reverse();

  if (visibleToasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      {visibleToasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto" onClick={() => onDismiss(toast.id)}>
          <ToastComponent toast={toast} onDismiss={() => onDismiss(toast.id)} />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
