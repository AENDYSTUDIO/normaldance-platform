import React from 'react';
import { useToastStore } from '../stores/useToastStore';

const typeClasses: Record<string, string> = {
  info: 'border-white/20 text-white bg-white/10',
  success: 'border-green-500/30 text-green-300 bg-green-500/10',
  warning: 'border-yellow-500/30 text-yellow-300 bg-yellow-500/10',
  error: 'border-red-500/30 text-red-300 bg-red-500/10',
};

export const Toaster: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`glass-panel px-4 py-3 rounded-xl border ${typeClasses[t.type || 'info']} shadow-lg max-w-xs flex items-start space-x-3`}
        >
          <div className="flex-1 text-sm leading-snug">{t.message}</div>
          <button className="text-xs opacity-60 hover:opacity-100" onClick={() => removeToast(t.id)}>
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};
