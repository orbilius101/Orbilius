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
});
