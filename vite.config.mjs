import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('apexcharts') || id.includes('recharts')) return 'vendor-charts';
            if (id.includes('framer-motion') || id.includes('lucide-react')) return 'vendor-ui';
            return 'vendor-utils';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
