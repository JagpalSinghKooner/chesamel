import { readdirSync } from 'node:fs';
import { test, expect, type Page } from '@playwright/test';

// Blog Posts on disk: every one of them must be listed in News.
const blogDir = new URL('../src/content/blog/', import.meta.url);
const postFiles = readdirSync(blogDir, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.md'));

// Known posts, with their labels in the migrated content.
const flexIndex = 'The Flex Index: A Working Tool for Workforce Composition'; // Hybrid Workforce, Technology
const sayDoGap = 'The Marketing Say-Do Gap: The 2026 State of AI in B2B Marketing'; // Marketing Engine, Technology
const responsibleTech = 'Shaping a Responsible Tech Strategy: Avoiding Innovation for Innovation’s Sake'; // Digital Transformation, no Industry

const NEWS = '/insights/blog/';
const cards = (page: Page) => page.getByRole('main').locator('[data-component="blog-post-card"]:visible');
const card = (page: Page, title: string) => page.getByRole('main').getByRole('link', { name: title });

test.describe('News', () => {
  test('lists every Blog Post, newest first', async ({ page }) => {
    await page.goto(NEWS);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('News');
    await expect(cards(page)).toHaveCount(postFiles.length);
    await expect(page.getByRole('status')).toHaveText(`${postFiles.length} Blog Posts`);

    const dates = await cards(page).locator('time').evaluateAll((ts) => ts.map((t) => t.getAttribute('datetime')!));
    expect(dates).toEqual([...dates].sort().reverse());
  });

  test('filters by Pillar', async ({ page }) => {
    await page.goto(NEWS);
    const pillars = page.getByRole('group', { name: 'Pillar' });
    await pillars.getByRole('button', { name: 'Hybrid Workforce' }).click();

    await expect(pillars.getByRole('button', { name: 'Hybrid Workforce' })).toHaveAttribute('aria-pressed', 'true');
    await expect(card(page, flexIndex)).toBeVisible();
    await expect(card(page, sayDoGap)).toBeHidden();
    const shown = await cards(page).count();
    expect(shown).toBeGreaterThan(0);
    expect(shown).toBeLessThan(postFiles.length);
    await expect(page.getByRole('status')).toHaveText(`${shown} Blog Posts`);
    await expect(page).toHaveURL(/\?pillar=hybrid-workforce$/);

    await pillars.getByRole('button', { name: 'All' }).click();
    await expect(cards(page)).toHaveCount(postFiles.length);
  });

  test('filters by Industry; posts without an Industry show only while no Industry is chosen', async ({ page }) => {
    await page.goto(NEWS);
    await expect(card(page, responsibleTech)).toBeVisible();

    await page.getByRole('group', { name: 'Industry' }).getByRole('button', { name: 'Technology' }).click();
    await expect(card(page, flexIndex)).toBeVisible();
    await expect(card(page, sayDoGap)).toBeVisible();
    await expect(card(page, responsibleTech)).toBeHidden();
  });

  test('combines both filters, and a filtered address can be shared', async ({ page }) => {
    await page.goto(`${NEWS}?pillar=marketing-engine&industry=technology`);
    await expect(page.getByRole('group', { name: 'Pillar' }).getByRole('button', { name: 'Marketing Engine' })).toHaveAttribute('aria-pressed', 'true');
    await expect(card(page, sayDoGap)).toBeVisible();
    await expect(card(page, flexIndex)).toBeHidden();
    await expect(card(page, responsibleTech)).toBeHidden();
  });

  test('works on a phone without sideways scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto(NEWS);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBe(0);
  });
});

test.describe('Blog Post page', () => {
  test('shows the post at its original address with its hero image and Pillar', async ({ page }) => {
    await page.goto(NEWS);
    await card(page, flexIndex).click();

    await expect(page).toHaveURL(/\/flex-index-flexible-workforce-planning\/$/);
    await expect(page).toHaveTitle('The Flex Index: A Working Tool for Workforce Composition | Chesamel');
    const main = page.getByRole('main');
    await expect(main.getByRole('heading', { level: 1 })).toHaveText(flexIndex);
    await expect(main.locator('time').first()).toHaveText('October 1, 2026');
    await expect(main.getByRole('link', { name: 'Hybrid Workforce' }).first()).toHaveAttribute('href', '/services/hybrid-workforce/');
    await expect(main.getByRole('link', { name: 'News' })).toHaveAttribute('href', NEWS);

    const hero = main.locator('[data-hero] img');
    await expect(hero).toHaveAttribute('alt', 'flexible workforce planning');
    expect(await hero.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Flex Index/);
  });

  test('a former news item is served under /news/', async ({ page }) => {
    const res = await page.goto('/news/qatar-the-dawning-oasis-of-global-innovation/');
    expect(res?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Qatar: The Dawning Oasis of Global Innovation');
    await expect(page.getByRole('main')).toContainText('Hayyakom!');
  });

  test('every image in a post body loads', async ({ page }) => {
    await page.goto('/news/qatar-the-dawning-oasis-of-global-innovation/');
    const images = page.locator('[data-blog-body] img');
    for (const img of await images.all()) {
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
    }
  });
});

test('the homepage shows the three newest Blog Posts', async ({ page }) => {
  await page.goto(NEWS);
  const newest = await cards(page).locator('h2, h3').evaluateAll((hs) => hs.slice(0, 3).map((h) => h.textContent?.trim()));
  await page.goto('/');
  const latest = page.getByRole('region', { name: 'Latest Insights' }).locator('[data-component="blog-post-card"]');
  await expect(latest.locator('h3')).toHaveText(newest as string[]);
});
