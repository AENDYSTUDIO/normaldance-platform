
import { Track } from '../types';
import { MOCK_TRACKS } from './mockData';

const DB_KEY = 'normaldance_db_tracks';

export const db = {
  // Initialize DB with mock data if empty
  init: (): Track[] => {
    const stored = localStorage.getItem(DB_KEY);
    if (!stored) {
      const initialData = MOCK_TRACKS.map(t => ({
        ...t,
        dateAdded: new Date().toISOString(),
        description: 'Original Master Recording'
      }));
      localStorage.setItem(DB_KEY, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(stored);
  },

  // Get all tracks
  getTracks: (): Track[] => {
    const stored = localStorage.getItem(DB_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  // Add a new track
  addTrack: (track: Track): Track[] => {
    const currentTracks = db.getTracks();
    const newTracks = [track, ...currentTracks];
    localStorage.setItem(DB_KEY, JSON.stringify(newTracks));
    return newTracks;
  },

  // Reset DB (for debugging)
  reset: () => {
    localStorage.removeItem(DB_KEY);
  }
};
