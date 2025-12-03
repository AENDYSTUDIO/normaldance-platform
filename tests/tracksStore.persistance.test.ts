import { describe, it, expect, beforeEach } from 'vitest';

import { useTracksStore } from '../stores/useTracksStore';
import { db } from '../services/db';
import type { Track } from '../types';

const mk = (id: string): Track => ({ id, title: 't', artist: 'a', duration: '1:00', coverUrl: '', plays: 0, likes: 0, audioUrl: 'u' });

describe('useTracksStore persistence', () => {
  beforeEach(() => {
    db.reset();
  });

  it('updateTrack persists to localStorage', () => {
    const s = useTracksStore.getState();
    s.loadTracks();
    const t = mk('x1');
    s.addTrack(t);
    s.updateTrack('x1', { title: 'updated' });
    const stored = JSON.parse(localStorage.getItem('normaldance_db_tracks') || '[]') as Track[];
    const found = stored.find(x => x.id === 'x1');
    expect(found?.title).toBe('updated');
  });

  it('deleteTrack persists removal to localStorage', () => {
    const s = useTracksStore.getState();
    s.loadTracks();
    const t = mk('x2');
    s.addTrack(t);
    s.deleteTrack('x2');
    const stored = JSON.parse(localStorage.getItem('normaldance_db_tracks') || '[]') as Track[];
    expect(stored.find(x => x.id === 'x2')).toBeUndefined();
  });
});
