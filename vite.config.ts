import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import viteImagemin from 'vite-plugin-imagemin';
import viteCompression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';
import { fileURLToPath, URL } from 'node:url';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    // Gzip 压缩：生成 .gz 文件，当 nginx 配置 gzip_static on 时，直接使用压缩文件
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240, // 大于 10kb 的文件才压缩
      algorithm: 'gzip',
      ext: '.gz'
    }),
    // 原有的图片优化插件
    viteImagemin({
      gifsicle: { optimizationLevel: 7, interlaced: false },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 20 },
      pngquant: { quality: [0.8, 0.9], speed: 4 },
      svgo: {
        plugins: [{ name: 'removeViewBox' }, { name: 'removeEmptyAttrs', active: false }]
      }
    }),
    // 构建分析：生成 stats.html 文件，方便查看包体积
    visualizer({ open: false, gzipSize: true, brotliSize: true }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'LRM 工具箱',
        short_name: 'LRM Tools',
        description: '高效便捷的开发者工具集合',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'logo.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          },
          {
            src: '/icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    target: 'es2015',
    sourcemap: false, // 禁用 production source map，减小包体积
    chunkSizeWarningLimit: 2000, // 调大 chunk 大小警告限制 (2MB)

    // 代码分包策略：将大型依赖单独打包，避免 main.js 过大
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Vue 生态：vue, vue-router, pinia -> vendor-vue
            if (id.includes('vue') || id.includes('pinia') || id.includes('router')) {
              return 'vendor-vue';
            }
            // UI 组件库：element-plus -> vendor-ui
            if (id.includes('element-plus')) {
              return 'vendor-ui';
            }
            // 图表库：echarts -> vendor-echarts
            if (id.includes('echarts')) {
              return 'vendor-echarts';
            }
            // PDF 处理库：pdfjs, jspdf -> vendor-pdf
            if (id.includes('pdfjs') || id.includes('jspdf')) {
              return 'vendor-pdf';
            }
            // 其他工具库：lodash, dayjs, axios -> vendor-utils
            if (id.includes('lodash') || id.includes('dayjs') || id.includes('axios')) {
              return 'vendor-utils';
            }
          }
        },
        // 静态资源分类打包
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    },
    // 压缩混淆配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 生产环境移除 console.log
        drop_debugger: true // 生产环境移除 debugger
      },
      mangle: true // 开启变量混淆
    }
  }
});
