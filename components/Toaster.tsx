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
    <div className="fixed top-4 right-4 z-[9999] space-y-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`glass-panel px-5 py-4 rounded-2xl border ${typeClasses[t.type || 'info']} shadow-xl max-w-sm flex items-start space-x-3 backdrop-blur-xl transform transition-all duration-300 hover:scale-[1.02]`}
        >
          <div className="flex-1 text-sm leading-snug">{t.message}</div>
          <button
            className="text-xs opacity-60 hover:opacity-100 transition-opacity duration-200 p-1 rounded-lg hover:bg-white/10"
            onClick={() => removeToast(t.id)}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};
