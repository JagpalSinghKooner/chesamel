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
  const good = 'max-w-(--container-7xl) text-[length:inherit] data-[state=active]:bg-white max-h-[calc(100vh-5rem)] min-h-136 max-w-7xl';
  expect(rules('src/components/Card.astro', `<div class="${good}"></div>`)).toEqual([]);
});

test('files outside Components and layouts are not checked', () => {
  expect(rules('src/pages/index.astro', '<svg></svg> #7342FF p-[13px]')).toEqual([]);
  expect(rules('src/styles/global.css', '@keyframes spin {} #7342FF')).toEqual([]);
});

test('our Components and layouts follow the Toolkit rules (ADR-0005)', async () => {
  const found = await checkRepo();
  expect(found.map(formatViolation), 'run `npm run check:toolkit` for the list').toEqual([]);
});
