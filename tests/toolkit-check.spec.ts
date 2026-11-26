import { test, expect } from '@playwright/test';
import { checkRepo, findViolations, formatViolation } from '../scripts/check-toolkit';

const rules = (path: string, text: string) => findViolations(path, text).map((v) => `${v.line}:${v.rule}`);

test('an inline svg in a Component is caught, with its line', () => {
  expect(rules('src/components/Card.astro', '---\n---\n<div>\n  <svg viewBox="0 0 1 1"></svg>\n</div>')).toEqual(['4:inline-svg']);
});

test('Icon, BrandmarkRings and the Fulldev copies may draw their own svg', () => {
  for (const path of ['src/components/Icon.astro', 'src/components/BrandmarkRings.astro', 'src/components/ui/button/button.astro']) {
    expect(rules(path, '<svg viewBox="0 0 1 1"></svg>')).toEqual([]);
  }
});

test('a hex colour is caught, but entities and fragment links are not', () => {
  expect(rules('src/layouts/Base.astro', '<p style="color: #7342FF">x</p>\n<p class="bg-[#fff]">y</p>')).toEqual(['1:hex', '2:hex']);
  expect(rules('src/layouts/Base.astro', '<a href="#main">Skip</a> it&#8217;s <a href="#faded">x</a>')).toEqual([]);
});

test('@keyframes is caught outside Hero and BrandmarkRings', () => {
  const css = '<style>\n  @keyframes spin { to { transform: rotate(1turn); } }\n</style>';
  expect(rules('src/components/Spinner.astro', css)).toEqual(['2:keyframes']);
  expect(rules('src/components/Hero.astro', css)).toEqual([]);
  expect(rules('src/components/BrandmarkRings.astro', css)).toEqual([]);
});

test('arbitrary sizes, spacing and breakpoints are caught', () => {
  const bad = ['p-[13px]', 'size-[28rem]', 'xl:text-[5.25rem]', '-mt-[0.5em]', 'top-[-10px]', 'min-[1000px]:flex', 'max-[600px]:hidden'];
  for (const cls of bad) {
    expect(rules('src/components/Card.astro', `<div class="flex ${cls}"></div>`), cls).toEqual(['1:arbitrary-value']);
  }
});

test('tokens and non-size arbitrary values are allowed', () => {
  const good = 'max-w-(--container-7xl) text-[length:inherit] data-[state=active]:bg-panel max-h-[calc(100vh-5rem)] min-h-136 max-w-7xl';
  expect(rules('src/components/Card.astro', `<div class="${good}"></div>`)).toEqual([]);
});

test('a class that names a colour is caught anywhere in src/ (ADR-0006)', () => {
  const bad = ['bg-indigo', 'text-white', 'hover:text-white/60', 'border-t-light-grey', 'from-black/80', 'outline-medium-grey', 'text-gray-500', 'bg-red-600'];
  for (const cls of bad) {
    expect(rules('src/pages/index.astro', `<div class="flex ${cls}"></div>`), cls).toEqual(['1:palette-class']);
  }
});

test('theme roles are allowed', () => {
  const good = 'bg-cta text-cta-foreground border-border text-heading bg-accent-marketing-fill hover:bg-inverse/10 decoration-step-underline bg-band-dark text-current';
  expect(rules('src/components/Card.astro', `<div class="${good}"></div>`)).toEqual([]);
});

test('raw colour values are caught anywhere in src/, except theme.css', () => {
  expect(rules('src/styles/global.css', 'a { color: #7342FF; background: rgb(20 31 38); }')).toEqual(['1:hex', '1:raw-colour']);
  expect(rules('src/data/pillars.ts', "const c = 'rgba(0, 0, 0, 0.5)';")).toEqual(['1:raw-colour']);
  expect(rules('src/styles/theme.css', '--cta: rgb(194 240 15); --page: #ffffff;')).toEqual([]);
});

test('outside Components and layouts, only the colour rules apply', () => {
  expect(rules('src/pages/index.astro', '<svg></svg> p-[13px]')).toEqual([]);
  expect(rules('src/styles/global.css', '@keyframes spin {}')).toEqual([]);
});

test('src/ follows the Toolkit rules (ADR-0005) and the colour rule (ADR-0006)', async () => {
  const found = await checkRepo();
  expect(found.map(formatViolation), 'run `npm run check:toolkit` for the list').toEqual([]);
});
