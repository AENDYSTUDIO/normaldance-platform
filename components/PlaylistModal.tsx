import React, { useState } from 'react';
import { X, Plus, Music, Users, Lock, Globe, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocialStore } from '../stores/useSocialStore';
import { Playlist } from '../types';

interface PlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlist?: Playlist; // For editing existing playlist
}

export const PlaylistModal: React.FC<PlaylistModalProps> = ({ isOpen, onClose, playlist }) => {
  const [formData, setFormData] = useState({
    name: playlist?.name || '',
    description: playlist?.description || '',
    cover_url: playlist?.cover_url || '',
    is_public: playlist?.is_public || false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addPlaylist, updatePlaylist } = useSocialStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);

    try {
      if (playlist) {
        // Update existing playlist
        await updatePlaylist(playlist.id, {
          ...formData,
          updated_at: new Date().toISOString()
        });
      } else {
        // Create new playlist
        const newPlaylist = {
          id: `playlist_${Date.now()}`,
          user_id: 'current_user', // This should come from auth store
          ...formData,
          tracks_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        await addPlaylist(newPlaylist);
      }

      onClose();
      setFormData({
        name: '',
        description: '',
        cover_url: '',
        is_public: false
      });
    } catch (error) {
      console.error('Error saving playlist:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Here you would upload to IPFS or your storage service
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          cover_url: event.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="glass-panel w-full max-w-md p-6 rounded-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {playlist ? 'Edit Playlist' : 'Create Playlist'}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Cover Image */}
              <div className="flex justify-center mb-4">
                <div className="relative group">
                  {formData.cover_url ? (
                    <img
                      src={formData.cover_url}
                      alt="Playlist cover"
                      className="w-32 h-32 rounded-xl object-cover border-2 border-white/20"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-2 border-dashed border-white/20 flex items-center justify-center">
                      <Music className="w-12 h-12 text-gray-400" />
                    </div>
                  )}

                  <label className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer bg-black/50 rounded-xl">
                    <Image className="w-6 h-6 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Playlist Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="My Awesome Playlist"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your playlist..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors resize-none"
                />
              </div>

              {/* Privacy */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Privacy
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, is_public: true }))}
                    className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                      formData.is_public
                        ? 'border-purple-500 bg-purple-500/20 text-white'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <Globe className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">Public</span>
                    <span className="text-xs opacity-75">Anyone can see</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, is_public: false }))}
                    className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                      !formData.is_public
                        ? 'border-purple-500 bg-purple-500/20 text-white'
                        : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                    }`}
                  >
                    <Lock className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">Private</span>
                    <span className="text-xs opacity-75">Only you can see</span>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formData.name.trim() || isSubmitting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    'Saving...'
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      {playlist ? 'Update' : 'Create'} Playlist
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};