import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { useToastStore } from '../stores/useToastStore';

describe('useToastStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // reset store state
    const { toasts } = useToastStore.getState();
    toasts.splice(0, toasts.length);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('adds and removes toast automatically after duration', () => {
    const s = useToastStore.getState();
    s.addToast('Hello', 'success', 1000);
    expect(useToastStore.getState().toasts.length).toBe(1);
    vi.advanceTimersByTime(999);
    expect(useToastStore.getState().toasts.length).toBe(1);
    vi.advanceTimersByTime(1);
    expect(useToastStore.getState().toasts.length).toBe(0);
  });

  it('removeToast removes by id', () => {
    const s = useToastStore.getState();
    s.addToast('A');
    const id = useToastStore.getState().toasts[0].id;
    s.removeToast(id);
    expect(useToastStore.getState().toasts.length).toBe(0);
  });
});
