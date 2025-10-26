import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    host: '0.0.0.0',
    open: 'google-chrome',
    cors: true,
    strictPort: false, // 允许端口被占用时自动切换到下一个可用端口
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
