// @ts-check
import { defineConfig } from 'astro/config';
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
  vite: {
    plugins: [tailwindcss()],
  },
});
