import React from 'react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, CreditCard, History } from 'lucide-react';

import { MOCK_BALANCES } from '../services/mockData';

export const Wallet: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-end mb-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white">Wallet</h2>
          <p className="text-gray-400 mt-1">Manage your crypto assets and earnings.</p>
        </div>
        <button className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2 rounded-xl font-medium transition flex items-center space-x-2 mt-4 md:mt-0">
          <WalletIcon size={18} />
          <span>Connect Wallet</span>
        </button>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MOCK_BALANCES.map((balance) => (
          <div key={balance.symbol} className="glass-panel p-6 rounded-2xl relative overflow-hidden">
             {/* Background decoration */}
             <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-xl ${
               balance.network === 'Solana' ? 'bg-green-400' : 
               balance.network === 'Ethereum' ? 'bg-blue-400' : 'bg-blue-600'
             }`}></div>

             <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                   {balance.symbol === 'SOL' ? 'S' : balance.symbol === 'ETH' ? 'Ξ' : '💎'}
                </div>
                <div>
                  <h3 className="font-bold text-white">{balance.currency}</h3>
                  <span className="text-xs text-gray-400">{balance.network}</span>
                </div>
             </div>

             <div className="mt-4">
               <h4 className="text-2xl font-bold text-white font-display">
                 {balance.amount.toLocaleString()} {balance.symbol}
               </h4>
               <div className="flex items-center space-x-2 mt-1">
                 <span className="text-sm text-gray-400">${balance.usdValue.toLocaleString()}</span>
                 <span className={`text-xs px-1.5 py-0.5 rounded ${balance.change24h >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                   {balance.change24h > 0 ? '+' : ''}{balance.change24h}%
                 </span>
               </div>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Actions */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-2xl h-fit">
          <h3 className="font-bold text-white mb-6">Quick Actions</h3>
          <div className="space-y-3">
             <ActionBtn icon={ArrowUpRight} label="Send" sub="Transfer crypto to another wallet" />
             <ActionBtn icon={ArrowDownLeft} label="Receive" sub="View your wallet address" />
             <ActionBtn icon={CreditCard} label="Buy Crypto" sub="Purchase with credit card" />
          </div>
        </div>

        {/* Transactions */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
           <div className="flex items-center justify-between mb-6">
             <h3 className="font-bold text-white">Recent Transactions</h3>
             <button className="text-violet-400 text-sm hover:text-violet-300">View All</button>
           </div>
           
           <div className="space-y-4">
             {[1, 2, 3, 4].map((i) => (
               <div key={i} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
                      <History size={18} />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Minted NFT "Soundwave #45"</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-sm font-bold">-0.45 SOL</p>
                    <p className="text-xs text-gray-500">Completed</p>
                  </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

const ActionBtn = ({ icon: Icon, label, sub }: any) => (
  <button className="w-full flex items-center space-x-4 p-3 rounded-xl hover:bg-white/5 transition border border-transparent hover:border-white/10 text-left">
    <div className="w-10 h-10 rounded-full bg-violet-600/20 text-violet-400 flex items-center justify-center">
      <Icon size={20} />
    </div>
    <div>
      <p className="text-white font-medium text-sm">{label}</p>
      <p className="text-gray-500 text-xs">{sub}</p>
    </div>
  </button>
);
