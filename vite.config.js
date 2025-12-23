import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 恢复到最简配置，只保留 DeepSeek 代理
export default defineConfig({
  plugins: [react()],
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
  // 唯一需要保留的保险措施：允许混合模块转换 (解决 MediaPipe 兼容性)
  build: {
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
})