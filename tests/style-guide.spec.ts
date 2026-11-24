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

test('every colour token is shown on the style-guide page', async ({ page }) => {
  await page.goto('/style-guide/');
  const tokens = await page.evaluate(() => {
    const names = new Set<string>();
    for (const sheet of document.styleSheets) {
      for (const rule of sheet.cssRules) {
        const inner = rule instanceof CSSLayerBlockRule ? [...rule.cssRules] : [rule];
        for (const r of inner) {
          if (!(r instanceof CSSStyleRule) || !r.selectorText.includes(':root')) continue;
          for (const prop of r.style) if (prop.startsWith('--color-')) names.add(prop.slice('--color-'.length));
        }
      }
    }
    return [...names].sort();
  });
  const shown = colourGroups.flatMap((g) => g.colours.map((c) => c.token)).sort();
  expect(tokens).toEqual(shown);
});

test('style-guide page renders every type style', async ({ page }) => {
  await page.goto('/style-guide/');
  for (const style of ['type-heading-1', 'type-heading-2', 'type-heading-3', 'type-subheading', 'type-body', 'type-tag', 'type-caption', 'type-large-grey', 'arabic']) {
    await expect(page.locator(`[data-type-style="${style}"] p`).nth(1)).toBeVisible();
  }
});

test('brand fonts actually load on the style-guide page', async ({ page }) => {
  await page.goto('/style-guide/');
  const loaded = await page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, ''));
  });
  expect(new Set(loaded)).toEqual(new Set(['Figtree Variable', 'DM Sans Variable', 'IBM Plex Sans Arabic']));
});

test('body text is Dark Grey', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toHaveCSS('color', toRgb('#3C464D'));
});

test('style-guide page shows every logo in each permitted colour with its clear space', async ({ page }) => {
  await page.goto('/style-guide/');
  // Clear space at 48px tall, worked out by hand from the guidelines:
  // wordmark: height of "c"; lockups: width of "ch"; brandmark: page 9's corner circles.
  const expected = {
    wordmark: { colours: ['white', 'black'], padding: '36px' },
    lockup: { colours: ['white', 'black'], padding: '27px' },
    'tagline-lockup': { colours: ['white', 'black'], padding: '27px' },
    brandmark: { colours: ['white', 'black', 'indigo'], padding: '11px' },
  };
  const section = page.locator('[data-style-guide="logos"]');
  for (const [variant, { colours, padding }] of Object.entries(expected)) {
    const shown = section.locator(`[data-logo="${variant}"]`);
    expect((await shown.evaluateAll((els) => els.map((e) => e.getAttribute('data-logo-colour')))).sort()).toEqual([...colours].sort());
    await expect(shown.first()).toHaveCSS('padding-top', padding);
  }
});

test('style-guide page shows the Case Study and Industry Components', async ({ page }) => {
  await page.goto('/style-guide/');
  const components = page.locator('[data-style-guide="components"]');
  for (const name of ['case-study-card', 'case-study-slider', 'case-study-listing', 'industry-card']) {
    await expect(components.locator(`[data-component="${name}"]`).first()).toBeVisible();
  }
});

test('style-guide page shows the header, footer, hero, Pillar cards, CTA and Blog Post Components', async ({ page }) => {
  await page.goto('/style-guide/');
  const components = page.locator('[data-style-guide="components"]');
  await expect(components.locator('[data-header]')).toBeVisible();
  await expect(components.locator('footer')).toBeVisible();
  for (const name of ['hero', 'pillar-cards', 'cta', 'blog-post-card', 'blog-post-listing']) {
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
  // The brand wins over Fulldev's defaults (ADR-0002, ADR-0005): square
  // corners and an Indigo primary button.
  const primary = blocks.locator('[data-building-block="button"] [data-slot="button"]').first();
  await expect(primary).toHaveCSS('border-top-left-radius', '0px');
  await expect(primary).toHaveCSS('background-color', 'rgb(115, 66, 255)');
});
