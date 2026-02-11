import React from 'react';
import { OwnerNotification } from '../types';

interface OwnerStatusNotificationsProps {
  notifications: OwnerNotification[];
  onDismiss: (id: string) => void;
  onClearAll: () => void;
}

const OwnerStatusNotifications: React.FC<OwnerStatusNotificationsProps> = ({
  notifications,
  onDismiss,
  onClearAll,
}) => {
  if (!notifications || notifications.length === 0) return null;

  const getTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  const getStatusLabel = (status: OwnerNotification['status']): string => {
    switch (status) {
      case 'served':
        return 'SERVED';
      default:
        return status.toUpperCase();
    }
  };

  const getStatusColor = (status: OwnerNotification['status']): string => {
    switch (status) {
      case 'served':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      default:
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#170e10] border-b border-white/10 shadow-lg">
      <div className="max-w-screen-xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary/60">
            Notifications ({notifications.length})
          </span>
          <button
            onClick={onClearAll}
            className="text-[10px] font-bold uppercase text-text-secondary/40 hover:text-white transition-colors"
          >
            Clear all
          </button>
        </div>
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border ${getStatusColor(notification.status)} backdrop-blur-sm`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="material-symbols-outlined text-[20px] flex-shrink-0">
                  {notification.status === 'served' ? 'check_circle' : 'notifications'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    Order {notification.code}
                    {notification.tableNumber && ` for Table ${notification.tableNumber}`}
                  </p>
                  <p className="text-[10px] text-text-secondary/60">
                    is {getStatusLabel(notification.status)} • {getTimeAgo(notification.createdAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onDismiss(notification.id)}
                className="flex-shrink-0 p-1 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Dismiss notification"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OwnerStatusNotifications;
