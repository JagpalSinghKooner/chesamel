// @ts-check
import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { isNoindex } from './src/noindex.mjs';

export default defineConfig({
  site: 'https://chesamel.com',
  integrations: [
    sitemap({
      filter: (page) => !isNoindex(new URL(page).pathname),
    }),
  ],
  env: {
    schema: {
      // Cloudflare Web Analytics (#12). Set in the Cloudflare Pages project's
      // environment variables; when unset, no beacon is rendered.
      CLOUDFLARE_WEB_ANALYTICS_TOKEN: envField.string({ context: 'server', access: 'public', optional: true }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
