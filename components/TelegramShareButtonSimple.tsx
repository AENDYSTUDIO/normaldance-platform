import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Send, Music, ListMusic } from 'lucide-react';
import { isTelegramWebApp, shareTrackToTelegram, sharePlaylistToTelegram } from '../utils/telegram';
import { Track, Playlist } from '../types';

interface TelegramShareButtonSimpleProps {
  item: Track | Playlist;
  type: 'track' | 'playlist';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  showLabel?: boolean;
}

export const TelegramShareButtonSimple: React.FC<TelegramShareButtonSimpleProps> = ({
  item,
  type,
  size = 'md',
  variant = 'primary',
  className = '',
  showLabel = true
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const isTelegram = isTelegramWebApp();

  const handleShare = async () => {
    setIsSharing(true);
    try {
      if (type === 'track') {
        await shareTrackToTelegram(item as Track);
      } else {
        await sharePlaylistToTelegram(item as Playlist);
      }
    } catch (error) {
      console.error('Failed to share to Telegram:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-2 text-xs';
      case 'lg':
        return 'p-4 text-lg';
      default:
        return 'p-3 text-sm';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-white/10 hover:bg-white/20 text-white';
      case 'ghost':
        return 'hover:bg-white/10 text-gray-400 hover:text-white';
      default:
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600';
    }
  };

  const getIconClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-3 h-3';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-4 h-4';
    }
  };

  const getItemTitle = () => {
    if (type === 'track') {
      const track = item as Track;
      return `${track.title} - ${track.artist}`;
    } else {
      const playlist = item as Playlist;
      return playlist.name;
    }
  };

  return (
    <motion.button
      onClick={isTelegram ? handleShare : undefined}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      disabled={isSharing}
      className={`flex items-center gap-2 rounded-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed ${getVariantClasses()} ${getSizeClasses()} ${className}`}
    >
      {isSharing ? (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>
          {isTelegram ? (
            <Send className={getIconClasses()} />
          ) : (
            <Share2 className={getIconClasses()} />
          )}
          {showLabel && (
            <span>{isSharing ? 'Sharing...' : 'Share'}</span>
          )}
        </>
      )}
    </motion.button>
  );
};

// Quick Share Components for inline use
export const QuickShareTelegramSimple: React.FC<{ item: Track | Playlist; type: 'track' | 'playlist' }> = ({ item, type }) => {
  const [isSharing, setIsSharing] = useState(false);
  const isTelegram = isTelegramWebApp();

  const handleShare = async () => {
    if (!isTelegram) return;

    setIsSharing(true);
    try {
      if (type === 'track') {
        await shareTrackToTelegram(item as Track);
      } else {
        await sharePlaylistToTelegram(item as Playlist);
      }
    } catch (error) {
      console.error('Failed to share to Telegram:', error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <motion.button
      onClick={handleShare}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      disabled={isSharing}
      className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isSharing ? (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <Send className="w-4 h-4" />
      )}
    </motion.button>
  );
};