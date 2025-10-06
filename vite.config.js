// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Vite replaces this with the actual value at build time.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  },
  build: {
    chunkSizeWarningLimit: 1500, // Increase the limit to 1500 kB
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        }
      }
    }
  },
});
