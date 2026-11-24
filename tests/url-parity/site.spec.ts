// URL parity: every address the old chesamel.com served still works.
// Runs against the local production build, or a Preview when BASE_URL is set.
// Addresses not migrated yet go in urls/pending.json, which is data only.

import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import { judge, type InventoryEntry } from './parity';

const read = <T>(file: string): T =>
  JSON.parse(readFileSync(new URL(`../../urls/${file}`, import.meta.url), 'utf8'));

const inventory = read<InventoryEntry[]>('inventory.json');
const pending = read<string[]>('pending.json');
const CONCURRENCY = 10;

test('the pending list only names inventoried addresses', () => {
  const inventoried = new Set(inventory.map((e) => e.path));
  expect(pending.filter((p) => !inventoried.has(p))).toEqual([]);
  expect(pending.length).toBe(new Set(pending).size);
});

test('an unknown address returns 404', async ({ request }) => {
  const res = await request.get('/this-address-never-existed/', { maxRedirects: 0 });
  expect(res.status()).toBe(404);
});

test('every inventoried address resolves as the old site promised', async ({ request }) => {
  test.setTimeout(5 * 60_000);
  const isPending = new Set(pending);
  const failures: string[] = [];
  // The host, not the site, redirects /x to /x/; the local preview server
  // serves /x itself. So those redirects are checked only against a deployed
  // site (BASE_URL), which the "URL parity on Preview" check does.
  const hostSlashRedirect = (e: InventoryEntry) => e.expect === 'redirect' && e.to === `${e.path}/`;
  const queue = process.env.BASE_URL ? [...inventory] : inventory.filter((e) => !hostSlashRedirect(e));

  async function worker() {
    for (let entry = queue.shift(); entry; entry = queue.shift()) {
      const res = await request.get(encodeURI(entry.path), { maxRedirects: 0 });
      const problem = judge(
        entry,
        { status: res.status(), location: res.headers()['location'] ?? null },
        { pending: isPending.has(entry.path), url: res.url() },
      );
      if (problem) failures.push(`${entry.path}: ${problem}`);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  expect(failures.sort()).toEqual([]);
});
