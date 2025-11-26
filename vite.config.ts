import { defineConfig, loadEnv } from 'vite' // 把 loadEnv 导入提到顶部
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Pages from 'vite-plugin-pages'

// 关键：defineConfig 接收一个回调函数，参数包含 mode、command 等
export default defineConfig(({ mode }) => {
  // 现在 mode 是定义好的，可以正常使用
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue(), tailwindcss(), AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
      dirs: ['src/composables'],
    }),
    Pages({
      extensions: ['vue'],
      dirs: 'src/pages',
      importMode: 'async',
    })],
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    base: '/',
    build: {
      outDir: 'dist',
    },
    server: {
      host: '0.0.0.0',
      port: 8080,
      proxy: {
        [env.VITE_PREFIX_URL]: { // 请求代理
          target: env.VITE_BASE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp(`^${env.VITE_PREFIX_URL}`), ''),
        },
      }
    }
  }
})