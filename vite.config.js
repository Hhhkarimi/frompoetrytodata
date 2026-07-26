import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    sourcemap: false,
    cssCodeSplit: true,
    // ECharts is isolated in a lazy-loaded chunk; its gzip size is about 377 kB.
    chunkSizeWarningLimit: 1200,
  },
  server: {
    host: '0.0.0.0',
  },
});
