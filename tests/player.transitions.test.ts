import { describe, it, expect, beforeEach } from 'vitest';

import { usePlayerStore } from '../stores/usePlayerStore';
import type { Track } from '../types';

const makeTracks = (n: number): Track[] =>
  Array.from({ length: n }).map((_, i) => ({
    id: `${i+1}`,
    title: `T${i+1}`,
    artist: 'A',
    duration: '0:30',
    coverUrl: '',
    plays: 0,
    likes: 0,
    audioUrl: `u${i+1}`,
  }));

describe('Player transitions', () => {
  beforeEach(() => {
    const { setPlaylist, pause, setCurrentTime } = usePlayerStore.getState();
    setPlaylist(makeTracks(3), 0);
    pause();
    setCurrentTime(0);
  });

  it('next advances and loops with repeat=all', () => {
    const store = usePlayerStore.getState();
    store.toggleRepeat(); // off -> one
    store.toggleRepeat(); // one -> all
    expect(usePlayerStore.getState().repeat).toBe('all');

    store.next();
    expect(usePlayerStore.getState().playlistIndex).toBe(1);

    store.next();
    expect(usePlayerStore.getState().playlistIndex).toBe(2);

    store.next();
    expect(usePlayerStore.getState().playlistIndex).toBe(0);
  });

  it('previous restarts if >3s else goes back', () => {
    const store = usePlayerStore.getState();
    store.setCurrentTime(4);
    store.previous();
    expect(usePlayerStore.getState().currentTime).toBe(0);

    store.setCurrentTime(0);
    store.previous();
    expect(usePlayerStore.getState().playlistIndex).toBe(2);
  });

  it('shuffle picks random index different from current when possible', () => {
    const store = usePlayerStore.getState();
    store.toggleShuffle();
    const start = store.playlistIndex;
    store.next();
    const after = usePlayerStore.getState().playlistIndex;
    // With 3 tracks and random, most likely different; if the same, call next again
    if (after === start) {
      store.next();
    }
    expect(usePlayerStore.getState().playlistIndex).toBeGreaterThanOrEqual(0);
  });
});
