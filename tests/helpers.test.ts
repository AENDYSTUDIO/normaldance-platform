import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { formatTime, shortenAddress, formatNumber, generateId, clamp, debounce, isBrowser, formatFileSize, getQueryParams } from '../utils/helpers';

describe('utils/helpers', () => {
  describe('formatTime', () => {
    it('formats seconds to MM:SS', () => {
      expect(formatTime(0)).toBe('0:00');
      expect(formatTime(5)).toBe('0:05');
      expect(formatTime(65)).toBe('1:05');
    });
    it('formats over an hour to HH:MM:SS', () => {
      expect(formatTime(3661)).toBe('1:01:01');
    });
    it('handles non-finite', () => {
      expect(formatTime(NaN as any)).toBe('0:00');
      expect(formatTime(Infinity as any)).toBe('0:00');
    });
  });

  describe('shortenAddress', () => {
    it('shortens address with default chars', () => {
      expect(shortenAddress('0x1234567890abcdef')).toBe('0x1234...cdef');
    });
    it('handles empty', () => {
      expect(shortenAddress('')).toBe('');
    });
  });

  describe('formatNumber', () => {
    it('formats with K, M, B suffixes', () => {
      expect(formatNumber(999)).toBe('999');
      expect(formatNumber(1_234)).toBe('1.2K');
      expect(formatNumber(1_234_567)).toBe('1.2M');
      expect(formatNumber(1_234_567_890)).toBe('1.2B');
    });
  });

  describe('generateId', () => {
    it('generates unique-like ids', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 1000; i++) ids.add(generateId());
      expect(ids.size).toBeGreaterThan(900);
    });
  });

  describe('clamp', () => {
    it('clamps values to range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-1, 0, 10)).toBe(0);
      expect(clamp(11, 0, 10)).toBe(10);
    });
  });

  describe('debounce', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('debounces function calls', () => {
      const mock = vi.fn();
      const debounced = debounce(mock, 200);
      debounced(1);
      debounced(2);
      debounced(3);
      expect(mock).toHaveBeenCalledTimes(0);
      vi.advanceTimersByTime(199);
      expect(mock).toHaveBeenCalledTimes(0);
      vi.advanceTimersByTime(1);
      expect(mock).toHaveBeenCalledTimes(1);
    });
  });

  describe('isBrowser', () => {
    it('returns true in jsdom', () => {
      expect(isBrowser()).toBe(true);
    });
  });

  describe('formatFileSize', () => {
    it('formats bytes properly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1023)).toBe('1023 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
    });
  });

  describe('getQueryParams', () => {
    it('parses query string', () => {
      const params = getQueryParams('?a=1&b=hello');
      expect(params).toEqual({ a: '1', b: 'hello' });
    });
  });
});
