
import { Track } from '../types';
import { isBrowser } from '../utils/helpers';

import { MOCK_TRACKS } from './mockData';

const DB_KEY = 'normaldance_db_tracks';

const safeGetItem = (key: string): string | null => {
  if (!isBrowser()) return null;
  try { return localStorage.getItem(key); } catch { return null; }
};
const safeSetItem = (key: string, value: string): void => {
  if (!isBrowser()) return; 
  try { localStorage.setItem(key, value); } catch {}
};
const safeRemoveItem = (key: string): void => {
  if (!isBrowser()) return; 
  try { localStorage.removeItem(key); } catch {}
};

export const db = {
  // Initialize DB with mock data if empty
  init: (): Track[] => {
    const stored = safeGetItem(DB_KEY);
    if (!stored) {
      const initialData = MOCK_TRACKS.map(t => ({
        ...t,
        dateAdded: new Date().toISOString(),
        description: 'Original Master Recording'
      }));
      safeSetItem(DB_KEY, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(stored);
  },

  // Get all tracks
  getTracks: (): Track[] => {
    const stored = safeGetItem(DB_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  // Add a new track
  addTrack: (track: Track): Track[] => {
    const currentTracks = db.getTracks();
    const newTracks = [track, ...currentTracks];
    safeSetItem(DB_KEY, JSON.stringify(newTracks));
    return newTracks;
  },

  // Reset DB (for debugging)
  reset: () => {
    safeRemoveItem(DB_KEY);
  }
};
