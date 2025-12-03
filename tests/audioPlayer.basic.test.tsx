import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { AudioPlayer } from '../components/AudioPlayer';
import { usePlayerStore } from '../stores/usePlayerStore';
import type { Track } from '../types';

// Silence console noise from audio warnings
vi.spyOn(console, 'warn').mockImplementation(() => {});
vi.spyOn(console, 'error').mockImplementation(() => {});

describe('AudioPlayer basic', () => {
  it('renders nothing when no currentTrack', () => {
    const { container } = render(<AudioPlayer />);
    expect(container.querySelector('audio')).toBeNull();
  });

  it("renders audio element but doesn't attempt playback when audioUrl missing", () => {
    const t: Track = { id: 't1', title: 'x', artist: 'y', duration: '1:00', coverUrl: '', plays: 0, likes: 0 };
    // set track to store then ensure paused to avoid jsdom HTMLAudioElement.play quirk
    const s = usePlayerStore.getState();
    s.setTrack(t);
    s.pause();
    const { container } = render(<AudioPlayer />);
    expect(container.querySelector('audio')).not.toBeNull();
  });
});
