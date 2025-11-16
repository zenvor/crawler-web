import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    host: '0.0.0.0',
    proxy: {
      // 设置跨域代理
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // 不需要移除 /api 前缀，因为新版 API 路径包含 /api
      },
    },
  },
  plugins: [vue()],
  css: {
    preprocessorOptions: {},
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
})
