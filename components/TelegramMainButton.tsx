import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Check, Clock, Music, ListMusic, Plus } from 'lucide-react';
import { initTelegramWebApp, isTelegramWebApp } from '../utils/telegram';

export interface TelegramMainButtonProps {
  text?: string;
  color?: string;
  textColor?: string;
  onClick?: () => void;
  disabled?: boolean;
  showProgress?: boolean;
  loading?: boolean;
  mode?: 'default' | 'upload' | 'create' | 'action';
}

export const TelegramMainButtonFixed: React.FC<TelegramMainButtonProps> = ({
  text = 'Continue',
  color = '#007AFF',
  textColor = '#FFFFFF',
  onClick,
  disabled = false,
  showProgress = false,
  loading = false,
  mode = 'default'
}) => {
  const [webApp, setWebApp] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const telegramApp = initTelegramWebApp();
    setWebApp(telegramApp);
    setIsReady(!!telegramApp?.MainButton);
  }, []);

  useEffect(() => {
    if (!webApp?.MainButton || !isReady) return;

    const mainButton = webApp.MainButton;

    // Set button properties
    mainButton.setText(loading ? 'Loading...' : text);
    mainButton.color = color;
    mainButton.textColor = textColor;

    if (disabled || loading) {
      mainButton.disable();
      mainButton.hideProgress();
    } else {
      mainButton.enable();
    }

    if (showProgress && !loading) {
      mainButton.showProgress();
    } else if (!loading) {
      mainButton.hideProgress();
    }

    // Show/hide button
    if (text || mode !== 'default') {
      mainButton.show();
    } else {
      mainButton.hide();
    }

    // Handle click
    if (onClick) {
      mainButton.onClick(onClick);
    }

  }, [webApp, text, color, textColor, disabled, loading, showProgress, onClick, isReady, mode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (webApp?.MainButton) {
        webApp.MainButton.offClick(onClick || (() => {}));
      }
    };
  }, [webApp, onClick]);

  const getModeIcon = () => {
    switch (mode) {
      case 'upload':
        return <Upload className="w-4 h-4" />;
      case 'create':
        return <Plus className="w-4 h-4" />;
      case 'action':
        return <Check className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Visual fallback for non-Telegram environment */}
      {!isTelegramWebApp() && (text || mode !== 'default') && (
        <motion.button
          onClick={onClick}
          disabled={disabled || loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{ backgroundColor: color, color: textColor }}
          className="fixed bottom-4 left-4 right-4 z-50 px-6 py-3 rounded-xl font-medium shadow-lg backdrop-blur-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-center gap-2">
            {loading && (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            {showProgress && !loading && (
              <Clock className="w-4 h-4" />
            )}
            {getModeIcon()}
            <span>{loading ? 'Loading...' : text}</span>
          </div>
        </motion.button>
      )}

      {/* Telegram Main Button Fallback */}
      {isTelegramWebApp() && (
        <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel border border-white/20 px-6 py-3 rounded-xl font-medium shadow-xl"
          >
            <div className="flex items-center justify-center gap-2">
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {showProgress && !loading && (
                <Clock className="w-4 h-4 text-white" />
              )}
              {getModeIcon()}
              <span className="text-white">{loading ? 'Loading...' : text}</span>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};