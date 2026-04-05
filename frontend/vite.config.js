import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    // Silence the chunk size warning — Spline runtime is inherently large
    chunkSizeWarningLimit: 2200,

    rollupOptions: {
      output: {
        manualChunks: {
          // React core — tiny, cached long-term
          'react-vendor': ['react', 'react-dom'],

          // Framer Motion — medium, changes rarely
          'framer': ['framer-motion'],

          // Spline runtime — very large, isolated so it doesn't bust other caches
          'spline': ['@splinetool/react-spline', '@splinetool/runtime'],
        },
      },
    },
  },
})
