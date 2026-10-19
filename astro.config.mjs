import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://alexandrecarton.netlify.app',
  trailingSlash: 'always',
  build: { format: 'directory' },
  // Anciennes URLs Hugo conservées
  redirects: {
    '/milk_ml': '/blog/milk_ml/',
    '/blog/page/1': '/blog/',
  },
});
