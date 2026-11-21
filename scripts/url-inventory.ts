// Builds urls/inventory.json from the live chesamel.com: every address in the
// Yoast sitemap plus every internal link a crawl of those pages turns up.
//
//   npm run inventory   (takes about 8 minutes; the live site is slow)
//
// Re-running rewrites the inventory from the live site. Addresses that are new
// to the inventory are added to urls/pending.json so the parity check stays
// green; nothing is ever removed from the pending list here.
//
// Only HTML pages are inventoried. Media and WordPress internals (uploads,
// wp-json, feeds, query-string URLs) are skipped: media moves with the content
// importers, and the rest has no equivalent on the new site.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import type { InventoryEntry } from '../tests/url-parity/parity.ts';

const ORIGIN = 'https://chesamel.com';
const HOSTS = new Set(['chesamel.com', 'www.chesamel.com']);
const INVENTORY = new URL('../urls/inventory.json', import.meta.url);
const PENDING = new URL('../urls/pending.json', import.meta.url);
const CONCURRENCY = 8;
const MAX_REDIRECTS = 10;
const HEADERS = { 'user-agent': 'url-inventory-script' };

const SKIP_PATH =
  /^(\/ar)?\/(wp-content|wp-admin|wp-includes|wp-json|cdn-cgi)\/|\/xmlrpc\.php$|\/feed\/?$|\/wp-login\.php$/;
const FILE_EXTENSION = /\.(?!html?$)[a-z0-9]{2,5}$/i;

async function readJson<T>(file: URL, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}

async function text(url: string): Promise<string> {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  return res.text();
}

function locs(xml: string): string[] {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
}

// Turns any link into an inventory path, or null if it isn't one of ours.
function toPath(href: string, base: string): string | null {
  let url: URL;
  try {
    url = new URL(href.replace(/&amp;/g, '&'), base);
  } catch {
    return null;
  }
  if (!/^https?:$/.test(url.protocol) || !HOSTS.has(url.hostname)) return null;
  if (url.search) return null;
  const path = decodeURI(url.pathname);
  if (SKIP_PATH.test(path) || FILE_EXTENSION.test(path)) return null;
  return path;
}

type Visit =
  | { kind: 'page'; links: string[] }
  | { kind: 'redirect'; to: string }
  | { kind: 'skip'; reason: string };

async function visit(path: string): Promise<Visit> {
  let url = ORIGIN + encodeURI(path);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const res = await fetch(url, { headers: HEADERS, redirect: 'manual' });
    const location = res.headers.get('location');
    if (res.status >= 300 && res.status < 400 && location) {
      url = new URL(location, url).href;
      continue;
    }
    if (hop > 0) {
      // Point straight at the final destination so the new site never
      // rebuilds a redirect chain.
      const final = new URL(url);
      const to = HOSTS.has(final.hostname) ? decodeURI(final.pathname) + final.search : final.href;
      return to === path ? { kind: 'skip', reason: 'redirects to itself' } : { kind: 'redirect', to };
    }
    if (res.status !== 200) return { kind: 'skip', reason: `status ${res.status}` };
    if (!res.headers.get('content-type')?.includes('text/html')) {
      return { kind: 'skip', reason: 'not HTML' };
    }
    const html = await res.text();
    const links = [...html.matchAll(/href\s*=\s*["']([^"'#]+)/g)]
      .map((m) => toPath(m[1], url))
      .filter((p): p is string => p !== null);
    return { kind: 'page', links };
  }
  return { kind: 'skip', reason: 'too many redirects' };
}

async function main() {
  const sitemapPaths = new Set<string>(['/']);
  for (const sitemap of locs(await text(`${ORIGIN}/sitemap_index.xml`))) {
    for (const loc of locs(await text(sitemap))) {
      const path = toPath(loc, ORIGIN);
      if (path) sitemapPaths.add(path);
    }
  }

  const queue = [...sitemapPaths];
  const seen = new Set(queue);
  const entries: InventoryEntry[] = [];
  const skipped: string[] = [];

  async function worker() {
    for (let path = queue.shift(); path !== undefined; path = queue.shift()) {
      const source = sitemapPaths.has(path) ? 'sitemap' : 'crawl';
      const result = await visit(path);
      process.stderr.write(`\r${seen.size - queue.length}/${seen.size} addresses`);
      if (result.kind === 'skip') {
        skipped.push(`${path} (${source}): ${result.reason}`);
        continue;
      }
      if (result.kind === 'redirect') {
        entries.push({ path, expect: 'redirect', to: result.to, source });
        continue;
      }
      entries.push({ path, expect: 'page', source });
      for (const link of result.links) {
        if (!seen.has(link)) {
          seen.add(link);
          queue.push(link);
        }
      }
    }
  }
  // Workers share one queue; a worker can idle while others are still adding
  // links, so loop until a full pass finds the queue empty.
  while (queue.length) await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  entries.sort((a, b) => a.path.localeCompare(b.path));
  const previous = await readJson<InventoryEntry[]>(INVENTORY, []);
  const pending = await readJson<string[]>(PENDING, []);
  await mkdir(new URL('.', INVENTORY), { recursive: true });
  await writeFile(INVENTORY, JSON.stringify(entries, null, 2) + '\n');

  // Only addresses new to the inventory become pending: one already inventoried
  // and off the pending list has been migrated and must stay checked.
  // On the first run the new site already serves "/", so it starts off the list.
  const known = new Set([...previous.map((e) => e.path), ...pending]);
  const added = entries
    .map((e) => e.path)
    .filter((p) => !known.has(p) && !(previous.length === 0 && p === '/'));
  const nextPending = [...new Set([...pending, ...added])].sort((a, b) => a.localeCompare(b));
  await writeFile(PENDING, JSON.stringify(nextPending, null, 2) + '\n');

  const redirects = entries.filter((e) => e.expect === 'redirect').length;
  console.log(`${entries.length} addresses (${entries.length - redirects} pages, ${redirects} redirects)`);
  console.log(`${entries.filter((e) => e.source === 'crawl').length} found only by crawling`);
  console.log(`${added.length} added to pending (${nextPending.length} pending in total)`);
  if (skipped.length) console.log(`\nSkipped:\n${skipped.sort().join('\n')}`);
}

await main();
