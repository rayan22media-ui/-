// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const module = id.toString().split('node_modules/')[1].split('/')[0].toString();
            // Group firebase modules together
            if (module.startsWith('firebase')) {
                return 'firebase';
            }
            return module;
          }
        }
      }
    }
  },
});
