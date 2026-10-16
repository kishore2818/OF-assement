import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/auth': 'http://localhost:4000',
      '/reconcile': 'http://localhost:4000',
      '/transactions': 'http://localhost:4000',
      '/settlements': 'http://localhost:4000',
      '/exceptions': 'http://localhost:4000',
      '/reconciliation-runs': 'http://localhost:4000',
      '/dashboard': 'http://localhost:4000',
      '/health': 'http://localhost:4000'
    }
  }
});
