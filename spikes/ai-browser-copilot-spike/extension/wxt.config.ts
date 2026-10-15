import { defineConfig } from 'wxt';
import { resolve } from 'node:path';

export default defineConfig({
  root: resolve(import.meta.dirname),
  outDir: resolve(import.meta.dirname, '../.output'),
  modules: ['@wxt-dev/module-react'],
  vite: () => ({ css: { postcss: { plugins: [] } } }),
  manifest: {
    name: 'AI 网页阅读与知识整理助手 · Phase 0',
    version: '0.0.2',
    minimum_chrome_version: '116',
    permissions: ['activeTab', 'scripting', 'sidePanel', 'contextMenus', 'storage'],
    action: { default_title: '打开阅读验证侧栏' },
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self'; connect-src http://127.0.0.1:8787",
    },
  },
});
