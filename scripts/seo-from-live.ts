// Copies the <title> and meta description live chesamel.com renders for each
// page into this repo, so search rankings survive the move (#54).
//
//   npm run seo:live   (one request at a time; about 10 minutes)
//
// Every page address in urls/inventory.json (after urls/decisions.json) is
// fetched in turn. A page with a content file gets `seoTitle` and
// `seoDescription` in its frontmatter; a page without one (the homepage, the
// listings) gets an entry in src/data/page-seo.json. Content Editors edit them
// there afterwards (#15). Where live has no meta description, none is written
// and the page falls back to its own summary (src/lib/seo.ts). The older
// `description` field, the raw Yoast value, is removed.
//
// It also prints how many pages share each og:image, which shows live's
// default share image (src/data/seo.ts).

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { setTimeout as pause } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { decodeEntities } from './import-wordpress/wxr.ts';
import { applyDecisions, type InventoryEntry, type Decision } from '../tests/url-parity/parity.ts';

const ORIGIN = 'https://chesamel.com';
const HEADERS = { 'user-agent': 'chesamel-seo-script' };
const PAUSE_MS = 500;
const CONTENT = new URL('../src/content/', import.meta.url);
const PAGE_SEO = new URL('../src/data/page-seo.json', import.meta.url);

// Where each collection's files are served: <prefix>/<file path>/.
const COLLECTION_PREFIXES: Record<string, string> = {
  blog: '',
  pages: '',
  'case-studies': '/case-studies',
  industries: '/industries',
  podcasts: '/podcasts',
  webinars: '/webinars',
  reports: '/reports',
  pillars: '/services',
  services: '/services',
};

interface LiveHead {
  title?: string;
  description?: string;
  ogImage?: string;
}

const readJson = <T>(path: string): T => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));

function pageAddresses(): string[] {
  const inventory = readJson<InventoryEntry[]>('../urls/inventory.json');
  const decisions = readJson<Decision[]>('../urls/decisions.json');
  return applyDecisions(inventory, decisions)
    .filter((entry) => entry.expect === 'page')
    .map((entry) => entry.path);
}

// Every content file, by the address it is served at.
export function contentFiles(): Map<string, URL> {
  const files = new Map<string, URL>();
  for (const [collection, prefix] of Object.entries(COLLECTION_PREFIXES)) {
    const dir = new URL(`${collection}/`, CONTENT);
    for (const file of readdirSync(dir, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.md'))) {
      files.set(`${prefix}/${file.replace(/\.md$/, '')}/`, new URL(file, dir));
    }
  }
  return files;
}

const clean = (text: string) => decodeEntities(text).replace(/\s+/g, ' ').trim() || undefined;

function attributes(tag: string): Record<string, string> {
  const found: Record<string, string> = {};
  for (const [, name, , double, single] of tag.matchAll(/([\w:-]+)\s*=\s*("([^"]*)"|'([^']*)')/g)) {
    found[name.toLowerCase()] = double ?? single;
  }
  return found;
}

export function readHead(html: string): LiveHead {
  const end = html.search(/<\/head>/i);
  const head = end === -1 ? html : html.slice(0, end);
  const metas = [...head.matchAll(/<meta\b[^>]*>/gi)].map(([tag]) => attributes(tag));
  const content = (match: (meta: Record<string, string>) => boolean) => {
    const value = metas.find(match)?.content;
    return value === undefined ? undefined : clean(value);
  };
  const title = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  return {
    title: title === undefined ? undefined : clean(title),
    description: content((m) => m.name?.toLowerCase() === 'description'),
    ogImage: content((m) => m.property === 'og:image'),
  };
}

// Live's head for one address; empty when live doesn't serve it as a page
// (such as the posts that redirect to their own image, urls/decisions.json).
async function fetchHead(path: string): Promise<LiveHead> {
  const res = await fetch(ORIGIN + encodeURI(path), { headers: HEADERS, redirect: 'manual' });
  if (res.status !== 200) {
    console.warn(`${path}: live answered ${res.status}`);
    return {};
  }
  return readHead(await res.text());
}

// Replaces the frontmatter's SEO lines with live's values. Each is one line,
// a JSON string, which YAML reads as a double-quoted string.
export function withSeo(markdown: string, seo: LiveHead): string {
  const end = markdown.indexOf('\n---', 3);
  const lines = markdown
    .slice(0, end)
    .split('\n')
    .filter((line) => !/^(description|seoTitle|seoDescription):/.test(line));
  if (seo.title) lines.push(`seoTitle: ${JSON.stringify(seo.title)}`);
  if (seo.description) lines.push(`seoDescription: ${JSON.stringify(seo.description)}`);
  return lines.join('\n') + markdown.slice(end);
}

async function main() {
  const files = contentFiles();
  const pageSeo: Record<string, { title?: string; description?: string }> = {};
  const ogImages = new Map<string, number>();
  const missing = { title: [] as string[], description: [] as string[] };

  for (const path of pageAddresses()) {
    const live = await fetchHead(path);
    await pause(PAUSE_MS);
    if (!live.title) missing.title.push(path);
    if (!live.description) missing.description.push(path);
    if (live.ogImage) ogImages.set(live.ogImage, (ogImages.get(live.ogImage) ?? 0) + 1);

    const file = files.get(path);
    if (file) writeFileSync(file, withSeo(readFileSync(file, 'utf8'), live));
    else pageSeo[path] = { title: live.title, description: live.description };
  }

  writeFileSync(PAGE_SEO, JSON.stringify(pageSeo, null, 2) + '\n');

  console.log(`\nNo title on live (${missing.title.length}):`, missing.title);
  console.log(`No meta description on live (${missing.description.length}):`, missing.description);
  console.log('\nMost shared og:image:');
  for (const [src, count] of [...ogImages].sort((a, b) => b[1] - a[1]).slice(0, 5)) console.log(`  ${count}  ${src}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
