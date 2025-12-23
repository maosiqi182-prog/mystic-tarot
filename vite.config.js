import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 🔥 核心修复：强制指定 MediaPipe 的浏览器版本入口文件
      // 这能防止打包工具引用到错误的 Node.js 版本文件
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
    // 保持最稳妥的打包设置
    commonjsOptions: {
      include: [/node_modules/, /@mediapipe\/hands/],
      transformMixedEsModules: true
    }
  }
})