import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Edit3,
  Share2,
  Music,
  Headphones,
  Clock,
  Heart,
  Settings,
  Camera,
  Send,
  ExternalLink,
  Copy
} from 'lucide-react';
import { TelegramUser, getTelegramUser, isTelegramWebApp } from '../utils/telegram';

interface TelegramUserCardProps {
  onEditProfile?: () => void;
  onShareProfile?: () => void;
  showStats?: boolean;
  compact?: boolean;
}

export const TelegramUserCard: React.FC<TelegramUserCardProps> = ({
  onEditProfile,
  onShareProfile,
  showStats = true,
  compact = false
}) => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    const telegramUser = getTelegramUser();
    setUser(telegramUser);
    setLoading(false);
    if (telegramUser) {
      const fullName = `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim();
      setEditedName(fullName);
    }
  }, []);

  if (loading) {
    return (
      <div className={`glass-panel border border-white/10 rounded-2xl p-6 ${compact ? 'p-4' : 'p-6'}`}>
        <div className="animate-pulse space-y-4">
          <div className="w-20 h-20 rounded-full bg-gray-700 mx-auto" />
          <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto" />
          <div className="h-3 bg-gray-700 rounded w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`glass-panel border border-white/10 rounded-2xl p-6 ${compact ? 'p-4' : 'p-6'}`}>
        <div className="text-center py-8">
          <Send className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Connect with Telegram</h3>
          <p className="text-gray-400 text-sm">Connect your Telegram account to unlock full features</p>
          <button
            onClick={() => window.open('/api/auth/telegram', '_blank')}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center gap-2 mx-auto"
          >
            <Send className="w-4 h-4" />
            Connect Telegram
          </button>
        </div>
      </div>
    );
  }

  const fullName = `${user.first_name} ${user.last_name || ''}`.trim();
  const isPremium = user.is_premium;

  const handleSaveProfile = async () => {
    // Here you would save to your backend
    setIsEditing(false);
  };

  const copyProfileLink = () => {
    const profileUrl = `https://t.me/${user.username || 'user'}`;
    navigator.clipboard.writeText(profileUrl);
    // Show toast
  };

  const shareToTelegram = () => {
    const message = `🎵 Check out my profile on Normal Dance!\n\n👤 ${fullName}${user.username ? `\n@${user.username}` : ''}\n\n🎧 Listen to amazing music together!`;

    if (isTelegramWebApp()) {
      window.Telegram?.sendData(JSON.stringify({
        type: 'share_profile',
        user: {
          id: user.id,
          name: fullName,
          username: user.username
        }
      }));
    } else {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 p-4 glass-panel border border-white/10 rounded-xl hover:border-purple-500/30 transition-all"
      >
        <div className="relative">
          {user.photo_url ? (
            <img
              src={user.photo_url}
              alt={fullName}
              className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          )}
          {isPremium && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">✨</span>
            </div>
          )}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-white">{fullName}</h3>
          {user.username && (
            <p className="text-sm text-gray-400">@{user.username}</p>
          )}
        </div>

        <button
          onClick={() => setShowShareMenu(!showShareMenu)}
          className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg"
        >
          <Share2 className="w-4 h-4" />
        </button>

        {/* Share Menu */}
        {showShareMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-4 top-full mt-2 glass-panel border border-white/10 rounded-xl p-2 min-w-48 z-50"
          >
            <button
              onClick={shareToTelegram}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-left"
            >
              <Send className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-300">Share on Telegram</span>
            </button>
            <button
              onClick={copyProfileLink}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors text-left"
            >
              <Copy className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">Copy Link</span>
            </button>
          </motion.div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-panel border border-white/10 rounded-2xl overflow-hidden ${compact ? 'p-4' : 'p-6'}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            {user.photo_url ? (
              <img
                src={user.photo_url}
                alt={fullName}
                className="w-24 h-24 rounded-full object-cover border-4 border-white/20"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
            )}

            {isPremium && (
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✨</span>
              </div>
            )}

            {/* Camera Button for Avatar */}
            {isEditing && (
              <button
                onClick={() => {
                  // Handle avatar upload
                  console.log('Upload avatar');
                }}
                className="absolute bottom-0 right-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center border-2 border-white/20 hover:bg-purple-600 transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}
          </div>

          <div>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedName(fullName);
                    }}
                    className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{fullName}</h2>
                {user.username && (
                  <p className="text-gray-400 flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    @{user.username}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 transition-all rounded-lg"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={shareToTelegram}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 transition-all rounded-lg"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* User Stats */}
      {showStats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-6"
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">0</div>
            <div className="text-sm text-gray-400 flex items-center justify-center gap-1">
              <Music className="w-3 h-3" />
              Tracks
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">0</div>
            <div className="text-sm text-gray-400 flex items-center justify-center gap-1">
              <Heart className="w-3 h-3" />
              Likes
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">0</div>
            <div className="text-sm text-gray-400 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />
              Hours
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => {
            // Navigate to user's tracks
            console.log('Navigate to tracks');
          }}
          className="flex-1 min-w-[120px] px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
        >
          <Music className="w-4 h-4" />
          My Tracks
        </button>
        <button
          onClick={() => {
            // Navigate to user's playlists
            console.log('Navigate to playlists');
          }}
          className="flex-1 min-w-[120px] px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
        >
          <Headphones className="w-4 h-4" />
          Playlists
        </button>
        <button
          onClick={() => {
            // Navigate to settings
            console.log('Navigate to settings');
          }}
          className="flex-1 min-w-[120px] px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
    </motion.div>
  );
};