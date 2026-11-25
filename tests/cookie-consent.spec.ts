import { test, expect, type Page } from '@playwright/test';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import AxeBuilder from '@axe-core/playwright';
import { revealAll } from './reveal-all';
import { readChoice, serialiseChoice, cloudflareBeacon } from '../src/lib/consent';
import { consentStorageKey } from '../src/data/consent';

// Every request to a HubSpot host is answered locally and recorded, so the
// tests never reach HubSpot and can tell whether tracking was asked for.
const HUBSPOT = /^https:\/\/[^/]*(hs-scripts|hs-analytics|hs-banner|hscollectedforms|hubspot|hsforms|hs-sites)\.(com|net)\//;

async function watchHubSpot(page: Page) {
  const requests: string[] = [];
  await page.route(HUBSPOT, (route) => {
    requests.push(route.request().url());
    return route.fulfill({ status: 200, contentType: 'text/javascript', body: '' });
  });
  return requests;
}

// Waits until every script on the page has run, so a late HubSpot request
// would have been made.
async function settle(page: Page) {
  await page.waitForLoadState('networkidle');
}

const banner = (page: Page) => page.getByRole('region', { name: 'We use cookies.' });

test.describe('cookie banner', () => {
  test('asks on the first visit, with the agreed wording, and loads no HubSpot', async ({ page }) => {
    const hubspot = await watchHubSpot(page);
    await page.goto('/');
    await expect(banner(page)).toBeVisible();
    await expect(banner(page).locator('p')).toHaveText(
      'We use cookies. Analytics that don’t use cookies run for everyone. With your OK, we also use HubSpot cookies to understand how you use the site. Privacy policy',
    );
    await expect(banner(page).getByRole('button')).toHaveText(['Accept all', 'Reject all']);
    await expect(banner(page).getByRole('link', { name: 'Privacy policy' })).toHaveAttribute('href', '/wp-content/uploads/2024/12/chesamel-website-private-policy.pdf');
    await expect(banner(page)).toHaveCSS('position', 'fixed');
    await settle(page);
    expect(hubspot).toEqual([]);
  });

  test('comes right after the skip link in focus order', async ({ page }) => {
    await page.goto('/');
    await expect(banner(page)).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(banner(page).getByRole('link', { name: 'Privacy policy' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Accept all' })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Reject all' })).toBeFocused();
  });

  test('Reject all is remembered and HubSpot never loads', async ({ page }) => {
    const hubspot = await watchHubSpot(page);
    await page.goto('/');
    // Keyboard: Enter on a button chooses it.
    await page.getByRole('button', { name: 'Reject all' }).focus();
    await page.keyboard.press('Enter');
    await expect(banner(page)).toBeHidden();

    await page.reload();
    await settle(page);
    await expect(banner(page)).toBeHidden();
    await page.goto('/insights/');
    await settle(page);
    await expect(banner(page)).toBeHidden();
    expect(hubspot).toEqual([]);
  });

  test('Accept all loads HubSpot now and on later page views', async ({ page }) => {
    const hubspot = await watchHubSpot(page);
    await page.goto('/');
    await page.getByRole('button', { name: 'Accept all' }).click();
    await expect(banner(page)).toBeHidden();
    await expect.poll(() => hubspot).toEqual(['https://js.hs-scripts.com/7886724.js']);

    await page.reload();
    await expect(banner(page)).toBeHidden();
    await expect.poll(() => hubspot.length).toBe(2);
  });

  test('Cookie settings in the footer reopens the banner, and withdrawing consent stops HubSpot', async ({ page }) => {
    const hubspot = await watchHubSpot(page);
    await page.goto('/');
    await page.getByRole('button', { name: 'Accept all' }).click();
    await expect.poll(() => hubspot.length).toBe(1);

    const settings = page.getByRole('contentinfo').getByRole('link', { name: 'Cookie settings' });
    await settings.click();
    await expect(banner(page)).toBeVisible();
    await expect(banner(page)).toBeFocused();
    await page.getByRole('button', { name: 'Reject all' }).click();
    await expect(banner(page)).toBeHidden();
    await expect(settings).toBeFocused();

    await page.reload();
    await settle(page);
    await expect(banner(page)).toBeHidden();
    expect(hubspot).toHaveLength(1);
  });

  test('asks again once the choice is 12 months old', async ({ page }) => {
    const hubspot = await watchHubSpot(page);
    const thirteenMonthsAgo = new Date();
    thirteenMonthsAgo.setMonth(thirteenMonthsAgo.getMonth() - 13);
    await page.addInitScript(
      ([key, value]) => localStorage.setItem(key, value),
      [consentStorageKey, serialiseChoice('accepted', thirteenMonthsAgo)],
    );
    await page.goto('/');
    await expect(banner(page)).toBeVisible();
    await settle(page);
    expect(hubspot).toEqual([]);
  });

  test('never hides a focused control or the end of the page on a phone (WCAG 2.4.11)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(banner(page)).toBeVisible();
    await revealAll(page);

    // Tab through the whole page; no focused element outside the bar may sit
    // entirely underneath it.
    const hidden: string[] = [];
    for (let stop = 0; stop < 200; stop++) {
      await page.keyboard.press('Tab');
      const state = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        const bar = document.querySelector('[data-cookie-banner="live"]')!;
        if (!el || el === document.body) return { done: true };
        const r = el.getBoundingClientRect();
        const b = bar.getBoundingClientRect();
        const covered = !bar.contains(el) && r.height > 0 && r.top >= b.top && r.bottom <= b.bottom;
        return { done: false, covered, name: `${el.tagName} ${el.textContent?.trim().slice(0, 40) || el.getAttribute('aria-label')}` };
      });
      if (state.done) break;
      if (state.covered) hidden.push(state.name!);
    }
    expect(hidden).toEqual([]);

    // The footer's last link can be scrolled clear of the bar.
    const last = page.getByRole('contentinfo').getByRole('link', { name: 'Modern Slavery Act' });
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const linkBox = (await last.boundingBox())!;
    const barBox = (await banner(page).boundingBox())!;
    expect(linkBox.y + linkBox.height).toBeLessThanOrEqual(barBox.y);
  });

  test('gives back the reserved space once a choice is made', async ({ page }) => {
    await page.goto('/');
    await expect(banner(page)).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.body.style.paddingBottom)).not.toBe('');
    await page.getByRole('button', { name: 'Reject all' }).click();
    expect(await page.evaluate(() => [document.body.style.paddingBottom, document.documentElement.style.scrollPaddingBottom])).toEqual(['', '']);
  });

  test('the style guide copy is inert', async ({ page }) => {
    const hubspot = await watchHubSpot(page);
    await page.goto('/style-guide/');
    const preview = page.locator('[data-cookie-banner="preview"]');
    await preview.getByRole('button', { name: 'Accept all' }).click();
    await expect(preview).toBeVisible();
    await expect(banner(page).first()).toBeVisible();
    await settle(page);
    expect(hubspot).toEqual([]);
    expect(await page.evaluate((key) => localStorage.getItem(key), consentStorageKey)).toBeNull();
  });

  test('passes axe while shown, on a phone too', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(banner(page)).toBeVisible();
    await revealAll(page);
    const results = await new AxeBuilder({ page }).include('#cookie-settings').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe('Cloudflare Web Analytics', () => {
  test('renders no beacon when no token is set', async ({ page }) => {
    // The test build has no CLOUDFLARE_WEB_ANALYTICS_TOKEN.
    await page.goto('/');
    await expect(page.locator('script[src*="cloudflareinsights"]')).toHaveCount(0);
  });

  test('loads on every page, before any choice, when the token is set', async () => {
    // A second build with a token, into a folder of its own. The beacon is
    // plain markup in each page's head, so it does not wait for consent.
    test.setTimeout(180_000);
    const outDir = await mkdtemp(join(tmpdir(), 'chesamel-beacon-'));
    try {
      await promisify(execFile)('node_modules/.bin/astro', ['build', '--outDir', outDir], {
        env: { ...process.env, CLOUDFLARE_WEB_ANALYTICS_TOKEN: 'test-token' },
      });
      const beacon = '<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon="{&quot;token&quot;:&quot;test-token&quot;}"></script>';
      for (const page of ['index.html', 'insights/index.html', '404.html']) {
        const html = await readFile(join(outDir, page), 'utf8');
        expect(html.split('</head>')[0], page).toContain(beacon);
      }
    } finally {
      await rm(outDir, { recursive: true, force: true });
    }
  });
});

test.describe('consent memory', () => {
  const now = new Date('2026-11-25T12:00:00Z');
  const monthsAgo = (months: number, days = 0) => {
    const date = new Date(now);
    date.setMonth(date.getMonth() - months);
    date.setDate(date.getDate() + days);
    return date;
  };

  test('remembers either choice for 12 months', () => {
    expect(readChoice(serialiseChoice('accepted', now), now)).toBe('accepted');
    expect(readChoice(serialiseChoice('rejected', monthsAgo(12, 1)), now)).toBe('rejected');
    expect(readChoice(serialiseChoice('accepted', monthsAgo(12)), now)).toBeUndefined();
  });

  test('treats a missing or damaged choice as no choice', () => {
    for (const stored of [null, '', 'yes', '{}', '{"choice":"maybe","at":0}', '{"choice":"accepted"}']) {
      expect(readChoice(stored, now), String(stored)).toBeUndefined();
    }
    // A choice dated in the future (a wrong clock) is asked again.
    expect(readChoice(serialiseChoice('accepted', new Date('2027-01-01')), now)).toBeUndefined();
  });

  test('the Cloudflare beacon carries the token, and is left out without one', () => {
    expect(cloudflareBeacon('abc123')).toEqual({ src: 'https://static.cloudflareinsights.com/beacon.min.js', 'data-cf-beacon': '{"token":"abc123"}' });
    expect(cloudflareBeacon(undefined)).toBeUndefined();
    expect(cloudflareBeacon('  ')).toBeUndefined();
  });
});
