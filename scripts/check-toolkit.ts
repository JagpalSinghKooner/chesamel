// Enforces ADR-0005's Toolkit rules on our own Components and layouts:
// no inline <svg> (use Icon or a design-system logo), no hex colours (use the
// brand tokens), no @keyframes outside the few files allowed them, and no
// Tailwind arbitrary sizes, spacing or breakpoints (use Tailwind's scale).
//
//   npm run check:toolkit
//
// Prints each violation as file:line and exits 1 if there are any. The
// Playwright spec tests/toolkit-check.spec.ts runs the same check, so
// `Build and test` fails on a violation too.

import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface Violation {
  file: string;
  line: number;
  rule: 'inline-svg' | 'hex' | 'keyframes' | 'arbitrary-value';
  text: string;
}

const CHECKED = ['src/components/', 'src/layouts/'];
// The Fulldev copies stay as delivered (ADR-0005), so no rule applies to them.
const VENDORED = 'src/components/ui/';
// Icon draws every icon; BrandmarkRings animates each ring, so it stays inline.
const SVG_ALLOWED = new Set(['src/components/Icon.astro', 'src/components/BrandmarkRings.astro']);
// global.css is outside the checked folders, so it needs no entry here.
const KEYFRAMES_ALLOWED = new Set(['src/components/BrandmarkRings.astro', 'src/components/Hero.astro']);

const rules: { rule: Violation['rule']; pattern: RegExp; skip?: Set<string> }[] = [
  { rule: 'inline-svg', pattern: /<svg[\s>]/, skip: SVG_ALLOWED },
  // Not an HTML entity (&#8217;) and not a longer word (#main, #faded).
  { rule: 'hex', pattern: /(?<![&\w])#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![\w-])/i },
  { rule: 'keyframes', pattern: /@keyframes\b/, skip: KEYFRAMES_ALLOWED },
  // p-[13px], top-[-10px], min-[1000px]:, max-[600px]: (tokens such as
  // max-w-(--container-7xl) and non-sizes such as text-[length:inherit] pass).
  { rule: 'arbitrary-value', pattern: /-\[-?\d*\.?\d+(?:px|rem|em)\]|(?<![\w-])(?:min|max)-\[/ },
];

export function findViolations(file: string, text: string): Violation[] {
  if (!CHECKED.some((dir) => file.startsWith(dir)) || file.startsWith(VENDORED)) return [];
  const found: Violation[] = [];
  text.split('\n').forEach((line, i) => {
    for (const { rule, pattern, skip } of rules) {
      if (!skip?.has(file) && pattern.test(line)) found.push({ file, line: i + 1, rule, text: line.trim() });
    }
  });
  return found;
}

const ROOT = fileURLToPath(new URL('../', import.meta.url));

async function* walk(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

export async function checkRepo(): Promise<Violation[]> {
  const found: Violation[] = [];
  for (const dir of CHECKED) {
    for await (const path of walk(join(ROOT, dir))) {
      const file = relative(ROOT, path).split(sep).join('/');
      found.push(...findViolations(file, await readFile(path, 'utf8')));
    }
  }
  return found;
}

export const formatViolation = (v: Violation) => `${v.file}:${v.line}: ${v.rule}: ${v.text}`;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const found = await checkRepo();
  for (const v of found) console.error(formatViolation(v));
  if (found.length) {
    console.error(`\n${found.length} Toolkit rule violation(s). See docs/adr/0005-build-components-on-fulldev-ui.md, Toolkit.`);
    process.exit(1);
  }
  console.log('Toolkit rules: no violations.');
}
