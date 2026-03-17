import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      crypto: 'node:crypto', // force Node’s built-in
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      platform: 'node', // avoid pulling browser shims in optimizer
    },
  },
  server: {
    proxy: {
      // Proxy Firebase Storage requests to bypass CORS in development
      '/firebase-storage': {
        target: 'https://firebasestorage.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/firebase-storage/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            // Forward all query parameters
            console.log('Proxying to:', options.target + req.url);
          });
        },
      },
    },
  },
});
