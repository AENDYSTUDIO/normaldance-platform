import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, Music, Users, TrendingUp, Clock } from 'lucide-react';
import { PlaylistGrid } from '../components/PlaylistGrid';
import { PlaylistModal } from '../components/PlaylistModal';
import { useSocialStore } from '../stores/useSocialStore';
import { Playlist } from '../types';

export const Playlists: React.FC = () => {
  const {
    playlists,
    currentPlaylist,
    setPlaylists,
    setCurrentPlaylist,
    setShowCreatePlaylist,
    addPlaylist,
    updatePlaylist,
    removePlaylist
  } = useSocialStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'mine' | 'public' | 'recent'>('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);

  // Mock data - in real app, this would come from your API
  useEffect(() => {
    const mockPlaylists: Playlist[] = [
      {
        id: '1',
        name: 'Chill Vibes',
        description: 'Relaxing beats for study and focus',
        user_id: 'user1',
        is_public: true,
        tracks_count: 24,
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        user: {
          display_name: 'MusicLover'
        }
      },
      {
        id: '2',
        name: 'Workout Energy',
        description: 'High energy tracks to power your workout',
        user_id: 'current_user',
        is_public: false,
        tracks_count: 18,
        created_at: '2024-01-10T15:30:00Z',
        updated_at: '2024-01-10T15:30:00Z'
      },
      {
        id: '3',
        name: 'Electronic Dreams',
        description: 'Best of electronic and synthwave',
        user_id: 'user2',
        is_public: true,
        tracks_count: 45,
        created_at: '2024-01-05T20:15:00Z',
        updated_at: '2024-01-05T20:15:00Z',
        user: {
          display_name: 'SynthMaster'
        }
      }
    ];

    setPlaylists(mockPlaylists);
  }, [setPlaylists]);

  const filteredPlaylists = playlists.filter(playlist => {
    const matchesSearch = playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (playlist.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false);

    const matchesFilter = selectedFilter === 'all' ||
                         (selectedFilter === 'mine' && playlist.user_id === 'current_user') ||
                         (selectedFilter === 'public' && playlist.is_public) ||
                         (selectedFilter === 'recent' && new Date(playlist.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

    return matchesSearch && matchesFilter;
  });

  const handlePlaylistClick = (playlist: Playlist) => {
    setCurrentPlaylist(playlist);
    // Navigate to playlist detail page
    console.log('Navigate to playlist:', playlist.id);
  };

  const handleEditPlaylist = (playlist: Playlist) => {
    setEditingPlaylist(playlist);
    setShowEditModal(true);
  };

  const handleCreatePlaylist = () => {
    setEditingPlaylist(null);
    setShowCreatePlaylist(true);
  };

  const handleDeletePlaylist = async (playlist: Playlist) => {
    if (window.confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
      try {
        await removePlaylist(playlist.id);
      } catch (error) {
        console.error('Error deleting playlist:', error);
      }
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Playlists', icon: Music },
    { value: 'mine', label: 'My Playlists', icon: Users },
    { value: 'public', label: 'Public', icon: TrendingUp },
    { value: 'recent', label: 'Recent', icon: Clock }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen pb-32"
    >
      {/* Header */}
      <div className="mb-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white mb-2"
        >
          Playlists
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400"
        >
          Create and manage your music collections
        </motion.p>
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel p-4 rounded-xl mb-8"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search playlists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
            {filterOptions.map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.value}
                  onClick={() => setSelectedFilter(filter.value as any)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-all whitespace-nowrap ${
                    selectedFilter === filter.value
                      ? 'bg-purple-500/20 border-purple-500 text-white'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{filter.label}</span>
                </button>
              );
            })}
          </div>

          {/* Create Playlist Button */}
          <button
            onClick={handleCreatePlaylist}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all font-medium"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <div className="glass-panel p-4 rounded-xl">
          <div className="text-2xl font-bold text-white">{playlists.length}</div>
          <div className="text-sm text-gray-400">Total Playlists</div>
        </div>
        <div className="glass-panel p-4 rounded-xl">
          <div className="text-2xl font-bold text-white">
            {playlists.filter(p => p.user_id === 'current_user').length}
          </div>
          <div className="text-sm text-gray-400">Created by You</div>
        </div>
        <div className="glass-panel p-4 rounded-xl">
          <div className="text-2xl font-bold text-white">
            {playlists.filter(p => p.is_public).length}
          </div>
          <div className="text-sm text-gray-400">Public</div>
        </div>
        <div className="glass-panel p-4 rounded-xl">
          <div className="text-2xl font-bold text-white">
            {playlists.reduce((sum, p) => sum + p.tracks_count, 0)}
          </div>
          <div className="text-sm text-gray-400">Total Tracks</div>
        </div>
      </motion.div>

      {/* Playlists Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <PlaylistGrid
          playlists={filteredPlaylists}
          onPlaylistClick={handlePlaylistClick}
          onEditPlaylist={handleEditPlaylist}
          onDeletePlaylist={handleDeletePlaylist}
          showCreateButton={filteredPlaylists.length === 0}
          onCreatePlaylist={handleCreatePlaylist}
        />
      </motion.div>

      {/* Create Playlist Modal */}
      <PlaylistModal
        isOpen={showEditModal && editingPlaylist === null}
        onClose={() => setShowCreatePlaylist(false)}
      />

      {/* Edit Playlist Modal */}
      <PlaylistModal
        isOpen={showEditModal && editingPlaylist !== null}
        onClose={() => {
          setShowEditModal(false);
          setEditingPlaylist(null);
        }}
        playlist={editingPlaylist || undefined}
      />
    </motion.div>
  );
};