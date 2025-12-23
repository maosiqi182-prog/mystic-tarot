import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 回归最简配置，把打包任务完全交给 Vercel 的默认设置
// 我们不再在打包层面做任何黑科技，只保留代理防止 AI 报错
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
  }
})