import { readdirSync, readFileSync } from 'node:fs';
import { test, expect, type Page } from '@playwright/test';

// Blog Posts on disk: every one of them must be listed in News.
const blogDir = new URL('../src/content/blog/', import.meta.url);
const postFiles = readdirSync(blogDir, { recursive: true, encoding: 'utf8' }).filter((f) => f.endsWith('.md'));

// Known posts, with their labels in the migrated content.
const flexIndex = 'The Flex Index: A Working Tool for Workforce Composition'; // Hybrid Workforce, Technology
const sayDoGap = 'The Marketing Say-Do Gap: The 2026 State of AI in B2B Marketing'; // Marketing Engine, Technology

const NEWS = '/insights/blog/';
const PER_PAGE = 6;
const lastPage = Math.ceil(postFiles.length / PER_PAGE);
const allCards = (page: Page) => page.getByRole('main').locator('[data-component="blog-post-card"]');
const cards = (page: Page) => page.getByRole('main').locator('[data-component="blog-post-card"]:visible');
const card = (page: Page, title: string) => page.getByRole('main').getByRole('link', { name: title });
const pager = (page: Page) => page.getByRole('navigation', { name: 'News pages', exact: true });
const filteredPager = (page: Page) => page.getByRole('navigation', { name: 'News pages, filtered' });

// The Pillar labels of every post, from the files, to know how many match.
const labelsOf = (file: string) => readFileSync(new URL(file, blogDir), 'utf8').match(/^pillars: (.*)$/m)![1];
const hybridPosts = postFiles.filter((f) => labelsOf(f).includes('"hybrid-workforce"')).length;
const industriesOf = (file: string) => readFileSync(new URL(file, blogDir), 'utf8').match(/^industries: (.*)$/m)?.[1] ?? '';
const technologyPosts = postFiles.filter((f) => industriesOf(f).includes('"technology"')).length;

test.describe('News', () => {
  test('carries every Blog Post, newest first, and shows the six newest', async ({ page }) => {
    await page.goto(NEWS);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('News');
    await expect(allCards(page)).toHaveCount(postFiles.length);
    await expect(cards(page)).toHaveCount(PER_PAGE);
    await expect(page.getByRole('status')).toHaveText(`${postFiles.length} Blog Posts`);

    const dates = await allCards(page).locator('time').evaluateAll((ts) => ts.map((t) => t.getAttribute('datetime')!));
    expect(dates).toEqual([...dates].sort().reverse());
  });

  test('pages through the posts with real links, 6 a page', async ({ page }) => {
    await page.goto(NEWS);
    const titles = await allCards(page).locator('h2').allTextContents();
    const nav = pager(page);
    await expect(nav.getByRole('link', { name: 'First page' })).toHaveCount(0);
    await expect(nav.getByRole('link', { name: 'Previous page' })).toHaveCount(0);
    await expect(nav.getByRole('link', { name: /^Page \d+$/ })).toHaveText(['1', '2', '3']);
    await expect(nav.getByRole('link', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
    await expect(nav.getByRole('link', { name: 'Last page' })).toHaveAttribute('href', `${NEWS}page/${lastPage}/`);

    await nav.getByRole('link', { name: 'Next page' }).click();
    await expect(page).toHaveURL(`${NEWS}page/2/`);
    await expect(page).toHaveTitle(`News, page 2 of ${lastPage} | Chesamel`);
    await expect(cards(page).locator('h2')).toHaveText(titles.slice(6, 12));
    await expect(pager(page).getByRole('link', { name: 'Previous page' })).toHaveAttribute('href', NEWS);
    await expect(pager(page).getByRole('link', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');

    await page.goto(`${NEWS}page/${lastPage}/`);
    await expect(cards(page).locator('h2')).toHaveText(titles.slice((lastPage - 1) * PER_PAGE));
    await expect(pager(page).getByRole('link', { name: /^Page \d+$/ })).toHaveText([lastPage - 2, lastPage - 1, lastPage].map(String));
    await expect(pager(page).getByRole('link', { name: 'Next page' })).toHaveCount(0);
    await expect(pager(page).getByRole('link', { name: 'Last page' })).toHaveCount(0);
  });

  test("the live site's ?pages=N and filter addresses lead to the same posts", async ({ page }) => {
    await page.goto(`${NEWS}?pages=2`);
    await expect(page).toHaveURL(`${NEWS}page/2/`);
    await page.goto(`${NEWS}page/3/?pages=1`);
    await expect(page).toHaveURL(NEWS);
    await page.goto(`${NEWS}?pages=999`);
    await expect(page).toHaveURL(`${NEWS}page/${lastPage}/`);
    await page.goto(`${NEWS}?a_services=hybrid-workforce&a_industries=technology`);
    await expect(page).toHaveURL(`${NEWS}?pillar=hybrid-workforce&industry=technology`);
    await expect(page.getByRole('group', { name: 'Pillar' }).getByRole('button', { name: 'Hybrid Workforce' })).toHaveAttribute('aria-pressed', 'true');
    await expect(card(page, flexIndex)).toBeVisible();

    // A live page of filtered posts is the same page of our filtered posts.
    await page.goto(`${NEWS}page/4/?a_services=hybrid-workforce&pages=2`);
    await expect(page).toHaveURL(`${NEWS}?pillar=hybrid-workforce&page=2`);
    await expect(page.getByRole('navigation', { name: 'News pages, filtered' }).getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
    await expect(card(page, flexIndex)).toBeHidden();
  });

  test('a filter value no button offers falls back to All', async ({ page }) => {
    await page.goto(`${NEWS}?a_services=investments-sustainable-transformation`);
    await expect(page.getByRole('group', { name: 'Pillar' }).getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true');
    await expect(cards(page)).toHaveCount(PER_PAGE);
    await expect(page.getByRole('status')).toHaveText(`${postFiles.length} Blog Posts`);
    await expect(page).toHaveURL(NEWS);
  });

  test('filters by Pillar across every page, and pages through the matches', async ({ page }) => {
    await page.goto(`${NEWS}page/5/`);
    const pillars = page.getByRole('group', { name: 'Pillar' });
    await pillars.getByRole('button', { name: 'Hybrid Workforce' }).click();

    await expect(pillars.getByRole('button', { name: 'Hybrid Workforce' })).toHaveAttribute('aria-pressed', 'true');
    await expect(card(page, flexIndex)).toBeVisible();
    await expect(card(page, sayDoGap)).toBeHidden();
    await expect(cards(page)).toHaveCount(PER_PAGE);
    await expect(page.getByRole('status')).toHaveText(`${hybridPosts} Blog Posts`);
    await expect(page).toHaveURL(/\?pillar=hybrid-workforce$/);

    // The static links give way to buttons that page through the matches.
    await expect(pager(page)).toBeHidden();
    const filtered = filteredPager(page);
    await expect(filtered.getByRole('button', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
    await expect(filtered.getByRole('button', { name: 'Previous page' })).toBeHidden();
    const firstPage = await cards(page).locator('h2').allTextContents();
    await filtered.getByRole('button', { name: 'Page 2' }).click();
    await expect(filtered.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
    await expect(cards(page)).toHaveCount(PER_PAGE);
    await expect(card(page, flexIndex)).toBeHidden();
    expect(await cards(page).locator('h2').allTextContents()).not.toEqual(firstPage);
    await expect(page).toHaveURL(/\?pillar=hybrid-workforce&page=2$/);
    await filtered.getByRole('button', { name: 'Last page' }).click();
    const lastFiltered = Math.ceil(hybridPosts / PER_PAGE);
    await expect(filtered.getByRole('button', { name: `Page ${lastFiltered}` })).toHaveAttribute('aria-current', 'page');
    await expect(cards(page)).toHaveCount(hybridPosts - (lastFiltered - 1) * PER_PAGE);

    // The pressed control is now hidden, so focus moves to the count and the
    // new page is announced.
    await expect(filtered.getByRole('button', { name: 'Last page' })).toBeHidden();
    await expect(page.locator('[data-count]')).toBeFocused();
    await expect(page.locator('[data-page-status]')).toHaveText(`Page ${lastFiltered} of ${lastFiltered}`);
    await filtered.getByRole('button', { name: 'First page' }).click();
    await expect(filtered.getByRole('button', { name: 'First page' })).toBeHidden();
    await expect(page.locator('[data-count]')).toBeFocused();
    await expect(page.locator('[data-page-status]')).toHaveText(`Page 1 of ${lastFiltered}`);

    // All brings back this static page and its links.
    await pillars.getByRole('button', { name: 'All' }).click();
    await expect(cards(page)).toHaveCount(PER_PAGE);
    await expect(pager(page).getByRole('link', { name: 'Page 5' })).toHaveAttribute('aria-current', 'page');
    await expect(filteredPager(page)).toBeHidden();
  });

  test('filters by Industry; posts without an Industry show only while no Industry is chosen', async ({ page }) => {
    await page.goto(NEWS);
    await page.getByRole('group', { name: 'Industry' }).getByRole('button', { name: 'Technology' }).click();
    await expect(page.getByRole('status')).toHaveText(`${technologyPosts} Blog Posts`);
    await expect(card(page, flexIndex)).toBeVisible();
    await expect(card(page, sayDoGap)).toBeVisible();
    await page.getByRole('group', { name: 'Industry' }).getByRole('button', { name: 'All' }).click();
    await expect(page.getByRole('status')).toHaveText(`${postFiles.length} Blog Posts`);
  });

  test('a card shows its Pillar tag in the accent, the date, the reading time and the hero image', async ({ page }) => {
    await page.goto(NEWS);
    const flex = card(page, flexIndex);
    await expect(flex.locator('[data-tag]')).toHaveText('Hybrid Workforce');
    await expect(flex.locator('[data-tag]')).toHaveCSS('border-top-color', 'rgb(255, 138, 84)');
    // Live's Tiger text, darkened to pass AA (ADR-0006).
    await expect(flex.locator('[data-tag]')).toHaveCSS('color', 'rgb(169, 92, 56)');
    await expect(flex.locator('time')).toHaveText('October 1, 2026');
    await expect(flex).toContainText(/\d+ min/);
    await expect(flex.locator('img')).toHaveAttribute('src', /^\/wp-content\/uploads\//);
  });

  test('combines both filters, and a filtered address can be shared', async ({ page }) => {
    await page.goto(`${NEWS}?pillar=marketing-engine&industry=technology`);
    await expect(page.getByRole('group', { name: 'Pillar' }).getByRole('button', { name: 'Marketing Engine' })).toHaveAttribute('aria-pressed', 'true');
    await expect(card(page, sayDoGap)).toBeVisible();
    await expect(card(page, flexIndex)).toBeHidden();
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

  test('a post of the former news type is served under /news/', async ({ page }) => {
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
