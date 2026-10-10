import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages hosts this project under /Nagi-Studio/, not the domain root.
export default defineConfig({
  base: '/Nagi-Studio/',
  plugins: [react()],
});
