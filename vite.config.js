import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      },
      '/api/lexteacher': {
        target: 'http://localhost:5002',
        changeOrigin: true
      },
      '/reportapi': {
        target: 'http://localhost:5003',
        changeOrigin: true
      }
    },
    fs: {
      allow: ['..'],
    },
  },
  plugins: [react()],
  resolve: {
    preserveSymlinks: true,
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
