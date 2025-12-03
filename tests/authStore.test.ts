import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useAuthStore } from '../stores/useAuthStore';

vi.mock('../services/supabase', () => {
  return {
    authService: {
      signOut: vi.fn().mockResolvedValue(undefined),
      signIn: vi.fn().mockResolvedValue({ data: { user: { id: 'u1', email: 'user@example.com', user_metadata: { avatar_url: 'a' } } }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: { id: 'u2', email: 'new@example.com', user_metadata: {} } }, error: null }),
      getCurrentUser: vi.fn().mockResolvedValue({ id: 'u3', email: 'cur@example.com', user_metadata: { avatar_url: 'img' } }),
    },
  };
});

vi.mock('../services/web3', () => {
  return {
    web3Service: {
      connectMetaMask: vi.fn().mockResolvedValue({ address: '0xabcdef1234567890', balance: '1.0', chainId: 1, isConnected: true }),
      onAccountsChanged: vi.fn(),
      getCurrentAccount: vi.fn().mockResolvedValue('0xabcdef1234567890'),
      signMessage: vi.fn().mockResolvedValue('0xsig'),
    },
  };
});

describe('useAuthStore', () => {
  beforeEach(() => {
    // reset state
    const { logout } = useAuthStore.getState();
    // ensure we start clean; logout handles effects
    logout();
  });

  it('login sets user and auth flags', () => {
    const s = useAuthStore.getState();
    s.login({ id: 'id1', username: 'u', email: 'e' });
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.id).toBe('id1');
  });

  it('logout clears auth flags', async () => {
    const s = useAuthStore.getState();
    s.login({ id: 'id1', username: 'u' });
    await s.logout();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isWeb3Connected).toBe(false);
    expect(state.user).toBeNull();
  });

  it('signInWithEmail updates user', async () => {
    const ok = await useAuthStore.getState().signInWithEmail('user@example.com', 'pw');
    expect(ok).toBe(true);
    const state = useAuthStore.getState();
    expect(state.user?.email).toBe('user@example.com');
    expect(state.isAuthenticated).toBe(true);
  });

  it('signUpWithEmail updates user', async () => {
    const ok = await useAuthStore.getState().signUpWithEmail('new@example.com', 'pw');
    expect(ok).toBe(true);
    const state = useAuthStore.getState();
    expect(state.user?.email).toBe('new@example.com');
  });

  it('connectWallet sets web3 flags and user wallet', async () => {
    const ok = await useAuthStore.getState().connectWallet();
    expect(ok).toBe(true);
    const state = useAuthStore.getState();
    expect(state.isWeb3Connected).toBe(true);
    expect(state.user?.wallet).toBe('0xabcdef1234567890');
  });

  it('signMessage proxies to web3 service', async () => {
    const sig = await useAuthStore.getState().signMessage('hello');
    expect(sig).toBe('0xsig');
  });

  it('checkAuth sets user and web3 connected', async () => {
    await useAuthStore.getState().checkAuth();
    const state = useAuthStore.getState();
    expect(state.user?.email).toBe('cur@example.com');
    expect(state.isWeb3Connected).toBe(true);
  });
});
