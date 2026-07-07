import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  // Enable HTTPS so camera (getUserMedia) and geolocation work on LAN/phone
  plugins: [react(), tailwindcss(), basicSsl()],
  server: {
    host: true,
    https: true,
    proxy: {
      '/api': {
        target: 'https://fasal-drishti-hekr.onrender.com',
        changeOrigin: true,
        secure: false,
        timeout: 10000,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            console.warn('[Proxy Error]', err.message, req.url);
          });
        }
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'map-vendor': ['leaflet', 'react-leaflet'],
          'firebase-vendor': ['firebase'],
          'lucide': ['lucide-react'],
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react'],
    exclude: ['@tensorflow/tfjs', '@tensorflow-models/coco-ssd']
  }
})
