import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

import { useAuthStore } from '../stores/useAuthStore';
import { Layout } from '../components/Layout';

// Lazy load pages for better performance
const Feed = lazy(() => import('../pages/Feed').then(m => ({ default: m.Feed })));
const Trends = lazy(() => import('../pages/Trends').then(m => ({ default: m.Trends })));
const Explore = lazy(() => import('../pages/Explore').then(m => ({ default: m.Explore })));
const Library = lazy(() => import('../pages/Library').then(m => ({ default: m.Library })));
const Upload = lazy(() => import('../pages/Upload').then(m => ({ default: m.Upload })));
const Wallet = lazy(() => import('../pages/Wallet').then(m => ({ default: m.Wallet })));
const NFT = lazy(() => import('../pages/NFT').then(m => ({ default: m.NFT })));
const Staking = lazy(() => import('../pages/Staking').then(m => ({ default: m.Staking })));
const Statistics = lazy(() => import('../pages/Statistics').then(m => ({ default: m.Statistics })));
const GRave = lazy(() => import('../pages/GRave').then(m => ({ default: m.GRave })));
const Settings = lazy(() => import('../pages/Settings').then(m => ({ default: m.Settings })));
const Playlists = lazy(() => import('../pages/Playlists').then(m => ({ default: m.Playlists })));
const Profile = lazy(() => import('../pages/Profile').then(m => ({ default: m.Profile })));
const Auth = lazy(() => import('../pages/Auth').then(m => ({ default: m.Auth })));

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center h-full p-8">
    <div className="w-full max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="glass-panel p-6 rounded-2xl animate-pulse h-40" />
        <div className="glass-panel p-6 rounded-2xl animate-pulse h-40" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-panel p-6 rounded-2xl animate-pulse h-32" />
        ))}
      </div>
    </div>
  </div>
);

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated, user, hasHydrated } = useAuthStore();

    console.log('ProtectedRoute - hasHydrated:', hasHydrated(), 'isAuthenticated:', isAuthenticated, 'user:', user);

    // Check if Zustand has hydrated
    if (!hasHydrated()) {
        return (
            <div className="min-h-screen bg-dark-900 flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        console.log('Not authenticated, redirecting to /auth');
        return <Navigate to="/auth" replace />;
    }

    console.log('Authenticated, rendering children');
    return <>{children}</>;
};

// Protected layout wrapper with Layout + Outlet
const ProtectedLayout = () => (
    <ProtectedRoute>
        <Layout>
            <Outlet />
        </Layout>
    </ProtectedRoute>
);

export const AppRoutes = () => {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                {/* Public routes */}
                <Route path="/auth" element={<Auth />} />

                {/* Protected routes with shared Layout */}
                <Route element={<ProtectedLayout />}>
                    <Route path="/" element={<Feed />} />
                    <Route path="/feed" element={<Feed />} />
                    <Route path="/trends" element={<Trends />} />
                    <Route path="/explore" element={<Explore />} />
                    <Route path="/library" element={<Library />} />
                    <Route path="/playlists" element={<Playlists />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/upload" element={<Upload />} />
                    <Route path="/wallet" element={<Wallet />} />
                    <Route path="/nft" element={<NFT />} />
                    <Route path="/staking" element={<Staking />} />
                    <Route path="/statistics" element={<Statistics />} />
                    <Route path="/grave" element={<GRave />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings onLogout={() => {}} />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
};
