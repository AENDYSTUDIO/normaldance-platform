import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

import { AudioPlayer } from './components/AudioPlayer';
import { AppRoutes } from './routes/AppRoutes';
import { useTracksStore } from './stores/useTracksStore';
import { useAuthStore } from './stores/useAuthStore';
import { Toaster } from './components/Toaster';
import { performanceMonitor } from './services/performance';

const App = () => {
  const { loadTracks } = useTracksStore();
  const { checkAuth } = useAuthStore();

  // Initialize data on app mount
  useEffect(() => {
    // Check authentication status first
    checkAuth().then(() => {
      console.log('App - checkAuth completed');
    });
    // Load tracks
    loadTracks();
    // Initialize performance monitoring
    if (typeof window !== 'undefined') {
      import('./services/performance').then(() => {
        console.log('Performance monitoring initialized');
      });
    }
  }, [loadTracks, checkAuth]);

  // Prefetch popular routes when idle
  useEffect(() => {
    const prefetch = () => {
      // Prefetch Feed and Trends route chunks
      import('./pages/Feed');
      import('./pages/Trends');
    };
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(prefetch);
    } else {
      setTimeout(prefetch, 1500);
    }
  }, []);

  return (
    <HelmetProvider>
      <BrowserRouter>
        {/* Global toast container */}
        <Toaster />
        {/* Hidden audio player component */}
        <AudioPlayer />
        <AppRoutes />
      </BrowserRouter>
    </HelmetProvider>
  );
};

export default App;
