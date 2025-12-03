
import React, { useEffect, useState } from 'react';

import { GenreTileSkeleton } from '../components/Skeleton';

const CATEGORIES = [
  { name: 'Electronic', color: 'from-blue-500 to-purple-600' },
  { name: 'Hip Hop', color: 'from-yellow-500 to-red-600' },
  { name: 'Ambient', color: 'from-teal-400 to-emerald-600' },
  { name: 'Rock', color: 'from-pink-500 to-rose-600' },
  { name: 'Jazz', color: 'from-orange-400 to-amber-600' },
  { name: 'Classical', color: 'from-indigo-400 to-slate-600' },
  { name: 'Metal', color: 'from-gray-600 to-black' },
  { name: 'Folk', color: 'from-green-500 to-lime-600' },
];

export const Explore: React.FC = () => {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
         <h2 className="text-3xl font-display font-bold text-white">Explore Genres</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: CATEGORIES.length }).map((_, i) => <GenreTileSkeleton key={i} />)
          : CATEGORIES.map(cat => (
              <div key={cat.name} className={`h-40 rounded-2xl bg-gradient-to-br ${cat.color} p-6 relative overflow-hidden group cursor-pointer hover:scale-[1.02] transition`}>
                <h3 className="text-2xl font-bold text-white relative z-10">{cat.name}</h3>
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-xl group-hover:scale-150 transition duration-500"></div>
              </div>
            ))}
      </div>

      <div className="glass-panel p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-violet-900/20 to-transparent pointer-events-none"></div>
        <div className="space-y-2 relative z-10">
          <span className="text-violet-400 text-sm font-bold tracking-widest uppercase">Curated Playlist</span>
          <h3 className="text-3xl font-bold text-white">Sounds of Web3</h3>
          <p className="text-gray-400 max-w-md">Discover the hidden gems of the decentralized music world. Curated daily by the community.</p>
          <button className="bg-white text-black px-6 py-2 rounded-full font-bold mt-4 hover:bg-gray-200 transition">Play Now</button>
        </div>
        <div className="flex gap-4 relative z-10">
           <img src="https://picsum.photos/200/200?random=50" loading="lazy" className="w-32 h-32 rounded-lg shadow-lg -rotate-6 border border-white/10" alt="cover1" />
           <img src="https://picsum.photos/200/200?random=51" loading="lazy" className="w-32 h-32 rounded-lg shadow-lg rotate-3 z-10 border border-white/10" alt="cover2" />
        </div>
      </div>
    </div>
  );
};
