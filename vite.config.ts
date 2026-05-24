import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

// === Configuration ===
const SCRIPT_NAME = 'Better Feedly';
const NAMESPACE = 'https://github.com/ilyachch';
const MATCH_URLS = ['*://*/*'];
const ICON_URL = 'https://www.google.com/s2/favicons?sz=64&domain=feedly.com';
// =====================

export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.ts',
      build: {
        fileName: 'better-feedly.user.js',
      },
      userscript: {
        name: SCRIPT_NAME,
        namespace: NAMESPACE,
        match: MATCH_URLS,
        icon: ICON_URL,
        description: 'Tampermonkey app',
        author: 'ilyachch',
        grant: ['GM_addStyle'],
        license: 'MIT',
        homepageURL: 'https://github.com/ilyachch-userscripts/better-feedly',
        supportURL: 'https://github.com/ilyachch-userscripts/better-feedly/issues',
        updateURL: 'https://github.com/ilyachch-userscripts/better-feedly/releases/latest/download/better-feedly.user.js',
        downloadURL: 'https://github.com/ilyachch-userscripts/better-feedly/releases/latest/download/better-feedly.user.js',
        'run-at': 'document-end',
      }
    }),
  ],
});
