
import React from 'react';
import { ShoppingBag, Filter } from 'lucide-react';
import { Track } from '../types';

interface NFTProps {
    tracks: Track[];
}

export const NFT: React.FC<NFTProps> = ({ tracks }) => {
  // Filter for tracks that are NFTs
  const nftTracks = tracks.filter(t => t.isNft);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-white">NFT Marketplace</h2>
          <p className="text-gray-400">Collect unique music moments.</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10 transition">
           <Filter size={18} />
           <span>Filter</span>
        </button>
      </div>

      {nftTracks.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
              No NFTs available at the moment. Try uploading one!
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {nftTracks.map((track, i) => (
            <div key={track.id} className="glass-panel p-3 rounded-2xl hover:-translate-y-1 transition duration-300 group">
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-violet-500/30">
                    <span className="text-xs font-bold text-violet-300">#{track.id.substring(0,4)}</span>
                </div>
                </div>
                <div className="px-1">
                <h4 className="text-white font-bold truncate">{track.title}</h4>
                <p className="text-gray-400 text-xs mb-3">{track.artist}</p>
                
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                    <div>
                    <p className="text-gray-500 text-[10px] uppercase font-bold">Price</p>
                    <p className="text-white font-bold text-sm">{(0.5 + i * 0.1).toFixed(2)} SOL</p>
                    </div>
                    <button className="bg-white text-black p-2 rounded-full hover:bg-violet-400 hover:text-white transition shadow-lg shadow-white/10">
                        <ShoppingBag size={18} />
                    </button>
                </div>
                </div>
            </div>
            ))}
        </div>
      )}
    </div>
  );
};
