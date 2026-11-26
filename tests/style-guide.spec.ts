import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { roleGroups, roleOf, paletteValues } from '../src/design-system/colours';
import { themeRoles } from '../scripts/check-toolkit';
import { palette } from '../src/data/theme';

const themeCss = readFileSync(new URL('../src/styles/theme.css', import.meta.url), 'utf8');
const live = paletteValues(themeCss, 'live');
const brand = paletteValues(themeCss, 'brand');
const colourRoles = (values: Record<string, string>) => Object.keys(values).filter((name) => !name.startsWith('font-')).sort();

// theme.css writes live's values as rgb(r g b) or rgb(r g b / a); the
// browser reports them as rgb(r, g, b) or rgba(r, g, b, a).
const computed = (value: string) => {
  if (value === 'transparent') return 'rgba(0, 0, 0, 0)';
  const m = value.match(/^rgb\((\d+) (\d+) (\d+)(?: \/ ([\d.]+))?\)$/);
  if (!m) throw new Error(`Not an rgb() value: ${value}`);
  return m[4] ? `rgba(${m[1]}, ${m[2]}, ${m[3]}, ${m[4]})` : `rgb(${m[1]}, ${m[2]}, ${m[3]})`;
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

test('both palettes fill the same roles, and the style guide lists every one', () => {
  expect(colourRoles(brand)).toEqual(colourRoles(live));
  const listed = roleGroups.flatMap((g) => g.roles.map(roleOf)).sort();
  expect(listed).toEqual(colourRoles(live));
});

test('every palette role has a utility in theme.css', () => {
  const utilities = themeRoles(themeCss);
  for (const role of colourRoles(live)) {
    expect(utilities.has(role), role).toBe(true);
    expect(themeCss, role).toContain(`--color-${role}: var(--${role});`);
  }
});

test('the site uses the palette src/data/theme.ts picks', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-palette', palette);
});

test('style-guide page renders every colour role in the live palette', async ({ page }) => {
  test.skip(palette !== 'live', 'checks the live palette');
  await page.goto('/style-guide/');
  for (const { roles } of roleGroups) {
    for (const role of roles.map(roleOf)) {
      const item = page.locator(`[data-role="${role}"]`);
      await expect(item).toContainText(live[role]);
      await expect(item.locator('[data-swatch]'), role).toHaveCSS('background-color', computed(live[role]));
    }
  }
});

test('style-guide page renders every type style', async ({ page }) => {
  await page.goto('/style-guide/');
  for (const style of ['type-heading-1', 'type-heading-2', 'type-heading-3', 'type-subheading', 'type-body', 'type-tag', 'type-caption', 'type-large', 'arabic']) {
    await expect(page.locator(`[data-type-style="${style}"] p`).nth(1)).toBeVisible();
  }
});

test('the palette fonts actually load on the style-guide page', async ({ page }) => {
  await page.goto('/style-guide/');
  const loaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, ''));
  });
  // Live sets everything in Figtree; the brand palette adds DM Sans for subheadings.
  const expected = palette === 'live' ? ['Figtree Variable', 'IBM Plex Sans Arabic'] : ['Figtree Variable', 'DM Sans Variable', 'IBM Plex Sans Arabic'];
  expect(new Set(loaded)).toEqual(new Set(expected));
});

test('body text is the body role, which passes AA, not the grey live uses', async ({ page }) => {
  test.skip(palette !== 'live', 'checks the live palette');
  await page.goto('/');
  await expect(page.locator('body')).toHaveCSS('color', computed(live.body));
  expect(live.body).not.toBe('rgb(127 132 140)');
});

test('style-guide page shows every logo in each permitted colour with its clear space', async ({ page }) => {
  await page.goto('/style-guide/');
  // Clear space at 48px tall, worked out by hand from the guidelines:
  // wordmark: height of "c"; lockups: width of "ch"; brandmark: page 9's corner circles.
  const expected = {
    wordmark: { colours: ['on-dark', 'on-light'], padding: '36px' },
    lockup: { colours: ['on-dark', 'on-light'], padding: '27px' },
    'tagline-lockup': { colours: ['on-dark', 'on-light'], padding: '27px' },
    brandmark: { colours: ['on-dark', 'on-light', 'brand'], padding: '11px' },
  };
  const section = page.locator('[data-style-guide="logos"]');
  for (const [variant, { colours, padding }] of Object.entries(expected)) {
    const shown = section.locator(`[data-logo="${variant}"]`);
    expect((await shown.evaluateAll((els) => els.map((e) => e.getAttribute('data-logo-tone')))).sort()).toEqual([...colours].sort());
    await expect(shown.first()).toHaveCSS('padding-top', padding);
  }
});

test('style-guide page shows the Case Study and Industry Components', async ({ page }) => {
  await page.goto('/style-guide/');
  const components = page.locator('[data-style-guide="components"]');
  for (const name of ['case-study-card', 'case-study-slider', 'case-study-listing', 'industry-card', 'report-card', 'career-card', 'pager']) {
    await expect(components.locator(`[data-component="${name}"]`).first()).toBeVisible();
  }
});

test('style-guide page shows the header, footer, hero, Pillar cards, CTA, Blog Post and cookie banner Components', async ({ page }) => {
  await page.goto('/style-guide/');
  const components = page.locator('[data-style-guide="components"]');
  await expect(components.locator('[data-header]')).toBeVisible();
  await expect(components.locator('footer')).toBeVisible();
  for (const name of ['hero', 'pillar-cards', 'cta', 'blog-post-card', 'blog-post-listing', 'cookie-banner']) {
    await expect(components.locator(`[data-component="${name}"]`).first()).toBeVisible();
  }
});

test('style-guide page shows the page hero, Office list, Team Member card and Section Components', async ({ page }) => {
  await page.goto('/style-guide/');
  const components = page.locator('[data-style-guide="components"]');
  for (const name of ['page-hero', 'office-list', 'team-card', 'section-stats', 'section-cards', 'section-points', 'section-delivery-models', 'section-brands', 'section-tabs']) {
    await expect(components.locator(`[data-component="${name}"]`).first()).toBeVisible();
  }
});

test('style-guide page shows each Fulldev building block in the brand styling', async ({ page }) => {
  await page.goto('/style-guide/');
  const blocks = page.locator('[data-style-guide="building-blocks"]');
  for (const name of ['button', 'card', 'breadcrumb', 'tabs', 'carousel', 'toggle-group', 'navigation-menu', 'sheet', 'accordion']) {
    await expect(blocks.locator(`[data-building-block="${name}"]`)).toBeVisible();
  }
  // Fulldev's defaults give way to the theme (ADR-0005, ADR-0006): square
  // corners and the primary role on the primary button.
  const primary = blocks.locator('[data-building-block="button"] [data-slot="button"]').first();
  await expect(primary).toHaveCSS('border-top-left-radius', '0px');
  if (palette === 'live') await expect(primary).toHaveCSS('background-color', computed(live.primary));
});

test('style-guide page shows every icon, decorative unless labelled', async ({ page }) => {
  await page.goto('/style-guide/');
  const section = page.locator('[data-style-guide="icons"]');
  const brands = ['linkedin', 'facebook', 'x', 'pinterest', 'youtube', 'instagram', 'spotify', 'amazon-music', 'podcast-addict', 'podchaser', 'google-maps'];
  for (const name of [...brands, 'menu', 'pause', 'play', 'triangle']) {
    const icon = section.locator(`svg[data-icon="${name}"]`).first();
    await expect(icon, name).toBeVisible();
    await expect(icon, name).toHaveAttribute('aria-hidden', 'true');
    expect((await icon.boundingBox())!.width, name).toBeGreaterThan(0);
  }
  await expect(section.getByRole('img', { name: 'LinkedIn' })).toBeVisible();
});

test('style-guide page shows each Pillar accent', async ({ page }) => {
  test.skip(palette !== 'live', 'checks the live palette');
  await page.goto('/style-guide/');
  const expected = {
    'Digital Transformation': 'accent-digital',
    'Marketing Engine': 'accent-marketing',
    'Investment & Impact Transformation': 'accent-investment',
    'Hybrid Workforce': 'accent-hybrid',
  };
  for (const [name, role] of Object.entries(expected)) {
    const item = page.locator(`[data-pillar-accent="${name}"]`);
    await expect(item).toContainText(name);
    await expect(item.locator('[data-accent-bar]')).toHaveCSS('background-color', computed(live[role]));
  }
});
