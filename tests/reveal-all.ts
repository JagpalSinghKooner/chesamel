import type { Page } from '@playwright/test';

// Sections fade in as they scroll into view (Base.astro). Until then they sit
// at opacity 0, which axe would measure as failing contrast. This shows every
// Section at once, as a visitor sees them after scrolling down the page, so
// the accessibility check sees the finished page.
//
// It also turns every transition off, so a colour that is still changing
// (a button hovered or clicked just before) is measured at its end state.
export async function revealAll(page: Page) {
  await page.addStyleTag({ content: '*, ::before, ::after { transition: none !important; }' });
  await page.evaluate(() => {
    const sections = document.querySelectorAll<HTMLElement>('[data-reveal]');
    for (const section of sections) {
      section.style.transition = 'none';
      section.dataset.inView = '';
    }
  });
}
