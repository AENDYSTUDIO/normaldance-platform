import React from 'react';
import { Music, Users, Play, MoreHorizontal, Heart, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Playlist } from '../types';
import { useSocialStore } from '../stores/useSocialStore';

interface PlaylistGridProps {
  playlists: Playlist[];
  onPlaylistClick: (playlist: Playlist) => void;
  onEditPlaylist?: (playlist: Playlist) => void;
  onDeletePlaylist?: (playlist: Playlist) => void;
  onCreatePlaylist?: () => void;
  showCreateButton?: boolean;
}

export const PlaylistGrid: React.FC<PlaylistGridProps> = ({
  playlists,
  onPlaylistClick,
  onEditPlaylist,
  onDeletePlaylist,
  onCreatePlaylist,
  showCreateButton = false
}) => {
  const { toggleLike, likedTracks } = useSocialStore();

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
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
    >
      {/* Create Playlist Button */}
      {showCreateButton && (
        <motion.button
          variants={itemVariants}
          onClick={onCreatePlaylist}
          className="group relative aspect-square rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-dashed border-white/20 hover:border-purple-500/50 transition-all duration-300 flex flex-col items-center justify-center text-gray-400 hover:text-white"
        >
          <Plus className="w-12 h-12 mb-3 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Create Playlist</span>
        </motion.button>
      )}

      {/* Playlist Items */}
      {playlists.map((playlist, index) => (
        <motion.div
          key={playlist.id}
          variants={itemVariants}
          className="group relative"
        >
          <button
            onClick={() => onPlaylistClick(playlist)}
            className="w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-white/10 hover:border-purple-500/50 transition-all duration-300 relative"
          >
            {/* Playlist Cover */}
            <div className="absolute inset-0 flex items-center justify-center">
              {playlist.cover_url ? (
                <img
                  src={playlist.cover_url}
                  alt={playlist.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center">
                  <Music className="w-16 h-16 text-white/50" />
                </div>
              )}
            </div>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            {/* Play Button */}
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Play playlist logic
                }}
                className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              >
                <Play className="w-5 h-5 ml-1 fill-current" />
              </button>
            </div>

            {/* More Options */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Show dropdown menu
                }}
                className="w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Privacy Indicator */}
            {!playlist.is_public && (
              <div className="absolute top-4 left-4">
                <div className="w-6 h-6 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
          </button>

          {/* Playlist Info */}
          <div className="mt-3 px-1">
            <h3 className="font-medium text-white text-sm truncate group-hover:text-purple-400 transition-colors">
              {playlist.name}
            </h3>
            <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {playlist.tracks_count} tracks
            </p>
            {playlist.user && (
              <p className="text-gray-500 text-xs mt-1">
                by {playlist.user.display_name}
              </p>
            )}
          </div>
        </motion.div>
      ))}

      {/* Empty State */}
      {playlists.length === 0 && !showCreateButton && (
        <motion.div
          variants={itemVariants}
          className="col-span-full flex flex-col items-center justify-center py-16 text-center"
        >
          <Music className="w-16 h-16 text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No playlists yet</h3>
          <p className="text-gray-400 max-w-md">
            Create your first playlist to organize your favorite tracks and share them with others.
          </p>
          {onCreatePlaylist && (
            <button
              onClick={onCreatePlaylist}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Your First Playlist
            </button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};