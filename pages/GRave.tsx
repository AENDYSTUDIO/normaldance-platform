import React from 'react';
import { motion } from 'framer-motion';
import { Info, Flame } from 'lucide-react';

export const GRave: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex flex-col">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 mb-4">
          G.RAVE MEMORIAL
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
          An eternal on-chain tribute. Preserve the legacy of artists forever on the blockchain with IPFS metadata and 3D visualization.
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* 3D Visualizer Mockup */}
        <div className="relative flex items-center justify-center">
          {/* Vinyl Record */}
          <div className="relative w-80 h-80 md:w-96 md:h-96 rounded-full bg-black shadow-2xl shadow-violet-900/50 flex items-center justify-center border-4 border-gray-800 vinyl-spin">
            {/* Grooves */}
            <div className="absolute inset-2 rounded-full border border-gray-800/50 opacity-50"></div>
            <div className="absolute inset-4 rounded-full border border-gray-800/50 opacity-50"></div>
            <div className="absolute inset-8 rounded-full border border-gray-800/50 opacity-50"></div>
            <div className="absolute inset-16 rounded-full border border-gray-800/50 opacity-50"></div>
            
            {/* Label */}
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-600 to-indigo-800 flex items-center justify-center text-center p-2 z-10">
               <span className="text-[10px] font-bold text-white uppercase tracking-wider">Eternal Memory<br/>Block #92834</span>
            </div>
            
            {/* Gloss */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent rounded-t-full pointer-events-none"></div>
          </div>
          
          {/* Platform */}
          <div className="absolute -bottom-16 w-64 h-8 bg-gray-800 rounded-[100%] blur-xl opacity-80"></div>
        </div>

        {/* Memorial Details */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-violet-500">
            <div className="flex items-center space-x-2 mb-2 text-violet-400">
              <Info size={16} />
              <span className="text-xs font-bold uppercase tracking-widest">Memorial Details</span>
            </div>
            <h3 className="text-2xl font-bold text-white">Avicii - Tim Bergling</h3>
            <p className="text-gray-400 text-sm mt-1">1989 - 2018</p>
            <div className="mt-4 flex gap-2">
              <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-300 border border-white/10">House</span>
              <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-300 border border-white/10">EDM</span>
            </div>
          </div>

          {/* Candle Grid */}
          <div className="glass-panel p-6 rounded-2xl">
            <h4 className="text-white font-bold mb-4 flex items-center">
              <span className="mr-2">27 Eternal Candles</span>
              <span className="text-xs font-normal text-gray-500">(Top Donors)</span>
            </h4>
            <div className="grid grid-cols-9 gap-2">
              {Array.from({ length: 27 }).map((_, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2 + Math.random(), repeat: Infinity }}
                  className="aspect-square rounded bg-gradient-to-t from-orange-500/20 to-yellow-500/20 border border-yellow-500/30 flex items-end justify-center pb-1 relative group cursor-pointer"
                >
                  <Flame size={12} className="text-orange-400" />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10 pointer-events-none">
                    0.5 ETH
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl flex justify-between items-center">
            <div>
               <p className="text-xs text-gray-400">Total Donated</p>
               <p className="text-xl font-bold text-white">45.2 ETH</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Smart Contract</p>
              <p className="text-sm font-mono text-violet-400">0x89...2B9a</p>
            </div>
          </div>
          
          <button className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-violet-600/20">
            Light a Candle (Donate)
          </button>
        </div>
      </div>
    </div>
  );
};
