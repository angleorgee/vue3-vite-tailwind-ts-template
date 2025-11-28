import { defineConfig, loadEnv } from 'vite' // 把 loadEnv 导入提到顶部
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Pages from 'vite-plugin-pages'
import Icon from '@varlet/unplugin-icon-builder/vite'
import { VarletImportResolver } from '@varlet/import-resolver'


export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue(), tailwindcss(), AutoImport({
      resolvers: [VarletImportResolver({ importStyle: false })],
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts',
      dirs: ['src/composables'],
    }),
    Pages({
      extensions: ['vue'],
      dirs: 'src/pages',
      importMode: 'async',
    }),
    Components({
      resolvers: [VarletImportResolver()],
      dirs: ['src/components'],
      extensions: ['vue'],
      dts: 'src/components.d.ts',
    }), Icon()],
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
    },
  }
})