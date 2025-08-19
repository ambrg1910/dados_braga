import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // This is critical - binds to all network interfaces
    port: 3000,       // Match the exposed port in docker-compose
    strictPort: true, // Fail if port is already in use
  },
  // Ensure proper handling of assets
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});