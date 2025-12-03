import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Play, Heart } from 'lucide-react';

import { Track } from '../types';
import { useTracksStore } from '../stores/useTracksStore';
import { usePlayerStore } from '../stores/usePlayerStore';
import { TrackCardSkeleton } from '../components/Skeleton';

export const Feed: React.FC = () => {
  const { tracks, isLoading } = useTracksStore();
  const { setTrack, setPlaylist } = usePlayerStore();

  const handlePlay = (track: Track, index: number = 0) => {
    setPlaylist(tracks, index);
    setTrack(track);
  };

  // Use the most recent track as featured if available, else default
  const featuredTrack = tracks.length > 0 ? tracks[0] : null;

  return (
    <>
      <Helmet>
        <title>Feed - NORMAL DANCE</title>
        <meta name="description" content="Discover the latest music releases on NORMAL DANCE Web3 platform" />
      </Helmet>
      <div className="space-y-8">
        {/* Hero Banner */}
        {featuredTrack && (
          <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden group cursor-pointer">
            <img
              src="https://picsum.photos/1200/400?random=hero"
              alt="Featured"
              loading="lazy"
              className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end p-8">
              <span className="px-3 py-1 bg-violet-600 text-white text-xs font-bold rounded-full w-fit mb-4">NEW RELEASE</span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">{featuredTrack.title}</h2>
              <p className="text-gray-300 text-lg mb-6">Experience the sounds of the future with our latest curated playlist.</p>
              <button
                onClick={() => handlePlay(featuredTrack, 0)}
                className="flex items-center space-x-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-violet-400 transition w-fit"
              >
                <Play size={18} fill="currentColor" />
                <span>Listen Now</span>
              </button>
            </div>
          </div>
        )}

        {/* For You Section */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-6 font-display">For You</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <TrackCardSkeleton key={i} />)
              : tracks.map((track, index) => (
                  <TrackCard key={track.id} track={track} onPlay={() => handlePlay(track, index)} />
                ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Live Activity</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 text-xs">
                    0x
                  </div>
                  <p className="text-sm text-gray-300">
                    <span className="text-violet-400">User 0x8a...42</span> minted <span className="text-white font-medium">Cyber Punk #4202</span>
                  </p>
                </div>
                <span className="text-xs text-gray-500">2m ago</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

const TrackCard: React.FC<{ track: Track; onPlay: () => void }> = ({ track, onPlay }) => (
  <div className="glass-panel p-4 rounded-3xl hover:bg-white/5 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 group cursor-pointer">
    <div className="relative aspect-square rounded-2xl overflow-hidden mb-4">
      <img src={track.coverUrl} alt={track.title} loading="lazy" className="w-full h-full object-cover transition duration-300 group-hover:scale-105" />
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center space-x-4 backdrop-blur-sm">
        <button
          onClick={(e) => { e.stopPropagation(); onPlay(); }}
          className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Play size={22} fill="currentColor" className="ml-1" />
        </button>
        <button className="w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-all duration-200 backdrop-blur-md hover:scale-110">
          <Heart size={20} />
        </button>
      </div>
      {track.isNft && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-[10px] font-bold text-violet-300 border border-violet-500/30">
          NFT
        </div>
      )}
    </div>
    <h4 className="text-white font-bold truncate">{track.title}</h4>
    <p className="text-gray-400 text-sm truncate">{track.artist}</p>
    <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
      <span>{track.plays.toLocaleString()} plays</span>
      <span>{track.duration}</span>
    </div>
  </div>
);
