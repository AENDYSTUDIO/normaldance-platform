import '@testing-library/jest-dom/vitest';
import { vi, beforeEach } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = value.toString();
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key(index: number) {
      return Object.keys(store)[index] || null;
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage as well
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: string) {
      store[key] = value.toString();
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key(index: number) {
      return Object.keys(store)[index] || null;
    },
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock Web Audio API for audio tests
Object.defineProperty(window, 'AudioContext', {
  value: class MockAudioContext {
    createGain() {
      return {
        gain: { value: 1 }
      };
    }
    createAnalyser() {
      return {
        frequencyBinCount: 128,
        getFloatFrequencyData: vi.fn(),
        getByteTimeDomainData: vi.fn(),
      };
    }
    createOscillator() {
      return {
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      };
    }
    createMediaElementSource() {
      return {
        connect: vi.fn(),
      };
    }
    decodeAudioData() {
      return Promise.resolve({});
    }
  },
});

// Mock HTMLAudioElement methods
Object.defineProperty(HTMLAudioElement.prototype, 'play', {
  value: vi.fn().mockImplementation(() => Promise.resolve()),
});

Object.defineProperty(HTMLMediaElement.prototype, 'pause', {
  value: vi.fn(),
});

Object.defineProperty(HTMLMediaElement.prototype, 'load', {
  value: vi.fn(),
});

// Clear localStorage before each test
beforeEach(() => {
  localStorageMock.clear();
  sessionStorageMock.clear();
});
