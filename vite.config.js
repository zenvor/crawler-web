import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  resolve: {
    alias: {
      '@': '/src',
    },
  },

  server: {
    host: '0.0.0.0',
  },

  plugins: [
    vue(),

    // Gzip 压缩
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240, // 大于 10KB 的文件才压缩
      algorithm: 'gzip',
      ext: '.gz',
    }),

    // 打包分析（只在需要时启用）
    visualizer({
      open: false, // 构建完成后自动打开报告
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
    }),
  ],

  build: {
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          // 将 Vue 核心库单独打包
          'vue-vendor': ['vue'],
          // 将 PrimeVue 组件库单独打包
          'primevue-vendor': ['primevue'],
          // 将工具库单独打包
          'utils': ['lodash', 'axios'],
        },
        // 自定义 chunk 文件名
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]',
      },
    },

    // 压缩选项
    minify: 'terser',
    terserOptions: {
      compress: {
        // 生产环境移除 console
        drop_console: true,
        drop_debugger: true,
      },
    },

    // 静态资源处理
    assetsInlineLimit: 4096, // 小于 4KB 的资源内联为 base64
    chunkSizeWarningLimit: 500, // chunk 大小警告阈值（KB）

    // 启用 CSS 代码分割
    cssCodeSplit: true,

    // 生成 sourcemap（生产环境建议关闭）
    sourcemap: false,
  },

  css: {
    preprocessorOptions: {},
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
})
