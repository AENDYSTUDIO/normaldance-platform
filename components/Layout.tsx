import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, TrendingUp, Compass, Library, UploadCloud,
  Wallet, Disc, Coins, BarChart2, Skull, Settings,
  Menu, X, ListMusic, Users, Bug, Activity, Terminal
} from 'lucide-react';

import { usePlayerStore } from '../stores/usePlayerStore';

import { LazyAnimatePresence, LazyMotionDiv, variants, springPresets } from './AnimatedMotion';
import { PlayerBar } from './PlayerBar';
import { PerformanceDashboard } from './PerformanceDashboard';

interface LayoutProps {
  children: React.ReactNode;
}

const SidebarItem: React.FC<{
  icon: any;
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({
  icon: Icon,
  label,
  active,
  onClick
}) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 ease-out group hover:scale-[1.02] active:scale-[0.98] ${active
          ? 'bg-gradient-to-r from-violet-600/20 to-purple-600/20 text-violet-400 border border-violet-500/20 shadow-lg shadow-violet-500/10'
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
        }`}
    >
      <Icon size={20} className={active ? 'text-violet-400' : 'text-gray-500 group-hover:text-white'} />
      <span className="font-medium text-sm">{label}</span>
      {active && (
        <LazyMotionDiv
          layoutId="activeIndicator"
          className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400"
        />
      )}
    </button>
  );

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentTrack } = usePlayerStore();

  const menuItems = [
    { path: '/feed', label: 'Feed', icon: Home },
    { path: '/trends', label: 'Trends', icon: TrendingUp },
    { path: '/explore', label: 'Explore', icon: Compass },
    { path: '/library', label: 'Library', icon: Library },
    { path: '/playlists', label: 'Playlists', icon: ListMusic },
    { path: '/profile', label: 'Profile', icon: Users },
    { path: '/upload', label: 'Upload', icon: UploadCloud },
    { path: '/wallet', label: 'Wallet', icon: Wallet },
    { path: '/nft', label: 'NFT Market', icon: Disc },
    { path: '/staking', label: 'Staking', icon: Coins },
    { path: '/statistics', label: 'Statistics', icon: BarChart2 },
    { path: '/grave', label: 'G.Rave', icon: Skull },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <div className="h-screen w-full flex bg-dark-900 relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-violet-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-indigo-900/10 rounded-full blur-[100px]" />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden absolute top-0 left-0 right-0 h-16 flex items-center justify-between px-4 z-50 glass-panel border-b border-white/5">
        <span className="text-xl font-display font-bold text-white tracking-wider">NORMAL DANCE</span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-dark-900/95 backdrop-blur-xl border-r border-white/5 transform transition-transform duration-300 lg:translate-x-0 lg:relative
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6">
          <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-violet-400 to-white bg-clip-text text-transparent mb-1">NORMAL DANCE</h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest">Web3 Music Platform</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-1 pb-24 scrollbar-hide">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              active={location.pathname === item.path || (location.pathname === '/' && item.path === '/feed')}
              onClick={() => handleNavigation(item.path)}
            />
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Top Header Area (Desktop) */}
        <header className="hidden lg:flex items-center justify-between px-8 py-5">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search artists, tracks, or NFTs..."
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-5 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50 w-80 transition-all duration-300 focus:scale-[1.02] focus:bg-white/8 placeholder-gray-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-end mr-2">
              <span className="text-sm font-medium text-white">0x12...34A2</span>
              <span className="text-xs text-violet-400">Connected</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-500 to-indigo-500 p-[2px]">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=CryptoDJ_99&backgroundColor=1e1b4b" alt="Avatar" className="w-full h-full rounded-full border-2 border-dark-900 bg-dark-800" />
            </div>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 pb-32">
          <LazyAnimatePresence mode="wait">
            <LazyMotionDiv
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto"
            >
              {children}
            </LazyMotionDiv>
          </LazyAnimatePresence>
        </div>

        {/* Floating Player Bar */}
        {currentTrack && (
          <div className="absolute bottom-0 left-0 right-0 z-50">
            <PlayerBar />
          </div>
        )}
      </main>

      {/* Performance Dashboard */}
      <PerformanceDashboard />
    </div>
  );
};