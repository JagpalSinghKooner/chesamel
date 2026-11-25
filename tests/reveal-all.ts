import type { Page } from '@playwright/test';

// Sections fade in as they scroll into view (Base.astro). Until then they sit
// at opacity 0, which axe would measure as failing contrast. This shows every
// Section at once, as a visitor sees them after scrolling down the page, so
// the accessibility check sees the finished page.
export async function revealAll(page: Page) {
  await page.evaluate(() => {
    const sections = document.querySelectorAll<HTMLElement>('[data-reveal]');
    for (const section of sections) {
      section.style.transition = 'none';
      section.dataset.inView = '';
    }
  });
}
