import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { authService } from '../services/supabase';
import { web3Service } from '../services/web3';

interface User {
  id: string;
  username: string;
  email?: string;
  wallet?: string;
  avatar?: string;
  balance?: string;
  chainId?: number;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isWeb3Connected: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;

  // Traditional auth
  login: (user: User) => void;
  logout: () => void;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (email: string, password: string) => Promise<boolean>;

  // Web3 auth
  connectWallet: () => Promise<boolean>;
  disconnectWallet: () => void;
  signMessage: (message: string) => Promise<string | null>;

  // Utility
  updateUser: (updates: Partial<User>) => void;
  checkAuth: () => Promise<void>;
  hasHydrated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isWeb3Connected: false,
      isLoading: false,
      _hasHydrated: false,

      // Traditional login
      login: (user) => set({ user, isAuthenticated: true }),

      // Logout
      logout: async () => {
        await authService.signOut();
        await get().disconnectWallet();
        set({ user: null, isAuthenticated: false, isWeb3Connected: false });
      },

      // Sign in with email/password
      signInWithEmail: async (email, password) => {
        set({ isLoading: true });
        const { data, error } = await authService.signIn(email, password);

        if (error || !data.user) {
          set({ isLoading: false });
          return false;
        }

        set({
          user: {
            id: data.user.id,
            username: data.user.email?.split('@')[0] || 'User',
            email: data.user.email || '',
            avatar: data.user.user_metadata?.avatar_url,
          },
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      },

      // Sign up with email/password
      signUpWithEmail: async (email, password) => {
        set({ isLoading: true });
        const { data, error } = await authService.signUp(email, password);

        if (error || !data.user) {
          set({ isLoading: false });
          return false;
        }

        set({
          user: {
            id: data.user.id,
            username: email.split('@')[0],
            email: email,
          },
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      },

      // Connect Web3 wallet
      connectWallet: async () => {
        set({ isLoading: true });
        const walletInfo = await web3Service.connectMetaMask();

        if (!walletInfo) {
          set({ isLoading: false });
          return false;
        }

        const currentUser = get().user;
        const walletAddress = walletInfo.address.slice(0, 6) + '...' + walletInfo.address.slice(-4);

        set({
          user: {
            id: currentUser?.id || walletInfo.address,
            username: currentUser?.username || walletAddress,
            email: currentUser?.email,
            wallet: walletInfo.address,
            balance: walletInfo.balance,
            chainId: walletInfo.chainId,
            avatar: currentUser?.avatar,
          },
          isWeb3Connected: true,
          isAuthenticated: true,
          isLoading: false,
        });

        // Listen to account changes
        web3Service.onAccountsChanged((accounts) => {
          if (accounts.length === 0) {
            get().disconnectWallet();
          } else {
            const newAddress = accounts[0];
            get().updateUser({ wallet: newAddress });
          }
        });

        return true;
      },

      // Disconnect Web3 wallet
      disconnectWallet: () => {
        const currentUser = get().user;
        set({
          user: currentUser ? {
            ...currentUser,
            wallet: undefined,
            balance: undefined,
            chainId: undefined,
          } : null,
          isWeb3Connected: false,
        });
      },

      // Sign a message with Web3 wallet
      signMessage: async (message) => {
        return await web3Service.signMessage(message);
      },

      // Update user info
      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },

      // Check authentication status
      checkAuth: async () => {
        const user = await authService.getCurrentUser();
        if (user) {
          set({
            user: {
              id: user.id,
              username: user.email?.split('@')[0] || 'User',
              email: user.email || '',
              avatar: user.user_metadata?.avatar_url,
            },
            isAuthenticated: true,
          });
        }

        // Check Web3 connection
        const account = await web3Service.getCurrentAccount();
        if (account) {
          get().updateUser({ wallet: account });
          set({ isWeb3Connected: true });
        }
      },

      hasHydrated: () => get()._hasHydrated,
    }),
    {
      name: 'auth-storage',
      onRehydrateStorage: () => (state) => {
        console.log('Zustand rehydrating auth store');
        if (state) {
          // Ensure isAuthenticated is properly set after rehydration
          state.isAuthenticated = !!state.user;
          state._hasHydrated = true;
          console.log('Auth store hydrated, isAuthenticated:', state.isAuthenticated, 'user:', state.user);
        }
      },
    }
  )
);
