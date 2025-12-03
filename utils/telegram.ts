// Telegram WebApp API utilities

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface TelegramInitData {
  query_id?: string;
  user?: TelegramUser;
  auth_date: number;
  hash: string;
}

export interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  sendData: (data: string) => void;
  switchInlineQuery: (query: string) => void;
  openLink: (url: string) => void;
  openTelegramLink: (url: string) => void;
  openInvoice: (url: string, callback?: (status: string) => void) => void;
  showPopup: (popup: TelegramPopup) => Promise<TelegramPopupButton>;
  showAlert: (message: string) => void;
  showConfirm: (message: string) => Promise<boolean>;
  requestContact: () => Promise<TelegramUser>;
  requestWriteAccess: () => Promise<boolean>;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
  };
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  CloudStorage: {
    setItem: (key: string, value: string) => Promise<boolean>;
    getItem: (key: string) => Promise<string | null>;
    removeItem: (key: string) => Promise<boolean>;
    getItems: (keys: string[]) => Promise<{ [key: string]: string }>;
    removeItems: (keys: string[]) => Promise<boolean>;
  };
  BiometricManager: {
    isAvailable: () => boolean;
    authenticate: (reason?: string) => Promise<boolean>;
    updateToken: (token: string) => Promise<boolean>;
    requestAccess: (reason: string) => Promise<boolean>;
  };
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
  };
  viewportStable: {
    height: number;
    width: number;
    isStateStable: boolean;
  };
  colorScheme: 'light' | 'dark';
  isVersionAtLeast: (version: string) => boolean;
  platform: string;
  initData: string;
  initDataUnsafe: TelegramInitData;
}

export interface TelegramPopup {
  title: string;
  message: string;
  buttons: TelegramPopupButton[];
}

export interface TelegramPopupButton {
  id?: string;
  text: string;
  type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
}

declare global {
  interface Window {
    Telegram?: TelegramWebApp;
  }
}

// Telegram WebApp initialization
export const initTelegramWebApp = (): TelegramWebApp | null => {
  if (typeof window !== 'undefined' && window.Telegram) {
    try {
      const webApp = window.Telegram;

      // Initialize the WebApp
      webApp.ready();

      // Set up theme
      webApp.setHeaderColor('#1f2937');
      webApp.setBackgroundColor('#0f172a');

      // Expand to full height
      webApp.expand();

      return webApp;
    } catch (error) {
      console.error('Failed to initialize Telegram WebApp:', error);
      return null;
    }
  }

  return null;
};

// Get Telegram user data
export const getTelegramUser = (): TelegramUser | null => {
  const webApp = initTelegramWebApp();
  return webApp?.initDataUnsafe.user || null;
};

// Check if running in Telegram
export const isTelegramWebApp = (): boolean => {
  return typeof window !== 'undefined' && !!window.Telegram;
};

// Share content to Telegram
export const shareToTelegram = (
  url: string,
  title?: string,
  description?: string
): void => {
  const webApp = initTelegramWebApp();

  if (webApp) {
    // Use WebApp's openLink method with Telegram URL
    const shareUrl = new URL('https://t.me/share/url');
    shareUrl.searchParams.set('url', url);
    if (title) shareUrl.searchParams.set('text', `${title}\n${description || ''}`);

    webApp.openLink(shareUrl.toString());
  } else {
    // Fallback for regular web
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title ? `${title}\n${description || ''}` : '')}`, '_blank');
  }
};

// Share track to Telegram
export const shareTrackToTelegram = (track: any): void => {
  const webApp = initTelegramWebApp();

  if (webApp) {
    const message = `🎵 ${track.title}\n👤 ${track.artist}\n⏱️ ${track.duration}\n\n🎧 Listen on Normal Dance`;

    if (track.audioUrl) {
      // Send data to bot for inline query
      webApp.sendData(JSON.stringify({
        type: 'share_track',
        track: {
          title: track.title,
          artist: track.artist,
          duration: track.duration,
          audioUrl: track.audioUrl,
          coverUrl: track.coverUrl
        }
      }));
    } else {
      // Fallback to sharing URL
      shareToTelegram(
        window.location.origin + `/track/${track.id}`,
        track.title,
        `🎵 ${track.artist} • ${track.duration}`
      );
    }
  }
};

// Share playlist to Telegram
export const sharePlaylistToTelegram = (playlist: any): void => {
  const webApp = initTelegramWebApp();

  if (webApp) {
    const message = `🎵 ${playlist.name}\n${playlist.description || ''}\n${playlist.tracks_count} tracks\n\n🎧 Playlist on Normal Dance`;

    webApp.sendData(JSON.stringify({
      type: 'share_playlist',
      playlist: {
        name: playlist.name,
        description: playlist.description,
        tracks_count: playlist.tracks_count,
        id: playlist.id
      }
    }));
  } else {
    // Fallback to sharing URL
    shareToTelegram(
      window.location.origin + `/playlist/${playlist.id}`,
      playlist.name,
      `${playlist.tracks_count} tracks • ${playlist.description || ''}`
    );
  }
};

// MainButton utilities
export const setupMainButton = (
  text: string,
  onClick: () => void,
  options?: {
    color?: string;
    textColor?: string;
  }
): TelegramWebApp['MainButton'] | null => {
  const webApp = initTelegramWebApp();

  if (!webApp?.MainButton) return null;

  const mainButton = webApp.MainButton;

  // Set up button
  mainButton.setText(text);
  if (options?.color) mainButton.color = options.color;
  if (options?.textColor) mainButton.textColor = options.textColor;

  // Add click handler
  mainButton.onClick(onClick);

  return mainButton;
};

// BackButton utilities
export const setupBackButton = (
  onClick: () => void
): TelegramWebApp['BackButton'] | null => {
  const webApp = initTelegramWebApp();

  if (!webApp?.BackButton) return null;

  const backButton = webApp.BackButton;
  backButton.onClick(onClick);
  backButton.show();

  return backButton;
};

// Haptic feedback
export const haptic = {
  light: () => {
    const webApp = initTelegramWebApp();
    webApp?.HapticFeedback.impactOccurred('light');
  },
  medium: () => {
    const webApp = initTelegramWebApp();
    webApp?.HapticFeedback.impactOccurred('medium');
  },
  heavy: () => {
    const webApp = initTelegramWebApp();
    webApp?.HapticFeedback.impactOccurred('heavy');
  },
  success: () => {
    const webApp = initTelegramWebApp();
    webApp?.HapticFeedback.notificationOccurred('success');
  },
  error: () => {
    const webApp = initTelegramWebApp();
    webApp?.HapticFeedback.notificationOccurred('error');
  },
  selection: () => {
    const webApp = initTelegramWebApp();
    webApp?.HapticFeedback.selectionChanged();
  }
};

// Theme utilities
export const getTelegramTheme = () => {
  const webApp = initTelegramWebApp();

  return {
    colorScheme: webApp?.colorScheme || 'dark',
    themeParams: webApp?.themeParams || {},
    viewportStable: webApp?.viewportStable || { height: 0, width: 0, isStateStable: false }
  };
};

// Store data in Telegram Cloud Storage
export const telegramStorage = {
  setItem: async (key: string, value: string): Promise<boolean> => {
    const webApp = initTelegramWebApp();
    if (!webApp?.CloudStorage) return false;

    try {
      return await webApp.CloudStorage.setItem(key, value);
    } catch (error) {
      console.error('Failed to set Telegram storage item:', error);
      return false;
    }
  },

  getItem: async (key: string): Promise<string | null> => {
    const webApp = initTelegramWebApp();
    if (!webApp?.CloudStorage) return null;

    try {
      return await webApp.CloudStorage.getItem(key);
    } catch (error) {
      console.error('Failed to get Telegram storage item:', error);
      return null;
    }
  },

  removeItem: async (key: string): Promise<boolean> => {
    const webApp = initTelegramWebApp();
    if (!webApp?.CloudStorage) return false;

    try {
      return await webApp.CloudStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove Telegram storage item:', error);
      return false;
    }
  }
};