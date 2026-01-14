import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // ✅ This catches /api, /api/admin, and /api/admin/login
      '/api': {
        target: 'http://100.91.191.47:8000', 
        changeOrigin: true,
        secure: false,
      },
    },
  },
})