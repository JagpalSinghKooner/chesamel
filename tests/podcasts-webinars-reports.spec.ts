import { readdirSync } from 'node:fs';
import { test, expect, type Page } from '@playwright/test';

const slugs = (collection: string) =>
  readdirSync(new URL(`../src/content/${collection}/`, import.meta.url))
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));

const main = (page: Page) => page.getByRole('main');

// Every item in the collection is linked from its listing, which the live site doesn't do.
async function expectListsEvery(page: Page, listing: string, collection: string) {
  await page.goto(listing);
  const hrefs = await main(page)
    .locator(`a[href^="/${collection}/"]`)
    .evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  expect(new Set(hrefs)).toEqual(new Set(slugs(collection).map((s) => `/${collection}/${s}/`)));
}

test.describe('Podcasts', () => {
  test('the listing links every episode, newest first, with its guest and where to listen', async ({ page }) => {
    await expectListsEvery(page, '/insights/podcasts/', 'podcasts');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Podcast');
    await expect(main(page).getByRole('link', { name: 'Listen now' })).toHaveAttribute('href', 'https://open.spotify.com/show/3vQMN7K3w5z6T23vDhipjt');

    const episodes = main(page).getByRole('listitem').filter({ has: page.locator('time') });
    await expect(episodes).toHaveCount(slugs('podcasts').length);
    const dates = await episodes.locator('time').evaluateAll((ts) => ts.map((t) => t.getAttribute('datetime')!));
    expect(dates).toEqual([...dates].sort().reverse());

    const newest = episodes.first();
    await expect(newest.getByRole('heading')).toHaveText('Shaping Digital Transformation Across Industries');
    await expect(newest).toContainText('Eugene Pataliak');
    await expect(newest.getByRole('link', { name: /Spotify/ })).toHaveAttribute('href', /open\.spotify\.com\/episode\//);
  });

  test('an episode page shows the guest, the description and where to listen', async ({ page }) => {
    await page.goto('/podcasts/stress-awareness-at-work/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Stress Awareness at Work');
    await expect(main(page)).toContainText('Mandana Ahmadi');
    await expect(main(page)).toContainText('Mani is the Founder of Alena');
    await expect(main(page).getByRole('link', { name: /Spotify/ })).toHaveAttribute('href', 'https://open.spotify.com/episode/2OfeM73Xzd2ReQYtPimrh1');
    await expect(main(page).getByRole('link', { name: /Podchaser/ })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Podcast' })).toHaveAttribute('href', '/insights/podcasts/');
  });
});

test.describe('Webinars', () => {
  test('the listing links every webinar', async ({ page }) => {
    await expectListsEvery(page, '/insights/webinars/', 'webinars');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Webinars');
  });

  test('a webinar with no player in its body shows its recording, loading YouTube only when played', async ({ page }) => {
    await page.goto('/webinars/the-role-of-finance-technology-innovations-ahead-of-cop28/');
    await expect(main(page).locator('iframe')).toHaveCount(0);
    const play = main(page).getByRole('link', { name: /Play video/ });
    await expect(play).toHaveAttribute('href', 'https://www.youtube.com/watch?v=V01qJZc8rIU');
    await play.click();
    await expect(main(page).locator('iframe')).toHaveAttribute('src', /^https:\/\/www\.youtube-nocookie\.com\/embed\/V01qJZc8rIU/);
  });

  test('a webinar shows its video once, and the Industries and services it covers', async ({ page }) => {
    await page.goto('/webinars/sovereign-ai-building-technology-in-a-fragmented-world-web-summit-qatar-2026/', { waitUntil: 'domcontentloaded' });
    await expect(main(page).locator('iframe')).toHaveCount(1);
    await expect(main(page).getByRole('link', { name: /Technology/ })).toHaveAttribute('href', '/industries/technology/');
    await expect(main(page).getByRole('link', { name: /AI & Machine Learning/ })).toHaveAttribute('href', '/services/ai-machine-learning/');
  });
});

test.describe('Reports', () => {
  test('the listing links every report', async ({ page }) => {
    await expectListsEvery(page, '/insights/reports/', 'reports');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Reports');
  });

  test('a report page shows its intro and cover, and asks the reader to get in touch for the full report', async ({ page }) => {
    await page.goto('/reports/agile-marketing/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Agile Marketing');
    await expect(main(page)).toContainText('Dive into our latest white paper');
    await expect(main(page).getByText('Marketing Engine').first()).toBeVisible();
    await expect(main(page).locator('img[src="/wp-content/uploads/2024/11/Agile-Marketing.jpg"]')).toBeVisible();
    await expect(main(page).getByRole('link', { name: /Request the full report/ })).toHaveAttribute('href', '/contact/');
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Reports' })).toHaveAttribute('href', '/insights/reports/');
  });
});

test('the Insights hub links each kind of Insight', async ({ page }) => {
  await page.goto('/insights/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Insights');
  for (const [name, href] of [
    ['News', '/insights/blog/'],
    ['Webinars', '/insights/webinars/'],
    ['Podcasts', '/insights/podcasts/'],
    ['Reports', '/insights/reports/'],
    ['Our Work', '/insights/our-work/'],
  ]) {
    await expect(main(page).getByRole('link', { name: new RegExp(`^${name}`) })).toHaveAttribute('href', href);
  }
});

test('the listings and pages fit a phone without sideways scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  for (const address of ['/insights/podcasts/', '/insights/webinars/', '/insights/reports/', '/reports/agile-marketing/', '/webinars/what-does-cop27-mean-for-your-business/']) {
    await page.goto(address, { waitUntil: 'domcontentloaded' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth), address).toBeLessThanOrEqual(375);
  }
});
