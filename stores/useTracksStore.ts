import { create } from 'zustand';
import { Track } from '../types';
import { db } from '../services/db';

interface TracksState {
    tracks: Track[];
    isLoading: boolean;
    error: string | null;

    // Actions
    loadTracks: () => void;
    addTrack: (track: Track) => void;
    updateTrack: (id: string, updates: Partial<Track>) => void;
    deleteTrack: (id: string) => void;
    likeTrack: (id: string) => void;
    incrementPlays: (id: string) => void;
}

export const useTracksStore = create<TracksState>((set, get) => ({
    tracks: [],
    isLoading: false,
    error: null,

    loadTracks: () => {
        set({ isLoading: true, error: null });
        try {
            const loadedTracks = db.init();
            set({ tracks: loadedTracks, isLoading: false });
        } catch (error) {
            set({ error: 'Failed to load tracks', isLoading: false });
        }
    },

    addTrack: (track) => {
        const updatedTracks = db.addTrack(track);
        set({ tracks: updatedTracks });
    },

    updateTrack: (id, updates) => {
        set((state) => ({
            tracks: state.tracks.map((track) =>
                track.id === id ? { ...track, ...updates } : track
            )
        }));
        // Sync with localStorage
        const { tracks } = get();
        localStorage.setItem('normaldance_db_tracks', JSON.stringify(tracks));
    },

    deleteTrack: (id) => {
        set((state) => ({
            tracks: state.tracks.filter((track) => track.id !== id)
        }));
        // Sync with localStorage
        const { tracks } = get();
        localStorage.setItem('normaldance_db_tracks', JSON.stringify(tracks));
    },

    likeTrack: (id) => {
        const { updateTrack, tracks } = get();
        const track = tracks.find((t) => t.id === id);
        if (track) {
            updateTrack(id, { likes: track.likes + 1 });
        }
    },

    incrementPlays: (id) => {
        const { updateTrack, tracks } = get();
        const track = tracks.find((t) => t.id === id);
        if (track) {
            updateTrack(id, { plays: track.plays + 1 });
        }
    }
}));
