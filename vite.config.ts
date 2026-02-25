import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import viteImagemin from 'vite-plugin-imagemin';
import viteCompression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';
import { fileURLToPath, URL } from 'node:url';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    plugins: [
      vue(),
      tailwindcss(),
      // Gzip 压缩：仅生产环境启用
      viteCompression({
        verbose: true,
        disable: !isProduction,
        threshold: 10240,
        algorithm: 'gzip',
        ext: '.gz'
      }),
      // 图片优化：仅生产环境启用
      isProduction &&
        viteImagemin({
          gifsicle: { optimizationLevel: 7, interlaced: false },
          optipng: { optimizationLevel: 7 },
          mozjpeg: { quality: 20 },
          pngquant: { quality: [0.8, 0.9], speed: 4 },
          svgo: {
            plugins: [{ name: 'removeViewBox' }, { name: 'removeEmptyAttrs', active: false }]
          }
        }),
      // 构建分析：仅生产环境启用
      isProduction && visualizer({ open: false, gzipSize: true, brotliSize: true }),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: false // 开发模式下禁用 Service Worker，避免干扰开发体验
        },
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
              src: '/logo.svg',
              sizes: 'any',
              type: 'image/svg+xml'
            },
            {
              src: '/logo.svg',
              sizes: '192x192',
              type: 'image/svg+xml',
              purpose: 'any maskable'
            },
            {
              src: '/logo.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          // 导航回退黑名单：防止 Service Worker 拦截反向代理的路径
          navigateFallbackDenylist: [/^\/tools\/audio/],
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
    ].filter(Boolean),
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
              // 将核心框架组件 (Vue, Element Plus, Pinia) 合并在一个 chunk，确保初始化顺序稳定
              if (
                id.includes('vue') ||
                id.includes('element-plus') ||
                id.includes('pinia') ||
                id.includes('router') ||
                id.includes('@vue')
              ) {
                return 'vendor-core';
              }
              // 保持大型独立库的拆分
              if (id.includes('echarts')) {
                return 'vendor-echarts';
              }
              if (id.includes('pdfjs') || id.includes('jspdf')) {
                return 'vendor-pdf';
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
          drop_console: false, // 允许生产环境保留控制台日志（如欢迎信息）
          drop_debugger: true // 生产环境移除 debugger
        },
        mangle: true // 开启变量混淆
      }
    },
    // 开发服务器配置
    server: {
      hmr: {
        overlay: false // 禁用 HMR 错误覆盖层
      }
    }
  };
});
