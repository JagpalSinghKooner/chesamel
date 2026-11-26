// What search engines, social cards and AI assistants read (#54): every page's
// title, description, canonical, Open Graph, Twitter card and JSON-LD; the
// copies of live's titles and descriptions; robots.txt and llms.txt.
import { readdirSync, readFileSync } from 'node:fs';
import { test, expect, type Page, type APIRequestContext } from '@playwright/test';
import { pages } from './pages';
import { contentFiles } from '../scripts/seo-from-live';
import pageSeo from '../src/data/page-seo.json' with { type: 'json' };

const SITE = 'https://chesamel.com';
const NOINDEX = ['/404', '/style-guide/'];

const blogAddresses = readdirSync(new URL('../src/content/blog/', import.meta.url), { recursive: true, encoding: 'utf8' })
  .filter((f) => f.endsWith('.md'))
  .map((f) => `/${f.replace(/\.md$/, '')}/`);

// The properties each JSON-LD type must carry. Google's required properties,
// plus the ones the ticket names.
const REQUIRED: Record<string, string[]> = {
  Organization: ['name', 'url', 'logo', 'sameAs', 'address'],
  WebSite: ['name', 'url', 'publisher'],
  WebPage: ['url', 'name', 'description', 'isPartOf'],
  BreadcrumbList: ['itemListElement'],
  BlogPosting: ['headline', 'description', 'datePublished', 'dateModified', 'publisher'],
  Article: ['headline', 'description', 'datePublished', 'dateModified', 'publisher'],
  JobPosting: ['title', 'description', 'datePosted', 'hiringOrganization'],
  PodcastEpisode: ['name', 'url', 'datePublished', 'partOfSeries'],
  VideoObject: ['name', 'description', 'thumbnailUrl', 'uploadDate', 'embedUrl'],
  Person: ['name', 'jobTitle', 'worksFor'],
  Service: ['name', 'description', 'provider'],
};

// The JSON-LD type a page must hold, beyond the ones every page has.
function mainType(path: string): string | undefined {
  if (blogAddresses.includes(path)) return 'BlogPosting';
  if (/^\/(case-studies|reports)\/[^/]+\/$/.test(path)) return 'Article';
  if (/^\/careers\/[^/]+\/$/.test(path)) return 'JobPosting';
  if (/^\/podcasts\/[^/]+\/$/.test(path)) return 'PodcastEpisode';
  if (/^\/webinars\/[^/]+\/$/.test(path)) return 'VideoObject';
  if (path === '/who-we-are/our-team/') return 'Person';
  if (path.startsWith('/services/')) return 'Service';
}

const isInsight = (path: string) => blogAddresses.includes(path) || /^\/(case-studies|reports|podcasts|webinars)\/[^/]+\/$/.test(path);

type Node = Record<string, unknown> & { '@type': string };

// The head of a page's HTML, read by the browser's own parser.
async function headOf(page: Page, html: string) {
  return page.evaluate((html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const meta = (key: string) => doc.querySelector(`meta[name="${key}"], meta[property="${key}"]`)?.getAttribute('content') ?? null;
    return {
      title: doc.title,
      description: meta('description'),
      robots: meta('robots'),
      canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null,
      og: Object.fromEntries([...doc.querySelectorAll('meta[property^="og:"]')].map((m) => [m.getAttribute('property'), m.getAttribute('content')])),
      twitterCard: meta('twitter:card'),
      jsonLd: [...doc.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent ?? ''),
      breadcrumbSteps: doc.querySelectorAll('nav[aria-label="Breadcrumb"] [data-slot="breadcrumb-item"]').length,
    };
  }, html);
}

async function html(request: APIRequestContext, path: string) {
  const response = await request.get(path);
  expect(response.status(), path).toBe(200);
  return response.text();
}

async function sitemapPaths(request: APIRequestContext): Promise<string[]> {
  const locs = async (path: string) => [...(await html(request, path)).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  return (await Promise.all((await locs('/sitemap-index.xml')).map(locs))).flat();
}

test.describe.configure({ mode: 'parallel' });

for (const path of [...new Set([...pages, ...blogAddresses])]) {
  test(`${path} has its title, description, canonical, social tags and JSON-LD`, async ({ page, request }) => {
    const head = await headOf(page, await html(request, path));
    const url = SITE + path;

    expect(head.title).not.toBe('');
    expect(head.description).toBeTruthy();
    if (NOINDEX.includes(path)) {
      expect(head.robots).toContain('noindex');
      expect(head.canonical).toBeNull();
    } else {
      expect(head.robots).toBeNull();
      expect(head.canonical).toBe(url);
      expect(head.og['og:url']).toBe(url);
    }

    expect(head.og['og:title']).toBe(head.title);
    expect(head.og['og:description']).toBe(head.description);
    expect(head.og['og:site_name']).toBe('Chesamel');
    expect(head.og['og:type']).toBe(isInsight(path) ? 'article' : 'website');
    expect(head.twitterCard).toBe('summary_large_image');
    const image = new URL(head.og['og:image']!);
    expect(image.origin).toBe(SITE);
    expect((await request.head(image.pathname)).status(), image.pathname).toBe(200);

    expect(head.jsonLd).toHaveLength(1);
    const ld = JSON.parse(head.jsonLd[0]);
    expect(ld['@context']).toBe('https://schema.org');
    const nodes: Node[] = ld['@graph'];
    const types = nodes.map((n) => n['@type']);
    expect(types).toEqual(expect.arrayContaining(['Organization', 'WebSite', 'WebPage']));
    const type = mainType(path);
    if (type) expect(types).toContain(type);
    for (const node of nodes) {
      for (const property of REQUIRED[node['@type']] ?? []) expect(node[property], `${node['@type']}.${property}`).toBeTruthy();
    }
    if (types.includes('JobPosting')) {
      const job = nodes.find((n) => n['@type'] === 'JobPosting')!;
      expect(job.jobLocation ?? job.jobLocationType).toBeTruthy();
    }

    // The BreadcrumbList repeats the breadcrumb the page shows.
    const breadcrumb = nodes.find((n) => n['@type'] === 'BreadcrumbList');
    expect((breadcrumb?.itemListElement as unknown[] | undefined)?.length ?? 0).toBe(head.breadcrumbSteps);
  });
}

test('every page in the sitemap has a title and description of its own', async ({ page, request }) => {
  const paths = await sitemapPaths(request);
  const heads = await Promise.all(paths.map(async (path) => ({ path, ...(await headOf(page, await html(request, path))) })));
  const shared = (key: 'title' | 'description') => {
    const seen = new Map<string, string[]>();
    for (const head of heads) seen.set(head[key] ?? '', [...(seen.get(head[key] ?? '') ?? []), head.path]);
    return [...seen].filter(([value, paths]) => !value || paths.length > 1);
  };
  expect(shared('title')).toEqual([]);
  expect(shared('description')).toEqual([]);
  for (const head of heads) expect(head.canonical, head.path).toBe(SITE + head.path);
});

// Live's values sit in the content's frontmatter or src/data/page-seo.json.
test('every page shows the title and description copied from live', async ({ page, request }) => {
  const fromLive: [string, { title?: string; description?: string }][] = Object.entries(pageSeo);
  for (const [path, file] of contentFiles()) {
    const frontmatter = readFileSync(file, 'utf8');
    const field = (name: string) => frontmatter.match(new RegExp(`^${name}: (.*)$`, 'm'))?.[1];
    const [title, description] = [field('seoTitle'), field('seoDescription')].map((value) => value && JSON.parse(value));
    if (title || description) fromLive.push([path, { title, description }]);
  }
  expect(fromLive.length).toBeGreaterThan(300);

  for (const [path, live] of fromLive) {
    const head = await headOf(page, await html(request, path));
    if (live.title) expect(head.title, path).toBe(live.title);
    if (live.description) expect(head.description, path).toBe(live.description);
  }
});

test('robots.txt lets every crawler in, AI crawlers by name, and lists the sitemap', async ({ request }) => {
  const robots = await html(request, '/robots.txt');
  expect(robots).not.toMatch(/Disallow:\s*\S/);
  for (const agent of ['*', 'GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended']) {
    expect(robots).toContain(`User-agent: ${agent}\nAllow: /`);
  }
  expect(robots).toContain(`Sitemap: ${SITE}/sitemap-index.xml`);
});

test('llms.txt lists the key pages, each with a summary, by section', async ({ request }) => {
  const llms = await html(request, '/llms.txt');
  expect(llms).toMatch(/^# Chesamel\n\n> \S/);
  for (const section of ['Services', 'Insights', 'Case Studies', 'Company']) expect(llms).toContain(`\n## ${section}\n`);

  const links = [...llms.matchAll(/^- \[([^\]]+)\]\(([^)]+)\): (.+)$/gm)];
  expect(links.length).toBeGreaterThan(50);
  for (const [, , href] of links) {
    expect(href.startsWith(`${SITE}/`), href).toBe(true);
    expect((await request.get(new URL(href).pathname)).status(), href).toBe(200);
  }
  // Every list line is a link with its summary.
  expect(llms.split('\n').filter((line) => line.startsWith('- '))).toHaveLength(links.length);
});
