import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // GitHub Pages serves this repo at https://aakashpate.github.io/PokiChat/
  // Local dev keeps the default "/" base so http://localhost:5173 keeps working.
  base: mode === 'production' ? '/PokiChat/' : '/',
  server: {
    port: 5173,
    strictPort: false,
  },
  preview: {
    port: 4173,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
}));
