import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    proxy: {
      // 保留 DeepSeek 代理，这对 AI 功能很重要
      '/deepseek': {
        target: 'https://api.deepseek.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/deepseek/, '')
      }
    }
  },
  build: {
    // 只保留这一行，这是解决 MediaPipe 报错的唯一必要配置
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
})