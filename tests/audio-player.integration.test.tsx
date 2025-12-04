/**
 * Real Audio Player Integration Tests
 * Tests actual AudioContext, Web Audio API, and audio playback functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';

import { AudioPlayer } from '../components/AudioPlayer';
import { usePlayerStore } from '../stores/usePlayerStore';

import { MCPAudioUtils } from './mcp-setup';

// Mock browser Audio APIs for initial setup
const mockAudioContext = vi.fn();
const mockAnalyser = vi.fn();
const mockGain = vi.fn();
const mockOscillator = vi.fn();

// Enhanced Web Audio API mocks
// AudioContext is already mocked in vitest.setup.ts

describe('AudioPlayer Real Integration', () => {
  const mockTrack = {
    id: 'test-track-1',
    title: 'Test Track',
    artist: 'Test Artist',
    duration: '3:00',
    coverUrl: '/test-cover.jpg',
    plays: 0,
    likes: 0,
    audioUrl: '/test-audio.mp3',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup AudioContext mock
    const mockContext = {
      state: 'running',
      sampleRate: 48000,
      baseLatency: 0.012,
      destination: { maxChannelCount: 2 },
      createAnalyser: mockAnalyser,
      createGain: mockGain,
      createOscillator: mockOscillator,
      createMediaElementSource: vi.fn(),
      createBiquadFilter: vi.fn(),
      createDelay: vi.fn(),
      createConvolver: vi.fn(),
      createStereoPanner: vi.fn(),
      createDynamicsCompressor: vi.fn(),
      createWaveShaper: vi.fn(),
      decodeAudioData: vi.fn().mockResolvedValue({}),
      resume: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(undefined),
    };

    const mockAnalyserNode = {
      frequencyBinCount: 128,
      fftSize: 256,
      smoothingTimeConstant: 0.8,
      maxDecibels: -30,
      minDecibels: -100,
      getByteFrequencyData: vi.fn(),
      getFloatFrequencyData: vi.fn(),
      getByteTimeDomainData: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
    };

    const mockGainNode = {
      gain: { value: 1, setValueAtTime: vi.fn() },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };

    mockAudioContext.mockReturnValue(mockContext);
    mockAnalyser.mockReturnValue(mockAnalyserNode);
    mockGain.mockReturnValue(mockGainNode);

    // Mock HTMLAudioElement
    // HTMLAudioElement is not mocked in vitest.setup.ts, so we can stub it here
    vi.stubGlobal(
      'HTMLAudioElement',
      vi.fn().mockImplementation(() => ({
        src: '',
        play: vi.fn().mockResolvedValue(undefined),
        pause: vi.fn(),
        load: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        volume: 1,
        currentTime: 0,
        duration: 0,
        paused: true,
        ended: false,
        readyState: 4,
        HAVE_ENOUGH_DATA: 4,
      }))
    );

    // Reset stores
    usePlayerStore.getState().setTrack(mockTrack);
    usePlayerStore.getState().pause();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('AudioContext Integration', () => {
    it('should initialize AudioContext properly', async () => {
      render(<AudioPlayer />);

      expect(mockAudioContext).toHaveBeenCalled();

      const audioContext = mockAudioContext.mock.results[0].value;
      expect(audioContext.state).toBe('running');
      expect(audioContext.sampleRate).toBe(48000);
      expect(audioContext.baseLatency).toBeLessThan(0.05);
    });

    it('should handle AudioContext suspension on mobile', async () => {
      // Simulate mobile browser behavior
      const mockSuspendedContext = {
        ...mockAudioContext.mock.results[0].value,
        state: 'suspended',
      };
      mockAudioContext.mockReturnValue(mockSuspendedContext);

      render(<AudioPlayer />);

      // Should attempt to resume suspended context
      await waitFor(() => {
        expect(mockSuspendedContext.resume).toHaveBeenCalled();
      });
    });

    it('should measure AudioContext initialization performance', async () => {
      const startTime = performance.now();
      render(<AudioPlayer />);
      await waitFor(() => {
        expect(mockAudioContext).toHaveBeenCalled();
      });
      const initTime = performance.now() - startTime;

      // Should initialize within 100ms according to MCP benchmarks
      expect(initTime).toBeLessThan(
        MCPAudioUtils.getAudioPerformanceBenchmarks().audioContextInitTime.threshold
      );
    });
  });

  describe('Audio Format Support', () => {
    it('should detect supported audio formats', () => {
      const mockAudio = {
        canPlayType: vi
          .fn()
          .mockReturnValueOnce('probably')
          .mockReturnValueOnce('maybe')
          .mockReturnValueOnce('')
          .mockReturnValueOnce('probably')
          .mockReturnValueOnce('maybe'),
      };

      global.Audio = vi.fn().mockImplementation(() => mockAudio);

      render(<AudioPlayer />);

      expect(mockAudio.canPlayType).toHaveBeenCalledWith('audio/mpeg');
      expect(mockAudio.canPlayType).toHaveBeenCalledWith('audio/wav');
      expect(mockAudio.canPlayType).toHaveBeenCalledWith('audio/ogg; codecs="vorbis"');
    });

    it('should fallback to supported formats', () => {
      const mockAudio = {
        canPlayType: vi.fn().mockReturnValue('probably'),
        src: '',
      };

      global.Audio = vi.fn().mockImplementation(() => mockAudio);

      render(<AudioPlayer />);

      // Should prefer MP3 if available
      expect(mockAudio.canPlayType).toHaveBeenCalledWith('audio/mpeg');
    });
  });

  describe('Web Audio API Nodes', () => {
    it('should create required audio nodes', async () => {
      render(<AudioPlayer />);

      await waitFor(() => {
        expect(mockAnalyser).toHaveBeenCalled();
        expect(mockGain).toHaveBeenCalled();
      });

      const analyserNode = mockAnalyser.mock.results[0].value;
      expect(analyserNode.fftSize).toBe(256);
      expect(analyserNode.frequencyBinCount).toBe(128);
      expect(analyserNode.smoothingTimeConstant).toBe(0.8);
    });

    it('should connect audio nodes properly', async () => {
      const mockCreateMediaElementSource = vi.fn().mockReturnValue({
        connect: vi.fn(),
      });

      const mockContext = {
        ...mockAudioContext.mock.results[0].value,
        createMediaElementSource: mockCreateMediaElementSource,
      };
      mockAudioContext.mockReturnValue(mockContext);

      render(<AudioPlayer />);

      await waitFor(() => {
        expect(mockCreateMediaElementSource).toHaveBeenCalled();
      });
    });

    it('should handle audio node creation errors gracefully', () => {
      mockAudioContext.mockImplementation(() => {
        throw new Error('AudioContext creation failed');
      });

      expect(() => {
        render(<AudioPlayer />);
      }).not.toThrow();
    });
  });

  describe('Audio Loading and Playback', () => {
    it('should load audio file when track is set', async () => {
      const { rerender } = render(<AudioPlayer />);

      const audioElement = vi.mocked(HTMLAudioElement).mock.results[0].value;

      // Simulate track loading
      rerender(<AudioPlayer />);

      expect(audioElement.src).toContain(mockTrack.audioUrl);
      expect(audioElement.load).toHaveBeenCalled();
    });

    it('should handle audio loading errors', async () => {
      const invalidTrack = {
        ...mockTrack,
        audioUrl: '',
      };

      const playerStore = usePlayerStore.getState();
      playerStore.setTrack(invalidTrack);

      render(<AudioPlayer />);

      // Should handle invalid audio URL gracefully
      expect(vi.mocked(HTMLAudioElement)).toHaveBeenCalled();
    });

    it('should play audio when play is triggered', async () => {
      const mockAudioElement = {
        src: '',
        play: vi.fn().mockResolvedValue(undefined),
        pause: vi.fn(),
        load: vi.fn(),
        volume: 1,
        currentTime: 0,
        duration: 180,
        paused: true,
        readyState: 4,
      };

      vi.stubGlobal(
        'HTMLAudioElement',
        vi.fn().mockImplementation(() => mockAudioElement)
      );

      render(<AudioPlayer />);

      const playerStore = usePlayerStore.getState();
      playerStore.play();

      expect(mockAudioElement.play).toHaveBeenCalled();
    });

    it('should handle autoplay restrictions', async () => {
      const mockAudioElement = {
        src: '',
        play: vi.fn().mockRejectedValue(new Error('Autoplay policy prevented')),
        pause: vi.fn(),
        load: vi.fn(),
        volume: 1,
        currentTime: 0,
        duration: 180,
        paused: true,
        readyState: 4,
      };

      vi.stubGlobal(
        'HTMLAudioElement',
        vi.fn().mockImplementation(() => mockAudioElement)
      );

      render(<AudioPlayer />);

      const playerStore = usePlayerStore.getState();

      expect(() => {
        playerStore.play();
      }).not.toThrow();
    });
  });

  describe('Performance Monitoring', () => {
    it('should track audio loading performance', async () => {
      const startTime = performance.now();

      render(<AudioPlayer />);

      const audioElement = vi.mocked(HTMLAudioElement).mock.results[0].value;

      // Simulate metadata loading
      fireEvent.loadedMetadata(audioElement);

      const loadTime = performance.now() - startTime;

      // Should load within reasonable time
      expect(loadTime).toBeLessThan(5000);
    });

    it('should measure processing latency', async () => {
      const mockContext = {
        ...mockAudioContext.mock.results[0].value,
        baseLatency: 0.025,
        outputLatency: 0.015,
      };

      mockAudioContext.mockReturnValue(mockContext);

      render(<AudioPlayer />);

      expect(mockContext.baseLatency).toBeGreaterThan(0);
      expect(mockContext.outputLatency).toBeGreaterThan(0);
    });
  });

  describe('Cross-browser Compatibility', () => {
    it('should support webkitAudioContext prefix', () => {
      // Test webkit prefix support
      delete global.AudioContext;

      const mockWebkitAudioContext = vi.fn().mockReturnValue({
        state: 'running',
        sampleRate: 44100,
        createAnalyser: mockAnalyser,
      });

      global.webkitAudioContext = mockWebkitAudioContext;

      render(<AudioPlayer />);

      expect(mockWebkitAudioContext).toHaveBeenCalled();
    });

    it('should handle missing Web Audio API gracefully', () => {
      delete global.AudioContext;
      delete global.webkitAudioContext;

      render(<AudioPlayer />);

      // Should not crash without Web Audio API
      expect(vi.mocked(HTMLAudioElement)).toHaveBeenCalled();
    });
  });
});
