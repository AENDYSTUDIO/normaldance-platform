import { describe, it, expect, beforeEach } from 'vitest';

import { usePlayerStore } from '../stores/usePlayerStore';
import { Track } from '../types';

const sampleTracks: Track[] = [
  { id: '1', title: 'A', artist: 'AA', duration: '3:00', coverUrl: '', plays: 0, likes: 0, audioUrl: '' },
  { id: '2', title: 'B', artist: 'BB', duration: '2:00', coverUrl: '', plays: 0, likes: 0, audioUrl: '' },
];

describe('usePlayerStore', () => {
  beforeEach(() => {
    // reset store by reinitializing state
    const { setPlaylist, setCurrentTime, pause } = usePlayerStore.getState();
    setPlaylist([], 0);
    setCurrentTime(0);
    pause();
  });

  it('sets playlist and current track', () => {
    const { setPlaylist } = usePlayerStore.getState();
    setPlaylist(sampleTracks, 1);
    const { playlist, playlistIndex, currentTrack } = usePlayerStore.getState();
    expect(playlist.length).toBe(2);
    expect(playlistIndex).toBe(1);
    expect(currentTrack?.id).toBe('2');
  });

  it('navigates next/previous', () => {
    const store = usePlayerStore.getState();
    store.setPlaylist(sampleTracks, 0);
    store.next();
    expect(usePlayerStore.getState().currentTrack?.id).toBe('2');
    store.previous();
    expect(usePlayerStore.getState().currentTrack?.id).toBe('1');
  });
});
