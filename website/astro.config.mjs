import { defineConfig } from 'astro/config';
import pagesPaths from '../tools/pages-paths.mjs';
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'http://127.0.0.1:4173',
  base: process.env.PUBLIC_BASE_PATH || '/',
  integrations: [pagesPaths()],
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
  vite: { server: { host: '127.0.0.1' } }
});
