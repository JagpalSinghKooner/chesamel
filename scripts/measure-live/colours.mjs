// Lists every colour a page uses, grouped by what it colours: text (with the
// background behind it, size and weight), fills and borders, each with a few
// sample elements. Writes out/colours/<TAG>/<page>_<width>.txt. Used to set
// the `live` palette in src/styles/theme.css (#52).
//
//   node scripts/measure-live/colours.mjs / /what-we-do/
//   BASE=http://localhost:4321 TAG=ours node scripts/measure-live/colours.mjs /
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const base = process.env.BASE ?? 'https://chesamel.com';
const tag = process.env.TAG ?? 'live';
const widths = (process.env.WIDTHS ?? '1440,390').split(',').map(Number);
const out = new URL(`./out/colours/${tag}/`, import.meta.url);
fs.mkdirSync(out, { recursive: true });

const collect = () => {
  const rgb = (c) => c.replace(/rgba?\((\d+), (\d+), (\d+)(, ([\d.]+))?\)/g, (m, a, b, c2, _, al) => `${a},${b},${c2}${al ? '@' + al : ''}`);
  const clear = (c) => c === 'rgba(0, 0, 0, 0)' || c === 'transparent';
  const vis = (e) => {
    const r = e.getBoundingClientRect();
    const cs = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && Number(cs.opacity) > 0;
  };
  const bgOf = (e) => {
    for (let n = e; n; n = n.parentElement) {
      const c = getComputedStyle(n).backgroundColor;
      if (!clear(c)) return rgb(c);
    }
    return 'page';
  };
  const label = (e) => {
    const t = (e.innerText || e.getAttribute('aria-label') || e.getAttribute('alt') || '').trim().replace(/\s+/g, ' ').slice(0, 30);
    const cls = (e.className?.baseVal ?? e.className ?? '').toString().split(' ').filter(Boolean).slice(0, 2).join('.');
    return `<${e.tagName.toLowerCase()}${cls ? '.' + cls : ''}> "${t}" y${Math.round(e.getBoundingClientRect().top + scrollY)}`;
  };
  const groups = new Map();
  const add = (key, sample) => {
    const g = groups.get(key) ?? { n: 0, samples: [] };
    g.n++;
    if (g.samples.length < 3) g.samples.push(sample);
    groups.set(key, g);
  };
  for (const e of document.body.querySelectorAll('*')) {
    if (!vis(e) || e.closest('#wpadminbar, script, style, noscript')) continue;
    const cs = getComputedStyle(e);
    const ownText = [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (ownText) add(`text ${rgb(cs.color)} on ${bgOf(e)} ${cs.fontSize} w${cs.fontWeight}`, label(e));
    if (!clear(cs.backgroundColor)) add(`fill ${rgb(cs.backgroundColor)}`, label(e));
    for (const side of ['Top', 'Bottom', 'Left', 'Right']) {
      if (parseFloat(cs[`border${side}Width`]) > 0 && cs[`border${side}Style`] !== 'none' && !clear(cs[`border${side}Color`])) {
        add(`border ${rgb(cs[`border${side}Color`])}`, label(e));
        break;
      }
    }
    if (e.tagName.toLowerCase() === 'svg' || e.closest('svg')) {
      if (cs.fill !== 'none' && !cs.fill.startsWith('url')) add(`svg-fill ${rgb(cs.fill)}`, label(e));
      if (cs.stroke !== 'none' && !cs.stroke.startsWith('url')) add(`svg-stroke ${rgb(cs.stroke)}`, label(e));
    }
  }
  return [...groups].sort(([a], [b]) => a.localeCompare(b)).map(([k, g]) => `${k}  x${g.n}\n    ${g.samples.join('\n    ')}`).join('\n');
};

const browser = await chromium.launch();
for (const path of process.argv.slice(2)) {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    await page.goto(base + path, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await page.mouse.move(100, 100);
    await page.mouse.wheel(0, 50);
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 700) {
      await page.evaluate((y) => scrollTo(0, y), y);
      await page.waitForTimeout(100);
    }
    await page.evaluate(() => {
      scrollTo(0, 0);
      for (const e of document.querySelectorAll('[data-reveal]')) e.dataset.inView = '';
    });
    await page.waitForTimeout(1500);
    const text = await page.evaluate(collect);
    const name = (path.replace(/\//g, '_').replace(/^_|_$/g, '') || 'home') + '_' + width;
    fs.writeFileSync(new URL(name + '.txt', out), `${path} @ ${width}px\n${text}\n`);
    console.log(name, text.split('\n').length);
    await page.close();
  }
}
await browser.close();
