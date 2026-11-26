// Screenshots whole pages in 2000px segments, at 1440 and 390, into
// out/shots/<TAG>/<page>_<width>_<n>.png, for compare.py.
//
//   node scripts/measure-live/shots.mjs /what-we-do/                 (live)
//   BASE=http://localhost:4321 TAG=ours node scripts/measure-live/shots.mjs /what-we-do/
//
// WIDTHS=1440 limits the widths, ONLY=0,1 the segments, MOTION=1 keeps motion on.
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const base = process.env.BASE ?? 'https://chesamel.com';
const tag = process.env.TAG ?? 'live';
const widths = (process.env.WIDTHS ?? '1440,390').split(',').map(Number);
const seg = Number(process.env.SEG ?? 2000);
const dir = new URL(`./out/shots/${tag}/`, import.meta.url);
fs.mkdirSync(dir, { recursive: true });
const browser = await chromium.launch();
for (const path of process.argv.slice(2)) {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: process.env.MOTION ? 'no-preference' : 'reduce' });
    await page.goto(base + path, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await page.mouse.move(100, 100);
    await page.mouse.wheel(0, 50);
    // Scroll through so lazy images and reveals load.
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 700) {
      await page.evaluate((y) => scrollTo(0, y), y);
      await page.waitForTimeout(120);
    }
    await page.evaluate(() => {
      scrollTo(0, 0);
      for (const e of document.querySelectorAll('[data-reveal]')) e.dataset.inView = '';
    });
    await page.waitForTimeout(1200);
    const full = await page.evaluate(() => document.documentElement.scrollHeight);
    const name = (path.replace(/\//g, '_').replace(/^_|_$/g, '') || 'home') + '_' + width;
    const only = process.env.ONLY ? process.env.ONLY.split(',').map(Number) : null;
    for (let i = 0, y = 0; y < full; i++, y += seg) {
      if (only && !only.includes(i)) continue;
      await page.screenshot({ path: new URL(`${name}_${i}.png`, dir).pathname, fullPage: true, clip: { x: 0, y, width, height: Math.min(seg, full - y) } });
    }
    console.log(name, full);
    await page.close();
  }
}
await browser.close();
