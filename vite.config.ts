import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: { emptyOutDir: false },
  server: {
    port: 5173,
    fs: { deny: ['.env', '.env.*', '**/.env*', '**/.runtime/**', '**/course-content/**', '**/server/**', '**/prisma/**'] },
    proxy: { '/api': 'http://127.0.0.1:3001' },
  },
})
