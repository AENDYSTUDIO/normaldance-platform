import { Suspense, lazy } from 'react';
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
const Auth = lazy(() => import('../pages/Auth').then(m => ({ default: m.Auth })));

// Loading fallback component
const PageLoader = () => (
    <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
            <span className="text-gray-400 text-sm">Loading...</span>
        </div>
    </div>
);

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/auth" replace />;
    }

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
                    <Route path="/upload" element={<Upload />} />
                    <Route path="/wallet" element={<Wallet />} />
                    <Route path="/nft" element={<NFT />} />
                    <Route path="/staking" element={<Staking />} />
                    <Route path="/statistics" element={<Statistics />} />
                    <Route path="/grave" element={<GRave />} />
                    <Route path="/settings" element={<Settings />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
};
