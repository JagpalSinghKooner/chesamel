import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { palette } from '../src/data/theme';
import { revealAll } from './reveal-all';

// ADR-0006: every colour and font is a theme role, and `palette` in
// src/data/theme.ts picks which palette fills them. The site is built with
// one palette; these render a few pages with the other one, so that palette
// can't silently rot.
const other = palette === 'live' ? 'brand' : 'live';
const WCAG_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

// Transitions off first, so every colour has settled when it is read.
const usePalette = async (page: Page, name: string) => {
  await page.addStyleTag({ content: '*, ::before, ::after { transition: none !important; }' });
  await page.evaluate((name) => {
    document.documentElement.dataset.palette = name;
  }, name);
};

const ctaColour = (page: Page) =>
  page.locator('[data-component="cta"] a').first().evaluate((a) => getComputedStyle(a).backgroundColor);

test('switching the palette switches the colours', async ({ page }) => {
  await page.goto('/');
  const before = await ctaColour(page);
  await usePalette(page, other);
  expect(await ctaColour(page)).not.toBe(before);
});

for (const path of ['/', '/what-we-do/', '/services/marketing-engine/', '/insights/reports/', '/style-guide/']) {
  test(`${path} has no WCAG AA violations in the ${other} palette`, async ({ page }) => {
    await page.goto(path);
    await usePalette(page, other);
    await revealAll(page);
    const results = await new AxeBuilder({ page }).withTags(WCAG_AA).analyze();
    expect(results.violations).toEqual([]);
  });
}
