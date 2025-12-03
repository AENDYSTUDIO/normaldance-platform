import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Music, Users, List, Clock, TrendingUp, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocialStore } from '../stores/useSocialStore';
import { SearchResult, SearchFilters, Track, Playlist, User } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, initialQuery = '' }) => {
  const {
    searchResults,
    searchLoading,
    performSearch,
    clearSearchResults,
    setSearchLoading
  } = useSocialStore();

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'all' | 'tracks' | 'playlists' | 'users'>('all');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock genres for filter
  const genres = ['Electronic', 'Hip Hop', 'Rock', 'Pop', 'Jazz', 'Classical', 'R&B', 'Country', 'Metal', 'Reggae'];

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        performSearch({ query: query.trim(), ...filters });
      } else {
        clearSearchResults();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, filters]);

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
  };

  const getFilteredResults = () => {
    if (!searchResults) return [];

    switch (activeTab) {
      case 'tracks':
        return searchResults.tracks;
      case 'playlists':
        return searchResults.playlists;
      case 'users':
        return searchResults.users;
      default:
        return [...searchResults.tracks, ...searchResults.playlists, ...searchResults.users];
    }
  };

  const formatDuration = (duration: string) => {
    // Convert MM:SS format to more readable format
    if (duration.includes(':')) {
      const [minutes, seconds] = duration.split(':');
      return `${minutes}:${seconds.padStart(2, '0')}`;
    }
    return duration;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="max-w-4xl mx-auto mt-20 glass-panel m-4 rounded-2xl border border-white/10 max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search for tracks, playlists, artists..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') onClose();
                    }}
                    className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-3 rounded-xl transition-all ${
                    Object.keys(filters).length > 0
                      ? 'bg-purple-500/20 border border-purple-500/50 text-purple-400'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <Filter className="w-5 h-5" />
                </button>

                <button
                  onClick={onClose}
                  className="p-3 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2">
                {(['all', 'tracks', 'playlists', 'users'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                      activeTab === tab
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-b border-white/10 px-6 py-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Genres */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Genres</label>
                      <div className="flex flex-wrap gap-2">
                        {genres.map((genre) => (
                          <button
                            key={genre}
                            onClick={() => {
                              const currentGenres = filters.genres || [];
                              const newGenres = currentGenres.includes(genre)
                                ? currentGenres.filter(g => g !== genre)
                                : [...currentGenres, genre];
                              setFilters(prev => ({ ...prev, genres: newGenres }));
                            }}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                              filters.genres?.includes(genre)
                                ? 'bg-purple-500 text-white'
                                : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                            }`}
                          >
                            {genre}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sort By */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                      <select
                        value={filters.sort_by || 'relevance'}
                        onChange={(e) => setFilters(prev => ({
                          ...prev,
                          sort_by: e.target.value as SearchFilters['sort_by']
                        }))}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                      >
                        <option value="relevance">Relevance</option>
                        <option value="plays">Most Played</option>
                        <option value="likes">Most Liked</option>
                        <option value="created_at">Recently Added</option>
                      </select>
                    </div>

                    {/* Sort Order */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Order</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setFilters(prev => ({ ...prev, sort_order: 'desc' }))}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            filters.sort_order === 'desc'
                              ? 'bg-purple-500 text-white'
                              : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                          }`}
                        >
                          Descending
                        </button>
                        <button
                          onClick={() => setFilters(prev => ({ ...prev, sort_order: 'asc' }))}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            filters.sort_order === 'asc'
                              ? 'bg-purple-500 text-white'
                              : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
                          }`}
                        >
                          Ascending
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
              {searchLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full" />
                </div>
              ) : query && searchResults ? (
                <div className="p-6">
                  {searchResults.total > 0 && (
                    <div className="text-sm text-gray-400 mb-4">
                      Found {formatNumber(searchResults.total)} results for "{query}"
                    </div>
                  )}

                  <div className="space-y-4">
                    {getFilteredResults().map((result, index) => {
                      // Track result
                      if ('title' in result && 'artist' in result) {
                        const track = result as Track;
                        return (
                          <motion.div
                            key={`track-${track.id}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                          >
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                              <Music className="w-6 h-6 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-white group-hover:text-purple-400 transition-colors">
                                {track.title}
                              </h3>
                              <p className="text-sm text-gray-400">{track.artist}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-400">{formatDuration(track.duration)}</div>
                              <div className="text-xs text-gray-500">
                                {formatNumber(track.plays)} plays • {formatNumber(track.likes)} likes
                              </div>
                            </div>
                          </motion.div>
                        );
                      }

                      // Playlist result
                      if ('name' in result && 'user_id' in result) {
                        const playlist = result as Playlist;
                        return (
                          <motion.div
                            key={`playlist-${playlist.id}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                          >
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                              <List className="w-6 h-6 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-white group-hover:text-purple-400 transition-colors">
                                {playlist.name}
                              </h3>
                              <p className="text-sm text-gray-400">
                                {playlist.tracks_count} tracks
                                {playlist.user?.display_name && ` • ${playlist.user.display_name}`}
                              </p>
                            </div>
                            {playlist.is_public && (
                              <div className="text-xs px-2 py-1 bg-purple-500/20 text-purple-400 rounded-lg">
                                Public
                              </div>
                            )}
                          </motion.div>
                        );
                      }

                      // User result
                      if ('email' in result) {
                        const user = result as User;
                        return (
                          <motion.div
                            key={`user-${user.id}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group"
                          >
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                              <Users className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-white group-hover:text-purple-400 transition-colors">
                                {user.user_metadata?.display_name || user.email}
                              </h3>
                              <p className="text-sm text-gray-400">{user.email}</p>
                            </div>
                          </motion.div>
                        );
                      }

                      return null;
                    })}
                  </div>

                  {searchResults.has_more && (
                    <button className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors font-medium">
                      Load More Results
                    </button>
                  )}
                </div>
              ) : query ? (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Search className="w-16 h-16 text-gray-600 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No results found</h3>
                  <p className="text-gray-400 max-w-md">
                    Try adjusting your search terms or filters to find what you're looking for.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <Search className="w-16 h-16 text-gray-600 mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Start searching</h3>
                  <p className="text-gray-400 max-w-md">
                    Type in the search bar above to find tracks, playlists, and artists.
                  </p>

                  {/* Quick Suggestions */}
                  <div className="mt-8">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">Popular searches</h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {['Electronic', 'Chill', 'Workout', 'Focus', 'Party'].map((term) => (
                        <button
                          key={term}
                          onClick={() => setQuery(term)}
                          className="px-3 py-1 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg text-sm transition-all"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};