import { test, expect, type Page } from '@playwright/test';

// Motion on the site: the homepage hero's video and word slider, the client
// logo strip, the brandmark rings, Sections revealed on scroll, and sliders.
// Anything that moves for more than 5 seconds can be paused (WCAG 2.2.2), and
// nothing moves for visitors who ask for less motion.

const hero = (page: Page) => page.locator('[data-component="hero"]');
const word = (page: Page) => hero(page).locator('[data-hero-word]');
const logos = (page: Page) => page.locator('[data-component="client-logos"]');

test.describe('with motion', () => {
  test('the hero word slider moves on, and its pause button stops it and the video', async ({ page }) => {
    await page.clock.install();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    // Screen readers always hear the first word, whichever is showing.
    await expect(hero(page).getByRole('heading', { level: 1 })).toHaveAccessibleName('Global Business Transformation');

    // The installed clock still ticks, so read the word rather than assume it.
    const first = await word(page).textContent();
    await page.clock.runFor(4100);
    await expect(word(page)).not.toHaveText(first!);

    const video = hero(page).locator('video');
    await expect(video).toHaveAttribute('src', '/video/hero.mp4');

    const pause = hero(page).getByRole('button', { name: 'Pause animation' });
    await pause.click();
    await expect(pause).toHaveAttribute('aria-pressed', 'true');
    expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
    await page.clock.runFor(1000);
    const paused = await word(page).textContent();
    await page.clock.runFor(10_000);
    await expect(word(page)).toHaveText(paused!);

    await pause.click();
    await expect(pause).toHaveAttribute('aria-pressed', 'false');
    await page.clock.runFor(4100);
    await expect(word(page)).not.toHaveText(paused!);
  });

  test('phones get the poster frame, not the video', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(hero(page).locator('img[data-hero-poster]')).toBeVisible();
    await expect(hero(page).locator('video')).toHaveCount(0);
  });

  test('the client logo strip scrolls and can be paused', async ({ page }) => {
    await page.goto('/');
    const viewport = logos(page).locator('[data-marquee-viewport]');
    await expect(viewport).toHaveAttribute('data-active', '');
    const toggle = logos(page).getByRole('button', { name: 'Pause the client logos' });
    await toggle.click();
    await expect(logos(page).getByRole('button', { name: 'Play the client logos' })).toBeVisible();
    const at = await viewport.locator('> div').evaluate((e) => getComputedStyle(e).transform);
    await page.waitForTimeout(500);
    expect(await viewport.locator('> div').evaluate((e) => getComputedStyle(e).transform)).toBe(at);
  });

  test('the brandmark rings stop turning within 5 seconds', async ({ page }) => {
    await page.goto('/who-we-are/');
    const timings = await page
      .locator('[data-component="page-hero"] .brandmark-rings path')
      .first()
      .evaluate((path) => path.getAnimations().map((a) => a.effect!.getComputedTiming()));
    expect(timings.length).toBeGreaterThan(0);
    for (const t of timings) {
      expect(t.iterations).toBe(1);
      expect(Number(t.duration)).toBeLessThan(5000);
    }
  });
});

test.describe('under prefers-reduced-motion', () => {
  test.use({ colorScheme: 'light' });
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('nothing on the homepage moves', async ({ page }) => {
    await page.clock.install();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    // No video, no word slider, so no pause button is needed.
    await expect(hero(page).locator('video')).toHaveCount(0);
    await expect(hero(page).getByRole('button', { name: 'Pause animation' })).toBeHidden();
    await page.clock.runFor(10_000);
    await expect(word(page)).toHaveText('Business');

    // The logo strip is a still row.
    await expect(logos(page).locator('[data-marquee-viewport]')).not.toHaveAttribute('data-active', '');

    // Sections are shown at once, not faded in.
    expect(await page.evaluate(() => document.documentElement.classList.contains('motion'))).toBe(false);
    const last = page.locator('main > *').last();
    await expect(last).toHaveCSS('opacity', '1');

    // Nothing animates for longer than a frame: the reduced-motion rule cuts
    // any transition that still fires to 0.01ms.
    const running = await page.evaluate(() =>
      document
        .getAnimations()
        .filter((a) => a.playState === 'running' && Number(a.effect!.getComputedTiming().duration) > 1)
        .map((a) => `${(a as CSSAnimation).animationName ?? (a as CSSTransition).transitionProperty} on ${(a.effect as KeyframeEffect).target?.outerHTML.slice(0, 80)} ${a.effect!.getComputedTiming().duration}`),
    );
    expect(running).toEqual([]);
  });

  test('the brandmark rings stay still', async ({ page }) => {
    await page.goto('/who-we-are/');
    const animations = await page.locator('.brandmark-rings path').first().evaluate((path) => path.getAnimations().length);
    expect(animations).toBe(0);
  });
});

test.describe('Slider', () => {
  const approach = (page: Page) => page.locator('[data-component="section-cards"]', { hasText: 'Our Approach' }).locator('[data-slider]');

  test('works by keyboard: its buttons, the arrow keys, Home and End', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/who-we-are/');
    const slider = approach(page);
    await slider.scrollIntoViewIfNeeded();
    const counter = slider.locator('[data-slide-count]');
    await expect(counter).toHaveText('1 / 5');

    const next = slider.getByRole('button', { name: 'Next' });
    await next.focus();
    await page.keyboard.press('Enter');
    await expect(counter).toHaveText('2 / 5');

    await page.keyboard.press('ArrowRight');
    await expect(counter).toHaveText('3 / 5');
    await page.keyboard.press('ArrowLeft');
    await expect(counter).toHaveText('2 / 5');
    await page.keyboard.press('End');
    await expect(counter).toHaveText('5 / 5');
    await page.keyboard.press('Home');
    await expect(counter).toHaveText('1 / 5');
  });

  test('every slider named in the ticket is a slider', async ({ page }) => {
    const sliders: [string, string][] = [
      ['/', 'What’s holding your business back?'],
      ['/who-we-are/', 'Our Approach'],
      ['/who-we-are/', 'Our leadership'],
      ['/what-we-do/', 'How we deliver solutions based on your business transformation requirements'],
      ['/who-we-are/network/', 'Our Partner Brands'],
      ['/contact/', 'Other offices'],
      ['/who-we-are/our-team/', 'Latest Insights'],
    ];
    for (const [path, name] of sliders) {
      await page.goto(path);
      await expect(page.getByRole('group', { name }).and(page.locator('[data-slider]')), `${name} on ${path}`).toHaveCount(1);
    }
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('a slider is a row that scrolls sideways, and every Section shows', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/who-we-are/');
    const slider = page.locator('[data-component="section-cards"]', { hasText: 'Our Approach' }).locator('[data-slider]');
    const viewport = slider.locator('[data-carousel-viewport]');
    await expect(viewport).toHaveCSS('overflow-x', 'auto');
    expect(await viewport.evaluate((e) => e.scrollWidth > e.clientWidth)).toBe(true);
    await expect(slider.locator('[data-controls]')).toBeHidden();
    await expect(page.locator('main > *').last()).toHaveCSS('opacity', '1');
  });
});
