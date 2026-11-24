// URL parity: every address the old chesamel.com served still works.
// Runs against the local production build, or a Preview when BASE_URL is set.
// Addresses not migrated yet go in urls/pending.json, which is data only.
// Where the Project Manager chose to change what an address does, the choice
// is in urls/decisions.json and overrides the live inventory.

import { readFileSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import { applyDecisions, judge, type Decision, type InventoryEntry } from './parity';

const read = <T>(file: string): T =>
  JSON.parse(readFileSync(new URL(`../../urls/${file}`, import.meta.url), 'utf8'));

const inventory = applyDecisions(read<InventoryEntry[]>('inventory.json'), read<Decision[]>('decisions.json'));
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

// The spec: old addresses for the dead country links go to the contact page.
test('dead country addresses redirect to the contact page', async ({ request }) => {
  for (const country of ['france', 'spain', 'netherlands', 'bulgaria', 'turkey', 'uae', 'japan']) {
    const res = await request.get(`/${country}/`, { maxRedirects: 0 });
    expect(`${country}: ${res.status()} ${res.headers()['location']}`).toMatch(new RegExp(`^${country}: 301 (https://[^/]+)?/contact/$`));
  }
});

test('every inventoried address resolves as the old site promised', async ({ request }) => {
  test.setTimeout(5 * 60_000);
  const isPending = new Set(pending);
  const failures: string[] = [];
  const queue = [...inventory];

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
