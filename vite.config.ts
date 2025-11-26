import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              vendor_react: ['react', 'react-dom', 'react-router-dom'],
              vendor_motion: ['framer-motion'],
              vendor_charts: ['recharts'],
              vendor_icons: ['lucide-react'],
              vendor_state: ['zustand'],
              vendor_web3: ['ethers'],
              vendor_supabase: ['@supabase/supabase-js'],
              vendor_misc: ['react-helmet-async', 'ipfs-http-client']
            }
          }
        }
      }
    };
});
