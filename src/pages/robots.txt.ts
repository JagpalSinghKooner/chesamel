// robots.txt, built with the site (#54): every crawler may read every page,
// with the AI crawlers named so their welcome is explicit, and the sitemap
// listed. Previews on *.pages.dev are kept out of search by public/_headers.
import type { APIRoute } from 'astro';

const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
];

export const GET: APIRoute = ({ site }) => {
  const groups = ['*', ...AI_CRAWLERS].map((agent) => `User-agent: ${agent}\nAllow: /`);
  const body = [...groups, `Sitemap: ${new URL('/sitemap-index.xml', site)}`].join('\n\n');
  return new Response(`${body}\n`, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
