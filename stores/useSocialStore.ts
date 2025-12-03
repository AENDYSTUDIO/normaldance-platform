import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Playlist,
  PlaylistTrack,
  UserLike,
  UserFollow,
  TrackComment,
  ListeningHistory,
  SearchFilters,
  SearchResult,
  Recommendation,
  UserStats
} from '../types';

interface SocialState {
  // Playlists
  playlists: Playlist[];
  currentPlaylist: Playlist | null;
  playlistTracks: PlaylistTrack[];

  // User interactions
  likedTracks: UserLike[];
  comments: TrackComment[];
  following: UserFollow[];
  followers: UserFollow[];

  // Listening history
  listeningHistory: ListeningHistory[];

  // Search
  searchResults: SearchResult | null;
  searchLoading: boolean;

  // Recommendations
  recommendations: Recommendation[];
  recommendationsLoading: boolean;

  // User stats
  userStats: UserStats | null;

  // UI State
  showCreatePlaylist: boolean;
  showSearch: boolean;

  // Actions
  setPlaylists: (playlists: Playlist[]) => void;
  setCurrentPlaylist: (playlist: Playlist | null) => void;
  setPlaylistTracks: (tracks: PlaylistTrack[]) => void;
  addPlaylist: (playlist: Playlist) => void;
  updatePlaylist: (id: string, updates: Partial<Playlist>) => void;
  removePlaylist: (id: string) => void;

  // Track interactions
  toggleLike: (trackId: string) => void;
  addComment: (trackId: string, content: string) => void;
  updateComment: (commentId: string, content: string) => void;
  removeComment: (commentId: string) => void;

  // User following
  toggleFollow: (userId: string) => void;

  // Listening history
  addToHistory: (trackId: string, duration?: number, completed?: boolean) => void;

  // Search
  setSearchLoading: (loading: boolean) => void;
  performSearch: (filters: SearchFilters) => Promise<void>;
  clearSearchResults: () => void;

  // Recommendations
  loadRecommendations: (options?: any) => Promise<void>;

  // UI
  setShowCreatePlaylist: (show: boolean) => void;
  setShowSearch: (show: boolean) => void;
}

export const useSocialStore = create<SocialState>()(
  persist(
    (set, get) => ({
      // Initial state
      playlists: [],
      currentPlaylist: null,
      playlistTracks: [],
      likedTracks: [],
      comments: [],
      following: [],
      followers: [],
      listeningHistory: [],
      searchResults: null,
      searchLoading: false,
      recommendations: [],
      recommendationsLoading: false,
      userStats: null,
      showCreatePlaylist: false,
      showSearch: false,

      // Playlist actions
      setPlaylists: (playlists) => set({ playlists }),
      setCurrentPlaylist: (playlist) => set({ currentPlaylist: playlist }),
      setPlaylistTracks: (tracks) => set({ playlistTracks: tracks }),

      addPlaylist: (playlist) => set((state) => ({
        playlists: [...state.playlists, playlist]
      })),

      updatePlaylist: (id, updates) => set((state) => ({
        playlists: state.playlists.map(p =>
          p.id === id ? { ...p, ...updates } : p
        ),
        currentPlaylist: state.currentPlaylist?.id === id
          ? { ...state.currentPlaylist, ...updates }
          : state.currentPlaylist
      })),

      removePlaylist: (id) => set((state) => ({
        playlists: state.playlists.filter(p => p.id !== id),
        currentPlaylist: state.currentPlaylist?.id === id ? null : state.currentPlaylist
      })),

      // Track interactions
      toggleLike: (trackId) => {
        const { likedTracks } = get();
        const existingLike = likedTracks.find(l => l.track_id === trackId);

        if (existingLike) {
          set((state) => ({
            likedTracks: state.likedTracks.filter(l => l.track_id !== trackId)
          }));
        } else {
          const newLike: UserLike = {
            id: `like_${Date.now()}`,
            track_id: trackId,
            user_id: 'current_user', // This should come from auth store
            created_at: new Date().toISOString()
          };
          set((state) => ({
            likedTracks: [...state.likedTracks, newLike]
          }));
        }
      },

      addComment: (trackId, content) => {
        const newComment: TrackComment = {
          id: `comment_${Date.now()}`,
          track_id: trackId,
          user_id: 'current_user',
          content,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        set((state) => ({
          comments: [...state.comments, newComment]
        }));
      },

      updateComment: (commentId, content) => set((state) => ({
        comments: state.comments.map(c =>
          c.id === commentId
            ? { ...c, content, updated_at: new Date().toISOString() }
            : c
        )
      })),

      removeComment: (commentId) => set((state) => ({
        comments: state.comments.filter(c => c.id !== commentId)
      })),

      // User following
      toggleFollow: (userId) => {
        const { following } = get();
        const existingFollow = following.find(f => f.following_id === userId);

        if (existingFollow) {
          set((state) => ({
            following: state.following.filter(f => f.following_id !== userId)
          }));
        } else {
          const newFollow: UserFollow = {
            id: `follow_${Date.now()}`,
            follower_id: 'current_user',
            following_id: userId,
            created_at: new Date().toISOString()
          };
          set((state) => ({
            following: [...state.following, newFollow]
          }));
        }
      },

      // Listening history
      addToHistory: (trackId, duration, completed = false) => {
        const newHistory: ListeningHistory = {
          id: `history_${Date.now()}_${Math.random()}`,
          track_id: trackId,
          user_id: 'current_user',
          duration_played: duration,
          completed,
          played_at: new Date().toISOString()
        };
        set((state) => ({
          listeningHistory: [newHistory, ...state.listeningHistory].slice(0, 1000) // Keep last 1000
        }));
      },

      // Search
      setSearchLoading: (loading) => set({ searchLoading: loading }),

      performSearch: async (filters) => {
        const { setSearchLoading } = get();
        setSearchLoading(true);

        try {
          // This would connect to your search API
          // For now, mock the search
          await new Promise(resolve => setTimeout(resolve, 500));

          const mockResults: SearchResult = {
            tracks: [],
            playlists: [],
            users: [],
            total: 0,
            has_more: false
          };

          set({ searchResults: mockResults });
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setSearchLoading(false);
        }
      },

      clearSearchResults: () => set({ searchResults: null }),

      // Recommendations
      loadRecommendations: async (options) => {
        set({ recommendationsLoading: true });

        try {
          // This would connect to your recommendation API
          // For now, mock the recommendations
          await new Promise(resolve => setTimeout(resolve, 1000));

          const mockRecommendations: Recommendation[] = [];
          set({ recommendations: mockRecommendations });
        } catch (error) {
          console.error('Recommendations error:', error);
        } finally {
          set({ recommendationsLoading: false });
        }
      },

      // UI
      setShowCreatePlaylist: (show) => set({ showCreatePlaylist: show }),
      setShowSearch: (show) => set({ showSearch: show }),
    }),
    {
      name: 'social-storage',
      partialize: (state) => ({
        // Only persist user-specific data, not loading states
        likedTracks: state.likedTracks,
        following: state.following,
        listeningHistory: state.listeningHistory.slice(0, 100),
      }),
    }
  )
);