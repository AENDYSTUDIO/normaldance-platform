import React from 'react';
import { Coins, Lock, TrendingUp } from 'lucide-react';

import { MOCK_STAKING } from '../services/mockData';

export const Staking: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="text-center py-8">
        <h2 className="text-4xl font-display font-bold text-white mb-2">Stake $NDT Token</h2>
        <p className="text-gray-400">Earn passive income while supporting the music ecosystem.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="glass-panel p-6 rounded-2xl text-center">
            <p className="text-gray-400 text-sm mb-1">Total Value Locked</p>
            <p className="text-3xl font-bold text-white">$4,250,920</p>
         </div>
         <div className="glass-panel p-6 rounded-2xl text-center border border-violet-500/30 bg-violet-500/5">
            <p className="text-violet-300 text-sm mb-1">Current APY</p>
            <p className="text-3xl font-bold text-violet-400">18.5%</p>
         </div>
         <div className="glass-panel p-6 rounded-2xl text-center">
            <p className="text-gray-400 text-sm mb-1">Your Rewards</p>
            <p className="text-3xl font-bold text-white">450 NDT</p>
         </div>
      </div>

      <div className="glass-panel p-8 rounded-2xl">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <h3 className="text-xl font-bold text-white">Stake Assets</h3>
            
            <div className="bg-black/20 p-4 rounded-xl border border-white/5">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Amount</span>
                <span>Balance: 12,500 NDT</span>
              </div>
              <div className="flex items-center space-x-4">
                <input 
                  type="number" 
                  placeholder="0.00" 
                  className="bg-transparent text-2xl font-bold text-white focus:outline-none w-full"
                />
                <button className="px-3 py-1 bg-violet-500/20 text-violet-400 text-xs rounded-md hover:bg-violet-500/30">MAX</button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm text-gray-400">Lock Duration</label>
              <div className="grid grid-cols-4 gap-2">
                 {['30D', '90D', '180D', '365D'].map(d => (
                   <button key={d} className="py-2 rounded-lg border border-white/10 hover:bg-violet-600 hover:border-violet-600 hover:text-white text-gray-400 text-sm transition focus:bg-violet-600 focus:text-white">
                     {d}
                   </button>
                 ))}
              </div>
            </div>

            <button className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition">
              Approve & Stake
            </button>
          </div>

          <div className="w-full md:w-1/3 bg-white/5 rounded-xl p-6">
             <h4 className="text-white font-bold mb-4">Your Positions</h4>
             {MOCK_STAKING.map(pos => (
               <div key={pos.id} className="mb-4 pb-4 border-b border-white/5 last:border-0 last:pb-0 last:mb-0">
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-white font-bold">{pos.amount.toLocaleString()} NDT</span>
                   <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Active</span>
                 </div>
                 <div className="flex items-center text-xs text-gray-400 space-x-4">
                   <span className="flex items-center"><TrendingUp size={12} className="mr-1"/> {pos.apy}% APY</span>
                   <span className="flex items-center"><Lock size={12} className="mr-1"/> {pos.lockedUntil}</span>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};
