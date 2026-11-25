import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { revealAll } from './reveal-all';
import { pages } from './pages';

const WCAG_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

for (const path of pages) {
  test(`${path} has no WCAG AA violations`, async ({ page }) => {
    await page.goto(path);
    await revealAll(page);
    const results = await new AxeBuilder({ page }).withTags(WCAG_AA).analyze();
    expect(results.violations).toEqual([]);
  });
}
