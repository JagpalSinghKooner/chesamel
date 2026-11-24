// Project Manager decisions (urls/decisions.json) override what the live site
// did, and must name an address the inventory actually has.
import { test, expect } from '@playwright/test';
import { applyDecisions, type Decision, type InventoryEntry } from './parity';

const inventory: InventoryEntry[] = [
  { path: '/work/', expect: 'redirect', to: '/workforce-planning-model-empower-employees/', source: 'crawl' },
  { path: '/ar/growth-with-a-backbone/', expect: 'page', source: 'sitemap' },
  { path: '/about-us/', expect: 'page', source: 'sitemap' },
];

test('a decision replaces what the live site did for that address', () => {
  const decisions: Decision[] = [
    { path: '/work/', expect: 'redirect', to: '/insights/our-work/', why: 'WordPress guessed a Blog Post' },
    { path: '/ar/growth-with-a-backbone/', expect: 'redirect', to: '/growth-with-a-backbone/', why: 'English copy' },
  ];
  expect(applyDecisions(inventory, decisions)).toEqual([
    { path: '/work/', expect: 'redirect', to: '/insights/our-work/', source: 'crawl' },
    { path: '/ar/growth-with-a-backbone/', expect: 'redirect', to: '/growth-with-a-backbone/', source: 'sitemap' },
    { path: '/about-us/', expect: 'page', source: 'sitemap' },
  ]);
});

test('a decision can turn a live redirect back into a page', () => {
  const decisions: Decision[] = [{ path: '/work/', expect: 'page', why: 'serve it' }];
  expect(applyDecisions(inventory, decisions)[0]).toEqual({ path: '/work/', expect: 'page', source: 'crawl' });
});

test('a decision for an address that was never inventoried is refused', () => {
  const decisions: Decision[] = [{ path: '/typo/', expect: 'page', why: 'oops' }];
  expect(() => applyDecisions(inventory, decisions)).toThrow('/typo/ is not in urls/inventory.json');
});
