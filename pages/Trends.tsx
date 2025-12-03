
import React from 'react';
import { TrendingUp, Play } from 'lucide-react';

import { useTracksStore } from '../stores/useTracksStore';
import { usePlayerStore } from '../stores/usePlayerStore';
import { SEO } from '../components/SEO';

export const Trends: React.FC = () => {
  const { tracks } = useTracksStore();
  const { setPlaylist, setTrack } = usePlayerStore();

  const onPlay = (track: any) => {
    const trending = [...tracks].sort((a, b) => b.plays - a.plays).slice(0, 5);
    const index = trending.findIndex(t => t.id === track.id);
    setPlaylist(trending, index >= 0 ? index : 0);
    setTrack(track);
  };

  // Sort by plays descending
  const trendingTracks = [...tracks].sort((a, b) => b.plays - a.plays).slice(0, 5);

  return (
    <>
      <SEO title="Trending Now" description="Top trending tracks on NORMAL DANCE" />
      <div className="space-y-8">
      <h2 className="text-3xl font-display font-bold text-white">Trending Now</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-white mb-4">Top Tracks</h3>
          {trendingTracks.map((track, idx) => (
            <div 
              key={track.id} 
              onClick={() => onPlay(track)}
              className="glass-panel p-4 rounded-xl flex items-center space-x-4 hover:bg-white/5 transition group cursor-pointer"
            >
              <span className="text-2xl font-bold text-gray-600 w-8 text-center group-hover:text-violet-400">{idx + 1}</span>
              <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={track.coverUrl} alt={track.title} loading="lazy" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <Play size={20} className="text-white" fill="currentColor" />
                  </div>
              </div>
              <div className="flex-1">
                <h4 className="text-white font-bold">{track.title}</h4>
                <p className="text-gray-400 text-sm">{track.artist}</p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <TrendingUp size={14} className="text-green-400" />
                  <span>{track.plays.toLocaleString()} plays</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-4">Trending Genres</h3>
            <div className="space-y-3">
              {['Cyberpunk Phonk', 'Ethereal Techno', 'Neural D&B', 'Space Ambient'].map((g, i) => (
                <div key={g} className="flex items-center justify-between">
                   <span className="text-gray-300">{g}</span>
                   <span className="text-violet-400 font-bold">+{25 - i*4}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl">
             <h3 className="text-lg font-bold text-white mb-4">Rising Artists</h3>
             <div className="flex -space-x-3 overflow-hidden py-2">
                {[1,2,3,4,5].map(i => (
                  <img key={i} className="inline-block h-10 w-10 rounded-full ring-2 ring-dark-900 hover:scale-110 transition" src={`https://picsum.photos/50/50?random=${i+10}`} alt="artist"/>
                ))}
             </div>
             <button className="w-full mt-4 py-2 rounded-lg border border-white/10 text-sm text-white hover:bg-white/5 transition">View All</button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};
