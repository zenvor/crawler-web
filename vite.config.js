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
        target: 'http://localhost:8000',
        // target: 'http://47.108.179.251:8000',
        // target: 'http://192.168.43.197:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
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
