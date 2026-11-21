import { test, expect } from '@playwright/test';
import { colourGroups } from '../src/design-system/colours';

const toRgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
};

test('style-guide page carries noindex', async ({ page }) => {
  await page.goto('/style-guide/');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});

test('public pages do not carry noindex', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
});

test('style-guide page is absent from the sitemap', async ({ request }) => {
  const index = await request.get('/sitemap-index.xml');
  expect(index.ok()).toBe(true);
  const sitemaps = [...(await index.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  expect(sitemaps.length).toBeGreaterThan(0);

  const paths: string[] = [];
  for (const sitemap of sitemaps) {
    const body = await (await request.get(sitemap)).text();
    paths.push(...[...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname));
  }

  expect(paths).toContain('/');
  expect(paths.filter((p) => p.startsWith('/style-guide'))).toEqual([]);
});

test('style-guide page renders every brand colour', async ({ page }) => {
  await page.goto('/style-guide/');
  for (const { colours } of colourGroups) {
    for (const { token, hex } of colours) {
      const item = page.locator(`[data-colour="${token}"]`);
      await expect(item).toContainText(hex);
      await expect(item.locator('[data-swatch]')).toHaveCSS('background-color', toRgb(hex));
    }
  }
});

test('style-guide page renders every type style in the brand fonts', async ({ page }) => {
  await page.goto('/style-guide/');
  const font = (style: string) =>
    page.locator(`[data-type-style="${style}"] p`).nth(1).evaluate((el) => getComputedStyle(el).fontFamily);

  for (const style of ['type-heading-1', 'type-heading-2', 'type-heading-3', 'type-body', 'type-tag', 'type-caption', 'type-large-grey']) {
    expect(await font(style)).toMatch(/^"Figtree Variable", Helvetica, Arial/);
  }
  expect(await font('type-subheading')).toMatch(/^"DM Sans Variable", Helvetica, Arial/);
  expect(await font('arabic')).toMatch(/^"IBM Plex Sans Arabic", Helvetica, Arial/);
});

test('body text is Dark Grey', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toHaveCSS('color', toRgb('#3C464D'));
});
