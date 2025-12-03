import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, TrendingUp, Clock, Heart, Play, Users, Music } from 'lucide-react';
import { SearchModal } from '../components/SearchModal';
import { FilterPanel } from '../components/FilterPanel';
import { useSocialStore } from '../stores/useSocialStore';
import { SearchFilters, Track, Playlist, User } from '../types';

export const ExploreUpdated: React.FC = () => {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [activeView, setActiveView] = useState<'trending' | 'recent' | 'browse'>('trending');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});

  const {
    searchResults,
    performSearch,
    clearSearchResults,
    addToHistory
  } = useSocialStore();

  // Mock data
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [recentTracks, setRecentTracks] = useState<Track[]>([]);
  const [featuredPlaylists, setFeaturedPlaylists] = useState<Playlist[]>([]);

  useEffect(() => {
    // Mock trending tracks
    const mockTrending: Track[] = [
      {
        id: '1',
        title: 'Neon Dreams',
        artist: 'Synthwave Master',
        duration: '3:45',
        coverUrl: '/api/placeholder/200/200',
        plays: 15420,
        likes: 892,
        isNft: false
      },
      {
        id: '2',
        title: 'Midnight City',
        artist: 'Electronic Vibes',
        duration: '4:12',
        coverUrl: '/api/placeholder/200/200',
        plays: 12350,
        likes: 756,
        isNft: true
      },
      {
        id: '3',
        title: 'Summer Breeze',
        artist: 'Chill Beats',
        duration: '2:58',
        coverUrl: '/api/placeholder/200/200',
        plays: 9830,
        likes: 623,
        isNft: false
      }
    ];

    // Mock recent tracks
    const mockRecent: Track[] = [
      {
        id: '4',
        title: 'Future Bass',
        artist: 'EDM Producer',
        duration: '3:21',
        coverUrl: '/api/placeholder/200/200',
        plays: 5670,
        likes: 342,
        isNft: false
      },
      {
        id: '5',
        title: 'Lo-Fi Study',
        artist: 'Study Beats',
        duration: '5:03',
        coverUrl: '/api/placeholder/200/200',
        plays: 4320,
        likes: 289,
        isNft: false
      }
    ];

    // Mock featured playlists
    const mockPlaylists: Playlist[] = [
      {
        id: 'pl1',
        name: 'Electronic Essentials',
        description: 'The best electronic tracks of the month',
        user_id: 'user1',
        is_public: true,
        tracks_count: 25,
        created_at: '2024-01-10T10:00:00Z',
        updated_at: '2024-01-10T10:00:00Z',
        user: { display_name: 'DJ Master' }
      },
      {
        id: 'pl2',
        name: 'Chill Vibes',
        description: 'Relaxing beats for study and focus',
        user_id: 'user2',
        is_public: true,
        tracks_count: 18,
        created_at: '2024-01-08T15:30:00Z',
        updated_at: '2024-01-08T15:30:00Z',
        user: { display_name: 'Music Curator' }
      }
    ];

    setTrendingTracks(mockTrending);
    setRecentTracks(mockRecent);
    setFeaturedPlaylists(mockPlaylists);
  }, []);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      setShowSearchModal(true);
      performSearch({ query: query.trim() });
    }
  };

  const handleTrackClick = (track: Track) => {
    // Add to listening history
    addToHistory(track.id);
    // Here you would also update the player store
    console.log('Playing track:', track.title);
  };

  const handlePlaylistClick = (playlist: Playlist) => {
    console.log('Opening playlist:', playlist.name);
    // Navigate to playlist detail page
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

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
      {/* Search Header */}
      <motion.div
        variants={itemVariants}
        className="mb-8"
      >
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <h1 className="text-4xl font-bold text-white mb-4">Explore Music</h1>
          <p className="text-gray-400 mb-6">Discover new tracks, playlists, and artists</p>

          {/* Search Bar */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for tracks, artists, playlists..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    handleSearch(e.currentTarget.value);
                  }
                }}
                className="w-full pl-10 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-lg"
              />
              <button
                onClick={() => setShowSearchModal(true)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-4 rounded-xl font-medium transition-all flex items-center gap-2 ${
                Object.keys(filters).length > 0
                  ? 'bg-purple-500/20 border border-purple-500/50 text-purple-400'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
              }`}
            >
              <Filter className="w-5 h-5" />
              Filters
              {Object.keys(filters).length > 0 && (
                <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
                  {Object.keys(filters).length}
                </span>
              )}
            </button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mb-6">
            {['Electronic', 'Hip Hop', 'Rock', 'Jazz', 'Lo-Fi'].map((genre) => (
              <button
                key={genre}
                onClick={() => handleSearch(genre)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg transition-colors text-sm"
              >
                {genre}
              </button>
            ))}
          </div>

          {/* View Tabs */}
          <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
            {[
              { id: 'trending', label: 'Trending', icon: TrendingUp },
              { id: 'recent', label: 'Recent', icon: Clock },
              { id: 'browse', label: 'Browse', icon: Music }
            ].map((view) => {
              const Icon = view.icon;
              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id as any)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
                    activeView === view.id
                      ? 'bg-purple-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {view.label}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Filter Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <FilterPanel
            filters={filters}
            onFiltersChange={setFilters}
            isExpanded={showFilters}
            onToggle={() => setShowFilters(!showFilters)}
          />
        </motion.div>
      )}

      {/* Content Based on Active View */}
      {activeView === 'trending' && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-400" />
            Trending Now
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingTracks.map((track, index) => (
              <motion.div
                key={track.id}
                variants={itemVariants}
                className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all group cursor-pointer"
                onClick={() => handleTrackClick(track)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {track.isNft && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                    )}
                    <Music className="w-8 h-8 text-gray-400" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors mb-1">
                      {track.title}
                    </h3>
                    <p className="text-gray-400 mb-3">{track.artist}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        {formatNumber(track.plays)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {formatNumber(track.likes)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {track.duration}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {activeView === 'recent' && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Clock className="w-6 h-6 text-purple-400" />
            Recently Added
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentTracks.map((track, index) => (
              <motion.div
                key={track.id}
                variants={itemVariants}
                className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all group cursor-pointer"
                onClick={() => handleTrackClick(track)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Music className="w-8 h-8 text-gray-400" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors mb-1">
                      {track.title}
                    </h3>
                    <p className="text-gray-400 mb-3">{track.artist}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Play className="w-3 h-3" />
                        {formatNumber(track.plays)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {formatNumber(track.likes)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {track.duration}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {activeView === 'browse' && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" />
            Featured Playlists
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredPlaylists.map((playlist, index) => (
              <motion.div
                key={playlist.id}
                variants={itemVariants}
                className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all group cursor-pointer"
                onClick={() => handlePlaylistClick(playlist)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors mb-1">
                      {playlist.name}
                    </h3>
                    <p className="text-gray-400 mb-3">{playlist.description}</p>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Music className="w-3 h-3" />
                        {playlist.tracks_count} tracks
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {playlist.user?.display_name}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Search Modal */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => {
          setShowSearchModal(false);
          clearSearchResults();
        }}
      />
    </motion.div>
  );
};