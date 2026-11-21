// Copies live chesamel.com media into the repo at the same path, so old media
// addresses keep working and Chesamel owns every file before cutover.

import { mkdir, stat, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { Wxr } from './wxr.ts';

// Cloudflare Pages refuses any single file over 25 MiB, so larger files are
// kept in the repo but outside public/.
export const MAX_SERVED_BYTES = 25 * 1024 * 1024;
const SERVED = 'public';
const OVERSIZED = 'media-oversized';
const CONCURRENCY = 6;

export function attachmentUrls(wxr: Wxr): string[] {
  return wxr.items.filter((i) => i.type === 'attachment' && i.attachmentUrl).map((i) => i.attachmentUrl);
}

const exists = (path: string) => stat(path).then(() => true, () => false);

const localPaths = (url: string) => {
  const path = decodeURIComponent(new URL(url).pathname);
  return { served: `${SERVED}${path}`, oversized: `${OVERSIZED}${path}` };
};

const inRepo = async (url: string) => {
  const { served, oversized } = localPaths(url);
  return (await exists(served)) || (await exists(oversized));
};

// URLs with no copy in the repo, which pages therefore can't show.
export async function notInRepo(urls: string[]): Promise<Set<string>> {
  const missing = new Set<string>();
  for (const url of new Set(urls)) if (!(await inRepo(url))) missing.add(url);
  return missing;
}

// Downloads each URL unless a copy is already in the repo. Returns the URLs
// that failed, with the reason, so a re-run can pick them up.
export async function downloadMedia(urls: string[]): Promise<string[]> {
  const queue = [...new Set(urls)];
  const failures: string[] = [];
  let done = 0;

  async function worker() {
    for (let url = queue.shift(); url; url = queue.shift()) {
      if (await inRepo(url)) continue;
      const { served, oversized } = localPaths(url);
      try {
        const res = await fetch(url, { headers: { 'user-agent': 'chesamel-importer' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const bytes = new Uint8Array(await res.arrayBuffer());
        const target = bytes.byteLength > MAX_SERVED_BYTES ? oversized : served;
        await mkdir(dirname(target), { recursive: true });
        await writeFile(target, bytes);
        if (++done % 50 === 0) console.log(`  downloaded ${done}`);
      } catch (err) {
        failures.push(`${url}: ${(err as Error).message}`);
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  return failures;
}
