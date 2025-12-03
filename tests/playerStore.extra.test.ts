import { describe, it, expect, beforeEach, vi } from 'vitest';

import { usePlayerStore } from '../stores/usePlayerStore';
import type { Track } from '../types';

const tracks: Track[] = [
  { id: '1', title: 'T1', artist: 'A', duration: '3:00', coverUrl: '', plays: 0, likes: 0, audioUrl: 'u1' },
  { id: '2', title: 'T2', artist: 'B', duration: '3:00', coverUrl: '', plays: 0, likes: 0, audioUrl: 'u2' },
  { id: '3', title: 'T3', artist: 'C', duration: '3:00', coverUrl: '', plays: 0, likes: 0, audioUrl: 'u3' },
];

describe('usePlayerStore extra', () => {
  beforeEach(() => {
    const s = usePlayerStore.getState();
    s.setPlaylist([], 0);
    s.setCurrentTime(0);
    s.pause();
  });

  it('toggleRepeat cycles through modes', () => {
    const s = usePlayerStore.getState();
    expect(s.repeat).toBe('off');
    s.toggleRepeat();
    expect(usePlayerStore.getState().repeat).toBe('one');
    s.toggleRepeat();
    expect(usePlayerStore.getState().repeat).toBe('all');
    s.toggleRepeat();
    expect(usePlayerStore.getState().repeat).toBe('off');
  });

  it('toggleShuffle flips state', () => {
    const s = usePlayerStore.getState();
    expect(s.shuffle).toBe(false);
    s.toggleShuffle();
    expect(usePlayerStore.getState().shuffle).toBe(true);
    s.toggleShuffle();
    expect(usePlayerStore.getState().shuffle).toBe(false);
  });

  it('previous restarts when currentTime > 3s', () => {
    const s = usePlayerStore.getState();
    s.setPlaylist(tracks, 1);
    s.setCurrentTime(4);
    s.previous();
    expect(usePlayerStore.getState().playlistIndex).toBe(1);
    expect(usePlayerStore.getState().currentTime).toBe(0);
  });

  it('next respects repeat all at end', () => {
    const s = usePlayerStore.getState();
    s.setPlaylist(tracks, 2);
    s.toggleRepeat(); // off -> one
    s.toggleRepeat(); // one -> all
    s.next();
    expect(usePlayerStore.getState().playlistIndex).toBe(0);
  });

  it('next uses shuffle random index', () => {
    const s = usePlayerStore.getState();
    s.setPlaylist(tracks, 0);
    // Force Math.random to pick index 2
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.95); // floor(0.95*3) = 2
    s.toggleShuffle();
    s.next();
    expect(usePlayerStore.getState().playlistIndex).toBe(2);
    spy.mockRestore();
  });
});
