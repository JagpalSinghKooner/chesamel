import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { pages } from './pages';

test.describe('header', () => {
  test('links the logo home and offers the main navigation', async ({ page }) => {
    await page.goto('/');
    const header = page.getByRole('banner');

    await expect(header.getByRole('link', { name: 'Chesamel home' })).toHaveAttribute('href', '/');
    const nav = header.getByRole('navigation', { name: 'Main' });
    for (const section of ['Who we are', 'What we do', 'Insights', 'Culture & Careers']) {
      await expect(nav.getByRole('button', { name: section })).toBeVisible();
    }
    await expect(header.getByRole('link', { name: 'Let’s Talk' })).toHaveAttribute('href', '/contact/');
    await expect(header.getByRole('link', { name: 'Qatar' })).toHaveAttribute('href', '/ar/who-we-are/');
  });

  test('a section opens its menu on click and closes on Escape', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Main' });
    const whatWeDo = nav.getByRole('button', { name: 'What we do' });
    const marketing = nav.getByRole('link', { name: 'Marketing Engine' });

    await expect(marketing).toBeHidden();
    await whatWeDo.click();
    await expect(whatWeDo).toHaveAttribute('aria-expanded', 'true');
    await expect(marketing).toHaveAttribute('href', '/services/marketing-engine/');
    await expect(marketing).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(marketing).toBeHidden();
    await expect(whatWeDo).toBeFocused();
  });

  test('on a phone the navigation sits behind a Menu button', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Main' });

    await expect(nav).toBeHidden();
    await page.getByRole('button', { name: 'Menu' }).click();
    await nav.getByRole('button', { name: 'Insights' }).click();
    await expect(nav.getByRole('link', { name: 'Webinars' })).toBeVisible();
    await expect(page.getByRole('banner').getByRole('link', { name: 'Let’s Talk' })).toBeVisible();
  });
});

test('footer lists the offices, accreditations and legal links', async ({ page }) => {
  await page.goto('/');
  const footer = page.getByRole('contentinfo');

  await expect(footer.getByRole('link', { name: 'Chesamel home' })).toHaveAttribute('href', '/');
  for (const city of ['London', 'Doha', 'Riyadh', 'San Francisco', 'Stockholm', 'Lisbon', 'Sandton']) {
    await expect(footer.getByText(city, { exact: true })).toBeVisible();
  }
  await expect(footer.getByRole('link', { name: 'Chesamel on LinkedIn' })).toHaveAttribute('href', /linkedin\.com/);
  await expect(footer.getByRole('link', { name: 'HubSpot certified partner' })).toBeVisible();
  await expect(footer.getByRole('link', { name: 'Modern Slavery Act' })).toHaveAttribute('href', '/modern-slavery-statement/');
  await expect(footer).toContainText(`© ${new Date().getFullYear()} Chesamel Group Ltd. All rights reserved.`);
});

test('policy PDFs linked from the footer are served', async ({ page, request }) => {
  await page.goto('/');
  for (const name of ['Privacy & Cookies Policy', 'Terms and Conditions']) {
    const href = await page.getByRole('contentinfo').getByRole('link', { name }).getAttribute('href');
    const response = await request.get(href!);
    expect(response.headers()['content-type']).toContain('pdf');
  }
});

test.describe('homepage', () => {
  test('has the hero, Pillar cards, CTA and the rest of the live page', async ({ page }) => {
    await page.goto('/');
    const main = page.getByRole('main');

    await expect(main.getByRole('heading', { level: 1 })).toHaveText('Global Business Transformation');
    await expect(main.getByRole('link', { name: 'What We Do' }).first()).toHaveAttribute('href', '/what-we-do/');

    await expect(main.getByRole('heading', { name: 'What’s holding your business back?' })).toBeVisible();

    const pillars = main.getByRole('list', { name: 'Pillars' });
    for (const [name, href] of [
      ['Digital Transformation', '/services/digital-transformation/'],
      ['Marketing Transformation', '/services/marketing-engine/'],
      ['Workforce Transformation', '/services/hybrid-workforce/'],
      ['Investments & Impact Transformation', '/services/investment-impact-transformation/'],
    ]) {
      await expect(pillars.getByRole('link', { name })).toHaveAttribute('href', href);
    }
    await expect(main.getByRole('heading', { name: 'How we add value' })).toBeVisible();

    await expect(main.getByRole('heading', { name: 'Want to transform your business?' })).toBeVisible();
    await expect(main.getByRole('heading', { name: 'Latest Insights' })).toBeVisible();
    await expect(main.getByRole('heading', { name: 'Connect with us' })).toBeVisible();
    await expect(main.getByRole('heading', { name: 'Where we are' })).toBeVisible();
    await expect(main.getByRole('link', { name: 'Qatar', exact: true })).toHaveAttribute('href', '/ar/who-we-are/');
  });

  test('does not list the countries whose links went nowhere', async ({ page }) => {
    await page.goto('/');
    const text = await page.locator('body').innerText();
    for (const country of ['France', 'Spain', 'Netherlands', 'Bulgaria', 'Turkey', 'UAE', 'Japan']) {
      expect(text).not.toContain(country);
    }
  });

  test('works on a phone without sideways scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.goto('/');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBe(0);
  });

  test('has no WCAG AA violations on a phone with the menu open', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu' }).click();
    await page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: 'What we do' }).click();
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe('every page', () => {
  for (const path of pages) {
    test(`${path} has no dead "#" links and no admin links`, async ({ page }) => {
      await page.goto(path);
      const hrefs = await page.locator('a[href]').evaluateAll((as) => as.map((a) => a.getAttribute('href')!));
      expect(hrefs.filter((h) => h === '#' || h === '')).toEqual([]);
      expect(hrefs.filter((h) => /wp-admin|wp-login/.test(h))).toEqual([]);
      await expect(page.getByText('Edit Profile')).toHaveCount(0);
    });
  }
});
