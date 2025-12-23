import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 恢复到最简配置，完全依赖 HandController.jsx 里的代码修复
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
  build: {
    commonjsOptions: {
      // 这是一个安全且必要的设置，用来处理旧版库
      transformMixedEsModules: true
    }
  }
})