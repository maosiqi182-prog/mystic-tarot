import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

// 🔥 修复关键：用新语法定义 __dirname，防止 Vercel 报错
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 强制指向浏览器版文件
      '@mediapipe/hands': path.resolve(__dirname, 'node_modules/@mediapipe/hands/hands.js'),
    }
  },
  server: {
    host: true,
    proxy: {
      '/deepseek': {
        target: 'https://api.deepseek.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/deepseek/, '')
      }
    }
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/, /@mediapipe\/hands/],
      transformMixedEsModules: true
    }
  }
})