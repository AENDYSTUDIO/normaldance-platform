import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Sparkles, Music, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

import { useAuthStore } from '../stores/useAuthStore';
import { SEO } from '../components/SEO';

export const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleLogin = () => {
    // Mock login - в будущем здесь будет реальная Web3 auth
    login({
      id: '1',
      username: 'CryptoDJ_99',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CryptoDJ_99&backgroundColor=1e1b4b'
    });
    navigate('/feed');
  };
  return (
    <div className="min-h-screen w-full bg-dark-900 flex items-center justify-center relative overflow-hidden font-sans text-white">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-900/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      <div className="relative z-10 max-w-md w-full px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-violet-500/30 rotate-6 border border-white/10">
            <Music size={48} className="text-white" />
          </div>
          <h1 className="text-5xl font-display font-bold mb-3 tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">NORMAL DANCE</h1>
          <p className="text-gray-400 text-lg font-light">The Future of Web3 Music</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="glass-panel p-8 rounded-3xl border-t border-white/10 backdrop-blur-2xl shadow-2xl ring-1 ring-white/5"
        >
          <div className="space-y-4">
            <button
              onClick={handleLogin}
              className="w-full py-4 px-6 bg-gradient-to-r from-white to-gray-100 text-black rounded-2xl font-bold text-lg hover:from-gray-100 hover:to-gray-200 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-between group shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
            >
              <div className="flex items-center space-x-3">
                <Wallet className="w-6 h-6" />
                <span>Connect Wallet</span>
              </div>
              <ArrowRight size={20} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
            </button>

            <button
              onClick={handleLogin}
              className="w-full py-4 px-6 bg-gradient-to-r from-[#229ED9]/10 to-[#229ED9]/5 border border-[#229ED9]/30 text-[#229ED9] rounded-2xl font-bold text-lg hover:from-[#229ED9]/20 hover:to-[#229ED9]/10 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-3"
            >
              <Sparkles className="w-6 h-6" />
              <span>Telegram Login</span>
            </button>
          </div>

          <div className="mt-8 text-center flex items-center justify-center space-x-4">
            <div className="h-px bg-white/10 w-12"></div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Secure Login</p>
            <div className="h-px bg-white/10 w-12"></div>
          </div>

          <div className="mt-6 flex justify-center space-x-4 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
            {/* Mock chain icons */}
            <div className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold transition-all duration-300 hover:scale-110">ETH</div>
            <div className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold transition-all duration-300 hover:scale-110">SOL</div>
            <div className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs font-bold transition-all duration-300 hover:scale-110">TON</div>
          </div>
        </motion.div>

        <p className="text-center text-xs text-gray-600 mt-8">
          By connecting, you agree to our <span className="underline cursor-pointer hover:text-gray-400">Terms</span> & <span className="underline cursor-pointer hover:text-gray-400">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
};