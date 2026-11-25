// Every Case Study and Industry page, not just the samples in pages.ts:
// migrated and future ones alike must be accessible and show no broken images.
import { readdirSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { revealAll } from './reveal-all';

const WCAG_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const addressesIn = (folder: string) =>
  readdirSync(new URL(`../src/content/${folder}/`, import.meta.url))
    .filter((f) => f.endsWith('.md'))
    .map((f) => `/${folder}/${f.replace(/\.md$/, '')}/`);

test.describe.configure({ mode: 'parallel' });

for (const address of [...addressesIn('case-studies'), ...addressesIn('industries')]) {
  test(`${address} is accessible and its images load`, async ({ page, request }) => {
    expect((await page.goto(address, { waitUntil: 'domcontentloaded' }))?.status()).toBe(200);

    const sources = await page.locator('main img').evaluateAll((imgs) => imgs.map((i) => i.getAttribute('src')!));
    const broken: string[] = [];
    for (const src of new Set(sources.filter((s) => s.startsWith('/')))) {
      if ((await request.head(src)).status() !== 200) broken.push(src);
    }
    expect(broken).toEqual([]);

    await revealAll(page);

    const results = await new AxeBuilder({ page }).withTags(WCAG_AA).analyze();
    expect(results.violations).toEqual([]);
  });
}
