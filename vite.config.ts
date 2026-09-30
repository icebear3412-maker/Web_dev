import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  resolve: {
    tsconfigPaths: true,
  },

  server: {
    proxy: {
      '/movies': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },

      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
