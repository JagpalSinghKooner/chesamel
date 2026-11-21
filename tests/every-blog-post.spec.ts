// Every Blog Post, not just the samples in pages.ts: migrated and future posts
// alike must be accessible and show no broken images.
import { readdirSync } from 'node:fs';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const WCAG_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const addresses = readdirSync(new URL('../src/content/blog/', import.meta.url), { recursive: true, encoding: 'utf8' })
  .filter((f) => f.endsWith('.md'))
  .map((f) => `/${f.replace(/\.md$/, '')}/`);

test.describe.configure({ mode: 'parallel' });

for (const address of addresses) {
  test(`${address} is accessible and its images load`, async ({ page, request }) => {
    // Only the DOM is needed: images are fetched directly below, and waiting for
    // the full load would tie the test to YouTube's servers on embed posts.
    expect((await page.goto(address, { waitUntil: 'domcontentloaded' }))?.status()).toBe(200);

    const sources = await page.locator('main img').evaluateAll((imgs) => imgs.map((i) => i.getAttribute('src')!));
    const broken: string[] = [];
    for (const src of sources.filter((s) => s.startsWith('/'))) {
      if ((await request.head(src)).status() !== 200) broken.push(src);
    }
    expect(broken).toEqual([]);

    // Embedded players are YouTube's markup, outside the site's control.
    const results = await new AxeBuilder({ page }).withTags(WCAG_AA).exclude('iframe').analyze();
    expect(results.violations).toEqual([]);
  });
}
