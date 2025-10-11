import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/emails': 'http://127.0.0.1:8000',
      '/auth': 'http://127.0.0.1:8000',
      '/health': 'http://127.0.0.1:8000',
      '/api': 'http://127.0.0.1:8000',
      // Google OAuth + Gmail summary (served by FastAPI)
      '/google': 'http://127.0.0.1:8000'
    }
  }
})
