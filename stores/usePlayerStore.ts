import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { Track } from '../types';

interface PlayerState {
    currentTrack: Track | null;
    isPlaying: boolean;
    volume: number;
    currentTime: number;
    duration: number;
    playlist: Track[];
    playlistIndex: number;
    repeat: 'off' | 'one' | 'all';
    shuffle: boolean;

    // Actions
    setTrack: (track: Track) => void;
    play: () => void;
    pause: () => void;
    togglePlay: () => void;
    setVolume: (volume: number) => void;
    setCurrentTime: (time: number) => void;
    setDuration: (duration: number) => void;
    next: () => void;
    previous: () => void;
    setPlaylist: (tracks: Track[], startIndex?: number) => void;
    toggleRepeat: () => void;
    toggleShuffle: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      isPlaying: false,
      volume: 0.7,
      currentTime: 0,
      duration: 0,
      playlist: [],
      playlistIndex: -1,
      repeat: 'off',
      shuffle: false,

      setTrack: (track) => set({ currentTrack: track, isPlaying: true }),

      play: () => set({ isPlaying: true }),

      pause: () => set({ isPlaying: false }),

      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

      setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),

      setCurrentTime: (time) => set({ currentTime: time }),

      setDuration: (duration) => set({ duration }),

      next: () => {
          const { playlist, playlistIndex, repeat, shuffle } = get();
          if (playlist.length === 0) return;

          let nextIndex = playlistIndex + 1;

          if (shuffle) {
              nextIndex = Math.floor(Math.random() * playlist.length);
          } else if (nextIndex >= playlist.length) {
              nextIndex = repeat === 'all' ? 0 : playlistIndex;
          }

          if (nextIndex !== playlistIndex) {
              set({
                  currentTrack: playlist[nextIndex],
                  playlistIndex: nextIndex,
                  isPlaying: true,
                  currentTime: 0
              });
          }
      },

      previous: () => {
          const { playlist, playlistIndex, currentTime } = get();
          if (playlist.length === 0) return;

          // If more than 3 seconds played, restart current track
          if (currentTime > 3) {
              set({ currentTime: 0 });
              return;
          }

          const prevIndex = playlistIndex > 0 ? playlistIndex - 1 : playlist.length - 1;
          set({
              currentTrack: playlist[prevIndex],
              playlistIndex: prevIndex,
              isPlaying: true,
              currentTime: 0
          });
      },

      setPlaylist: (tracks, startIndex = 0) => {
          set({
              playlist: tracks,
              playlistIndex: startIndex,
              currentTrack: tracks[startIndex] || null
          });
      },

      toggleRepeat: () => {
          const { repeat } = get();
          const modes: Array<'off' | 'one' | 'all'> = ['off', 'one', 'all'];
          const currentIndex = modes.indexOf(repeat);
          const nextMode = modes[(currentIndex + 1) % modes.length];
          set({ repeat: nextMode });
      },

      toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle }))
    }),
    {
      name: 'player-storage',
      // Persist only what makes sense across reloads
      partialize: (state) => ({
        currentTrack: state.currentTrack,
        playlist: state.playlist,
        playlistIndex: state.playlistIndex,
        volume: state.volume,
        repeat: state.repeat,
        shuffle: state.shuffle,
        currentTime: state.currentTime,
      }),
    }
  )
);
