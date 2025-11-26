import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AudioPlayer } from './components/AudioPlayer';
import { AppRoutes } from './routes/AppRoutes';
import { useTracksStore } from './stores/useTracksStore';
import { Toaster } from './components/Toaster';

const App = () => {
  const { loadTracks } = useTracksStore();

  // Initialize data on app mount
  useEffect(() => {
    loadTracks();
  }, [loadTracks]);

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
