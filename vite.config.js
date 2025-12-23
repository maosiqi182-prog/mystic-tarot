import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // 允许局域网访问
    proxy: {
      '/deepseek': {
        target: 'https://api.deepseek.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/deepseek/, '')
      }
    }
  },
  // 🔥 新增：专门解决 MediaPipe 打包报错的问题
  build: {
    commonjsOptions: {
      include: [/node_modules/], // 强制转换 CJS 模块
      transformMixedEsModules: true
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // 把重型库单独打包，防止主文件太大导致黑屏
          mediapipe: ['@mediapipe/hands', '@mediapipe/camera_utils', '@mediapipe/drawing_utils'],
          three: ['three', '@react-three/fiber', '@react-three/drei']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['@mediapipe/hands', '@mediapipe/camera_utils', '@mediapipe/drawing_utils']
  }
})