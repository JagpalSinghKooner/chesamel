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
  expect(rules('src/layouts/Base.astro', '<p style="color: #7342FF">x</p>\n<p class="bg-[#fff]">y</p>')).toEqual(['1:hex', '2:hex', '2:colour-class']);
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

test('a colour class that is not a theme role is caught anywhere in src/ (ADR-0006)', () => {
  const bad = [
    // Colour names, Tailwind's and the guidelines'. Each renders nothing.
    'bg-indigo', 'text-white', 'border-t-light-grey', 'outline-medium-grey', 'text-gray-500', 'bg-red-600',
    'bg-sky-500', 'text-indigo-600', 'bg-rose-500', 'bg-lime-400', 'text-fuchsia-500', 'bg-red',
    // A typo'd role and an arbitrary colour.
    'bg-cta-hovr', 'hover:text-[white]', 'fill-[red]', 'decoration-blue', 'ring-black', 'caret-pink', 'shadow-black', 'divide-gray-200', 'via-white',
  ];
  for (const cls of bad) {
    expect(rules('src/pages/index.astro', `<div class="flex ${cls}"></div>`), cls).toEqual(['1:colour-class']);
  }
  expect(rules('src/components/Card.tsx', "const c = cn('px-4', 'bg-sky-500');")).toEqual(['1:colour-class']);
  expect(rules('src/components/Card.jsx', '<div className="text-indigo-600" />')).toEqual(['1:colour-class']);
});

test('a role with an opacity modifier is caught: a tint is a role of its own', () => {
  for (const cls of ['bg-inverse/10', 'hover:border-inverse/40', 'from-scrim/80', 'bg-primary/[0.2]']) {
    expect(rules('src/components/Card.astro', `<div class="${cls}"></div>`), cls).toEqual(['1:colour-opacity']);
  }
});

test('theme roles and non-colour utilities are allowed', () => {
  const good =
    'bg-cta text-cta-foreground border-border text-heading bg-pillar-fill text-pillar-text decoration-step-underline bg-band-dark text-current text-xl text-center border-2 border-t-4 ring-0 outline-offset-2 outline-2 bg-gradient-to-r from-hero-shade-start decoration-4 shadow-none bg-cover fill-none stroke-2 border-x';
  expect(rules('src/components/Card.astro', `<div class="${good}"></div>`)).toEqual([]);
  expect(rules('src/components/Ring.astro', '<path stroke="currentColor" stroke-width="35" fill="none" />')).toEqual([]);
});

test('colour values and keywords are caught anywhere in src/, except theme.css', () => {
  expect(rules('src/styles/global.css', 'a { color: #7342FF; background: rgb(20 31 38); }')).toEqual(['1:hex', '1:colour-function']);
  expect(rules('src/data/pillars.ts', "const c = 'rgba(0, 0, 0, 0.5)';")).toEqual(['1:colour-function']);
  expect(rules('src/styles/global.css', 'a { color: white; }')).toEqual(['1:colour-keyword']);
  expect(rules('src/components/Card.astro', '<path fill="white" />')).toEqual(['1:colour-keyword']);
  expect(rules('src/components/Card.astro', '<p style="background-color: red">x</p>')).toEqual(['1:colour-keyword']);
  expect(rules('src/styles/global.css', 'a { background: color-mix(in srgb, white 10%, transparent); }')).toEqual(['1:colour-function']);
  expect(rules('src/styles/global.css', 'a { color: var(--heading); fill: currentColor; }')).toEqual([]);
  expect(rules('src/styles/theme.css', '--cta: rgb(194 240 15); --page: #ffffff; color: white;')).toEqual([]);
});

test('outside Components and layouts, only the colour rules apply', () => {
  expect(rules('src/pages/index.astro', '<svg></svg> p-[13px]')).toEqual([]);
  expect(rules('src/styles/global.css', '@keyframes spin {}')).toEqual([]);
});

test('src/ follows the Toolkit rules (ADR-0005) and the colour rule (ADR-0006)', async () => {
  const found = await checkRepo();
  expect(found.map(formatViolation), 'run `npm run check:toolkit` for the list').toEqual([]);
});
