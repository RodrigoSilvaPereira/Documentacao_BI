import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  plugins: [tailwindcss(), react()],

  resolve: {
    alias: {
      '@':            path.resolve(__dirname, './src'),
      '@components':  path.resolve(__dirname, './src/components'),
      '@pages':       path.resolve(__dirname, './src/pages'),
      '@models':      path.resolve(__dirname, './src/models'),
      '@services':    path.resolve(__dirname, './src/services'),
      '@store':       path.resolve(__dirname, './src/store'),
      '@hooks':       path.resolve(__dirname, './src/hooks'),
      '@utils':       path.resolve(__dirname, './src/utils'),
      '@generators':  path.resolve(__dirname, './src/generators'),
    },
  },

  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host ? { protocol: 'ws', host, port: 1421 } : undefined,
    watch: { ignored: ['**/src-tauri/**'] },
  },
  envPrefix: ['VITE_', 'TAURI_'],
});