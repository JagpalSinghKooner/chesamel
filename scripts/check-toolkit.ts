// Enforces ADR-0005's Toolkit rules on our own Components and layouts:
// no inline <svg> (use Icon or a design-system logo), no @keyframes outside
// the few files allowed them, and no Tailwind arbitrary sizes, spacing or
// breakpoints (use Tailwind's scale).
//
// And ADR-0006's colour rule, everywhere in src/ except src/styles/theme.css,
// the one file that holds colours:
//   - every colour utility (bg-, text-, border-, ring-, outline-, fill-,
//     stroke-, decoration-, accent-, caret-, from-, via-, to-, divide-,
//     placeholder-, shadow- and the like) names a theme role defined in
//     theme.css. A colour name (bg-sky-500, text-white), a typo (bg-cta-hovr)
//     or an arbitrary colour (text-[white]) renders nothing, so it fails here;
//   - no opacity modifier on a colour (bg-inverse/10): a tint is a role too;
//   - no hex, rgb(), hsl(), oklch(), color-mix() or other colour function;
//   - no CSS colour keyword in a style or attribute (color: white, fill="red").
//
//   npm run check:toolkit
//
// Prints each violation as file:line and exits 1 if there are any. The
// Playwright spec tests/toolkit-check.spec.ts runs the same check, so
// `Build and test` fails on a violation too.

import { readFileSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface Violation {
  file: string;
  line: number;
  rule: 'inline-svg' | 'hex' | 'colour-function' | 'colour-keyword' | 'colour-class' | 'colour-opacity' | 'keyframes' | 'arbitrary-value';
  text: string;
}

const ROOT = fileURLToPath(new URL('../', import.meta.url));

const CHECKED = ['src/components/', 'src/layouts/'];
// The colour rules cover all of src/, except the one file that holds colours.
const COLOUR_CHECKED = 'src/';
const THEME = 'src/styles/theme.css';
// The Fulldev copies stay as delivered (ADR-0005), so no rule applies to them.
const VENDORED = 'src/components/ui/';
// Icon draws every icon; BrandmarkRings animates each ring, so it stays inline.
const SVG_ALLOWED = new Set(['src/components/Icon.astro', 'src/components/BrandmarkRings.astro']);
// global.css is outside the checked folders, so it needs no entry here.
const KEYFRAMES_ALLOWED = new Set(['src/components/BrandmarkRings.astro', 'src/components/Hero.astro']);
// Code and styles, where classes live. Content (Markdown) is prose, so only
// raw colour values are looked for there.
const CODE = /\.(?:astro|ts|tsx|js|jsx|mjs|css|html)$/;

const rules: { rule: Violation['rule']; pattern: RegExp; skip?: Set<string> }[] = [
  { rule: 'inline-svg', pattern: /<svg[\s>]/, skip: SVG_ALLOWED },
  { rule: 'keyframes', pattern: /@keyframes\b/, skip: KEYFRAMES_ALLOWED },
  // p-[13px], top-[-10px], min-[1000px]:, max-[600px]: (tokens such as
  // max-w-(--container-7xl) and non-sizes such as text-[length:inherit] pass).
  { rule: 'arbitrary-value', pattern: /-\[-?\d*\.?\d+(?:px|rem|em)\]|(?<![\w-])(?:min|max)-\[/ },
];

// ---- Colour ----

// Every colour utility theme.css defines: `--color-<name>` in its @theme blocks.
export function themeRoles(css: string): Set<string> {
  return new Set([...css.matchAll(/--color-([\w-]+)\s*:/g)].map((m) => m[1]).filter((name) => name !== '*'));
}
// theme.css also maps `black` to the scrim role, for the Fulldev copies'
// `bg-black/10` overlays only (ADR-0005), so our code may not use it.
const VENDOR_ONLY = ['black'];
const ROLES = new Set([...themeRoles(readFileSync(join(ROOT, THEME), 'utf8'))].filter((r) => !VENDOR_ONLY.includes(r)));

const rawRules: { rule: Violation['rule']; pattern: RegExp }[] = [
  // Not an HTML entity (&#8217;) and not a longer word (#main, #faded).
  { rule: 'hex', pattern: /(?<![&\w])#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![\w-])/i },
  { rule: 'colour-function', pattern: /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color-mix|color)\(/i },
];

// A colour property or attribute set to a word: color: white, fill="red".
const COLOUR_PROPERTY =
  /\b(?:color|background(?:-color)?|border(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?-color|outline-color|text-decoration-color|column-rule-color|accent-color|caret-color|fill|stroke|stop-color|flood-color|lighting-color)\s*[:=]\s*["'{`]?\s*([a-z][a-z-]*)(?![\w(-])/gi;
const NOT_A_COLOUR = new Set(['var', 'currentcolor', 'inherit', 'initial', 'unset', 'revert', 'transparent', 'none', 'url', 'auto']);

// Tailwind's colour utilities. `border-x`, `border-t` and the like take a side.
const COLOUR_UTILITY =
  /^-?(bg|text|border(?:-[xytrblse])?|outline|ring|ring-offset|inset-ring|fill|stroke|decoration|accent|caret|from|via|to|divide|placeholder|shadow|inset-shadow|drop-shadow)-(.+)$/;

// The same utilities' values that are not colours.
const sizes = ['2xs', 'xs', 'sm', 'base', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl'];
const NON_COLOUR: Record<string, string[]> = {
  bg: ['none', 'fixed', 'local', 'scroll', 'auto', 'cover', 'contain', 'center', 'top', 'bottom', 'left', 'right', 'left-top', 'left-bottom', 'right-top', 'right-bottom', 'repeat', 'repeat-x', 'repeat-y', 'repeat-round', 'repeat-space', 'no-repeat', 'radial', 'conic'],
  text: [...sizes, 'left', 'center', 'right', 'justify', 'start', 'end', 'wrap', 'nowrap', 'balance', 'pretty', 'ellipsis', 'clip'],
  border: ['solid', 'dashed', 'dotted', 'double', 'hidden', 'none', 'collapse', 'separate', 'x', 'y', 't', 'r', 'b', 'l', 's', 'e'],
  outline: ['none', 'hidden', 'solid', 'dashed', 'dotted', 'double'],
  ring: ['inset'],
  'inset-ring': [],
  'ring-offset': [],
  fill: ['none', 'rule'],
  // stroke-width="35" and the like, as SVG attributes.
  stroke: ['none', 'width', 'linecap', 'linejoin', 'dasharray', 'dashoffset', 'miterlimit', 'opacity'],
  decoration: ['solid', 'double', 'dotted', 'dashed', 'wavy', 'auto', 'from-font', 'clone', 'slice'],
  accent: ['auto'],
  caret: ['auto'],
  from: [],
  via: [],
  to: [],
  divide: ['x', 'y', 'x-reverse', 'y-reverse', 'solid', 'dashed', 'dotted', 'double', 'none'],
  placeholder: [],
  shadow: [...sizes, 'none', 'inner'],
  'inset-shadow': [...sizes, 'none'],
  'drop-shadow': [...sizes, 'none'],
};
const NON_COLOUR_PREFIX: Record<string, string[]> = {
  bg: ['clip-', 'origin-', 'blend-', 'gradient-to-', 'linear-', 'radial-', 'conic-', 'position-', 'size-'],
  border: ['spacing-'],
  outline: ['offset-'],
};
const ALWAYS = new Set(['current', 'inherit', 'transparent']);

// The candidate class names on a line: anything between spaces, quotes and
// the punctuation of class:list arrays and objects.
const tokens = (line: string) => line.split(/[\s'"`{},;=]+/).filter(Boolean);

// The utility part of a class: after its variants (hover:, md:, group-hover/x:),
// without a ! for important.
function utilityOf(raw: string): string {
  // Brackets and parentheses left over from the code around a class.
  let token = raw.replace(/^[[(]+(?=[a-z!-])/, '');
  const count = (c: string) => token.split(c).length - 1;
  while (/[\])]$/.test(token) && count(token.endsWith(']') ? ']' : ')') > count(token.endsWith(']') ? '[' : '(')) token = token.slice(0, -1);
  let depth = 0;
  let start = 0;
  for (let i = 0; i < token.length; i++) {
    const c = token[i];
    if (c === '[' || c === '(') depth++;
    else if (c === ']' || c === ')') depth--;
    else if (c === ':' && depth === 0) start = i + 1;
  }
  return token.slice(start).replace(/^!|!$/g, '');
}

export function colourClassProblem(token: string, roles: Set<string> = ROLES): Violation['rule'] | undefined {
  const utility = utilityOf(token);
  const m = utility.match(COLOUR_UTILITY);
  if (!m) return undefined;
  const kind = m[1].startsWith('border') ? 'border' : m[1];
  let value = m[2];
  const alpha = value.match(/^(.*?)\/(\d+|\[[^\]]*\]|\([^)]*\))$/);
  if (alpha) value = alpha[1];
  if (roles.has(value) || ALWAYS.has(value)) return alpha ? 'colour-opacity' : undefined;
  if (NON_COLOUR[kind]?.includes(value) || NON_COLOUR_PREFIX[kind]?.some((p) => value.startsWith(p))) return undefined;
  // Widths, sizes and stops: border-2, ring-offset-2, from-10%, decoration-4.
  if (/^\d/.test(value)) return undefined;
  // Arbitrary values: only non-colours, such as text-[length:inherit].
  if (/^[[(](?:length|url|number|percentage|image|position|size|family-name|weight):/.test(value) || /^\[url\(|^\[\d|^\(--(?:spacing|container|radius|text|tw-)/.test(value)) return undefined;
  return 'colour-class';
}

function colourViolations(file: string, line: string): Violation['rule'][] {
  const found: Violation['rule'][] = [];
  for (const { rule, pattern } of rawRules) if (pattern.test(line)) found.push(rule);
  if (!CODE.test(file)) return found;
  for (const m of line.matchAll(COLOUR_PROPERTY)) {
    if (!NOT_A_COLOUR.has(m[1].toLowerCase())) {
      found.push('colour-keyword');
      break;
    }
  }
  // Comments may name a role in passing (`border-strong`); they render nothing.
  if (/^\s*(?:\/\/|\/\*|\*|\{\/\*|<!--)/.test(line)) return found;
  for (const token of tokens(line)) {
    const problem = colourClassProblem(token);
    if (problem && !found.includes(problem)) found.push(problem);
  }
  return found;
}

export function findViolations(file: string, text: string): Violation[] {
  if (file.startsWith(VENDORED)) return [];
  const toolkit = CHECKED.some((dir) => file.startsWith(dir));
  const colour = file.startsWith(COLOUR_CHECKED) && file !== THEME;
  const found: Violation[] = [];
  text.split('\n').forEach((line, i) => {
    if (colour) for (const rule of colourViolations(file, line)) found.push({ file, line: i + 1, rule, text: line.trim() });
    if (!toolkit) return;
    for (const { rule, pattern, skip } of rules) {
      if (!skip?.has(file) && pattern.test(line)) found.push({ file, line: i + 1, rule, text: line.trim() });
    }
  });
  return found;
}

async function* walk(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

// Images and fonts are not text, so they are not read.
const TEXT = /\.(?:astro|ts|tsx|js|jsx|mjs|css|md|mdx|json|html|svg)$/;

export async function checkRepo(): Promise<Violation[]> {
  const found: Violation[] = [];
  for await (const path of walk(join(ROOT, COLOUR_CHECKED))) {
    const file = relative(ROOT, path).split(sep).join('/');
    if (TEXT.test(file)) found.push(...findViolations(file, await readFile(path, 'utf8')));
  }
  return found;
}

export const formatViolation = (v: Violation) => `${v.file}:${v.line}: ${v.rule}: ${v.text}`;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const found = await checkRepo();
  for (const v of found) console.error(formatViolation(v));
  if (found.length) {
    console.error(`\n${found.length} Toolkit rule violation(s). See docs/adr/0005-build-components-on-fulldev-ui.md, Toolkit, and docs/adr/0006-copy-live-colours-through-theme-roles.md.`);
    process.exit(1);
  }
  console.log('Toolkit rules: no violations.');
}
