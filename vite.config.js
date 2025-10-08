// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Environment variables are now accessed via `import.meta.env` in the client code.
  // Vite handles this automatically for variables prefixed with `VITE_`.
  // The `define` block for `process.env` is no longer needed.
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