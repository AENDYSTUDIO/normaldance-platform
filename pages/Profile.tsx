import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Music,
  Users,
  Heart,
  Clock,
  TrendingUp,
  Settings,
  Share2,
  Edit3,
  Upload,
  Headphones,
  BarChart3,
  Play,
  Plus,
  Camera,
  Save,
  X,
  ChevronRight,
  Download,
  Trash2
} from 'lucide-react';
import { TelegramUserCard } from '../components/TelegramUserCard';
import { TelegramShareButtonSimple, QuickShareTelegramSimple } from '../components/TelegramShareButtonSimple';
import { TelegramMainButtonSimple } from '../components/TelegramMainButtonSimple';
import {
  initTelegramWebApp,
  setupMainButton,
  setupBackButton,
  getTelegramTheme,
  haptic
} from '../utils/telegram';
import { useTracksStore } from '../stores/useTracksStore';
import { usePlayerStore } from '../stores/usePlayerStore';
import { useSocialStore } from '../stores/useSocialStore';
import { Track, Playlist } from '../types';

interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  is_premium: boolean;
  preferences: {
    theme: 'dark' | 'light';
    language: string;
    notifications: boolean;
    auto_play: boolean;
  };
}

export const Profile: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'tracks' | 'playlists' | 'activity'>('tracks');
  const [uploadMode, setUploadMode] = useState(false);

  const { tracks, addTrack } = useTracksStore();
  const { currentTrack } = usePlayerStore();
  const {
    playlists,
    likedTracks,
    listeningHistory,
    toggleLike
  } = useSocialStore();

  const telegramTheme = getTelegramTheme();

  useEffect(() => {
    // Mock user data - in real app this would come from your API
    const mockUser: UserProfile = {
      id: '1',
      username: 'normal_dance_user',
      display_name: 'Music Enthusiast',
      avatar_url: undefined, // Would come from Telegram
      bio: '🎵 Electronic music lover | 🎧 Always discovering new sounds | 🚀 Web3 music pioneer',
      created_at: '2024-01-01T00:00:00Z',
      is_premium: true,
      preferences: {
        theme: telegramTheme.colorScheme || 'dark',
        language: 'en',
        notifications: true,
        auto_play: true
      }
    };

    // Simulate API call
    setTimeout(() => {
      setUser(mockUser);
      setLoading(false);
    }, 500);

    // Setup Telegram UI
    const webApp = initTelegramWebApp();
    if (webApp) {
      // Setup Main Button for upload
      setupMainButton('Upload Track', () => {
        setUploadMode(!uploadMode);
        haptic.light();
      });

      // Setup Back Button
      setupBackButton(() => {
        if (uploadMode) {
          setUploadMode(false);
        }
      });
    }
  }, []);

  const handleSaveProfile = (updatedProfile: Partial<UserProfile>) => {
    if (user) {
      const newProfile = { ...user, ...updatedProfile };
      setUser(newProfile);
      setEditingProfile(false);
      haptic.success();
    }
  };

  const handleUploadTrack = async (file: File) => {
    // Here you would upload to IPFS and save to database
    console.log('Uploading track:', file.name);
    haptic.medium();

    // Mock new track
    const newTrack: Track = {
      id: `track_${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: user?.display_name || 'Unknown Artist',
      duration: '3:45',
      coverUrl: '/api/placeholder/200/200',
      plays: 0,
      likes: 0,
      audioUrl: URL.createObjectURL(file)
    };

    addTrack(newTrack);
    setUploadMode(false);
    haptic.success();
  };

  const getUserStats = () => {
    const totalPlays = tracks.reduce((sum: number, track: Track) => sum + track.plays, 0);
    const totalLikes = tracks.reduce((sum: number, track: Track) => sum + track.likes, 0);
    const totalListeningTime = listeningHistory.reduce((sum: number, entry: any) => sum + (entry.duration_played || 0), 0);

    return {
      totalPlays,
      totalLikes,
      totalListeningTime,
      tracksCount: tracks.length,
      playlistsCount: playlists.filter((p: any) => p.user_id === 'current_user').length,
      likesCount: likedTracks.length
    };
  };

  const stats = getUserStats();

  if (loading) {
    return (
      <div className="min-h-screen pb-32 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen pb-32"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="mb-8"
      >
        <div className="glass-panel border border-white/10 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <TelegramUserCard
              onEditProfile={() => setEditingProfile(!editingProfile)}
              onShareProfile={() => setShowShareMenu(!showShareMenu)}
            />

            <div className="flex-1">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-white mb-2">{user?.display_name}</h1>
                <p className="text-gray-400 flex items-center gap-2">
                  @{user?.username}
                  {user?.is_premium && (
                    <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs rounded-full">
                      ✨ Premium
                    </span>
                  )}
                </p>
              </div>

              {user?.bio && (
                <div className="mb-6">
                  <p className="text-gray-300 leading-relaxed">{user.bio}</p>
                </div>
              )}

              {/* Profile Actions */}
              <div className="flex flex-wrap gap-3">
                <TelegramShareButtonSimple
                  item={{
                    id: user?.id || '',
                    name: user?.display_name || '',
                    user_id: user?.id || '',
                    is_public: true,
                    tracks_count: 0,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  }}
                  type="playlist"
                  size="sm"
                  variant="secondary"
                  showLabel={true}
                />

                <button
                  onClick={() => setEditingProfile(!editingProfile)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>

                <button
                  onClick={() => {
                    // Navigate to settings
                    console.log('Navigate to settings');
                  }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Upload Mode */}
      {uploadMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="glass-panel border border-white/10 rounded-2xl p-6 border-2 border-dashed border-purple-500/50">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-purple-400" />
              Upload Track
            </h2>

            <div className="space-y-4">
              <div
                className="w-full p-8 border-2 border-dashed border-white/30 rounded-xl text-center hover:border-purple-500/50 transition-colors cursor-pointer"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add('border-purple-500/50', 'bg-purple-500/10');
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-purple-500/50', 'bg-purple-500/10');
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove('border-purple-500/50', 'bg-purple-500/10');
                  const file = e.dataTransfer.files[0];
                  if (file && file.type.startsWith('audio/')) {
                    handleUploadTrack(file);
                  }
                }}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Drop your audio file here
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Supports MP3, WAV, FLAC formats up to 50MB
                </p>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleUploadTrack(file);
                    }
                  }}
                  className="hidden"
                  id="track-upload"
                />
                <label
                  htmlFor="track-upload"
                  className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all cursor-pointer"
                >
                  Choose File
                </label>
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => setUploadMode(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      {!uploadMode && (
        <motion.div
          variants={itemVariants}
          className="mb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Music className="w-5 h-5 text-purple-400" />
                <span className="text-xs text-gray-400">Total</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.tracksCount}</div>
              <div className="text-sm text-gray-400">Tracks</div>
            </div>

            <div className="glass-panel border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-blue-400" />
                <span className="text-xs text-gray-400">Created</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.playlistsCount}</div>
              <div className="text-sm text-gray-400">Playlists</div>
            </div>

            <div className="glass-panel border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Heart className="w-5 h-5 text-pink-400" />
                <span className="text-xs text-gray-400">Total</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.likesCount}</div>
              <div className="text-sm text-gray-400">Likes</div>
            </div>

            <div className="glass-panel border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Headphones className="w-5 h-5 text-green-400" />
                <span className="text-xs text-gray-400">Minutes</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {Math.floor(stats.totalListeningTime / 60)}
              </div>
              <div className="text-sm text-gray-400">Listening Time</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      {!uploadMode && (
        <motion.div
          variants={itemVariants}
          className="mb-8"
        >
          <div className="glass-panel border border-white/10 rounded-xl p-1">
            <div className="flex gap-2">
              {[
                { id: 'tracks', label: 'My Tracks', icon: Music },
                { id: 'playlists', label: 'My Playlists', icon: Users },
                { id: 'activity', label: 'Activity', icon: BarChart3 }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-purple-500 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Content Based on Active Tab */}
      {!uploadMode && (
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          key={activeTab}
        >
          {activeTab === 'tracks' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">My Tracks</h2>
              {tracks.filter(t => t.artist === user?.display_name).length === 0 ? (
                <div className="text-center py-16 glass-panel border border-white/10 rounded-2xl">
                  <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No tracks yet</h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Upload your first track to start sharing your music with the world!
                  </p>
                  <button
                    onClick={() => setUploadMode(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    Upload Your First Track
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tracks.filter(t => t.artist === user?.display_name).map((track) => (
                    <div
                      key={track.id}
                      className="glass-panel border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all group"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                          <Music className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors mb-1">
                            {track.title}
                          </h3>
                          <p className="text-gray-400 text-sm">{track.artist}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Play className="w-3 h-3" />
                            {track.plays}
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {track.likes}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {track.duration}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleLike(track.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              likedTracks.some((l: any) => l.track_id === track.id)
                                ? 'text-pink-400 bg-pink-400/20'
                                : 'text-gray-400 hover:text-white bg-white/10'
                            }`}
                          >
                            <Heart className="w-4 h-4" fill={likedTracks.some(l => l.track_id === track.id) ? 'currentColor' : 'none'} />
                          </button>

                          <QuickShareTelegramSimple item={track} type="track" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'playlists' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">My Playlists</h2>
              {playlists.filter((p: any) => p.user_id === 'current_user').length === 0 ? (
                <div className="text-center py-16 glass-panel border border-white/10 rounded-2xl">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No playlists yet</h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Create your first playlist to organize your favorite tracks!
                  </p>
                  <button
                    onClick={() => {
                      // Open create playlist modal
                      console.log('Create playlist');
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    Create Your First Playlist
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {playlists.filter((p: any) => p.user_id === 'current_user').map((playlist: any) => (
                    <div
                      key={playlist.id}
                      className="glass-panel border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all group"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                          <Users className="w-8 h-8 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors mb-1">
                            {playlist.name}
                          </h3>
                          <p className="text-gray-400 text-sm">{playlist.tracks_count} tracks</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {playlist.is_public && (
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                              Public
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            Created {new Date(playlist.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <QuickShareTelegramSimple item={playlist} type="playlist" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
              {listeningHistory.length === 0 ? (
                <div className="text-center py-16 glass-panel border border-white/10 rounded-2xl">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No activity yet</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    Start listening to music to see your listening history and stats!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {listeningHistory.slice(0, 10).map((entry: any, index: number) => {
                    const track = tracks.find(t => t.id === entry.track_id);
                    return (
                      <div
                        key={entry.id}
                        className="glass-panel border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:bg-white/5 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                          <Music className="w-6 h-6 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{track?.title || 'Unknown Track'}</h4>
                          <p className="text-sm text-gray-400">
                            {track?.artist} • {new Date(entry.played_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">
                            {entry.completed ? '✅ Completed' : '⏸️ In Progress'}
                          </div>
                          {entry.duration_played && (
                            <div className="text-xs text-gray-400">
                              {Math.floor(entry.duration_played / 60)}:{(entry.duration_played % 60).toString().padStart(2, '0')} listened
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};