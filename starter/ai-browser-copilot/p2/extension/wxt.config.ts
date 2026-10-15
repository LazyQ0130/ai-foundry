import { defineConfig } from 'wxt';
import { resolve } from 'node:path';

export default defineConfig({
  root: resolve(import.meta.dirname, '..'),
  srcDir: resolve(import.meta.dirname),
  outDir: resolve(import.meta.dirname, '../.output'),
  manifestVersion: 3,
  modules: ['@wxt-dev/module-react'],
  webExt: { disabled: true },
  dev: { server: { host: '127.0.0.1', origin: 'http://127.0.0.1:3080', port: 3080, strictPort: true } },
  // Keep this standalone CSS project independent of a parent repository's PostCSS.
  vite: () => ({ css: { postcss: { plugins: [] } } }),
  manifest: ({ mode }) => ({
    name: `AI 网页阅读与知识整理助手 · P2${mode === 'development' ? ' · 开发' : ''}`,
    version: '0.2.0',
    minimum_chrome_version: '116',
    permissions: ['sidePanel', 'activeTab', 'scripting', 'storage'],
    action: { default_title: '打开 P2 阅读助手侧栏' },
    ...(mode === 'production' ? {
      content_security_policy: {
        extension_pages: "script-src 'self'; object-src 'self'; connect-src 'none'",
      },
    } : {}),
  }),
});
