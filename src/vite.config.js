import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // Guarantees assets are requested from the root URL
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true, // Enables error tracing in the live browser console
  }
});
