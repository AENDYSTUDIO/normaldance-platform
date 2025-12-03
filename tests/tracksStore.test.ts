import { describe, it, expect, beforeEach } from 'vitest';

import { useTracksStore } from '../stores/useTracksStore';
import { db } from '../services/db';
import { Track } from '../types';

const makeTrack = (id: string): Track => ({
  id,
  title: `T${id}`,
  artist: 'X',
  duration: '3:00',
  coverUrl: '',
  plays: 0,
  likes: 0,
});

describe('useTracksStore', () => {
  beforeEach(() => {
    // reset localStorage-backed db
    db.reset();
  });

  it('loads tracks from db', () => {
    const store = useTracksStore.getState();
    store.loadTracks();
    expect(useTracksStore.getState().tracks.length).toBeGreaterThan(0);
  });

  it('add/like/incrementPlays', () => {
    const store = useTracksStore.getState();
    store.loadTracks();
    const t = makeTrack('new_1');
    store.addTrack(t);
    expect(useTracksStore.getState().tracks.find((x) => x.id === 'new_1')).toBeTruthy();

    store.likeTrack('new_1');
    expect(useTracksStore.getState().tracks.find((x) => x.id === 'new_1')?.likes).toBe(1);

    store.incrementPlays('new_1');
    expect(useTracksStore.getState().tracks.find((x) => x.id === 'new_1')?.plays).toBe(1);
  });
});
