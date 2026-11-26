// Dumps live chesamel.com block-by-block computed styles at 1440 and 390:
// each block's background and padding, its flex and grid rows, and the size,
// weight, colour and box of its text. Writes out/live/<page>_<width>.txt.
//
//   node scripts/measure-live/measure.mjs /what-we-do/ /culture/
//   BASE=http://localhost:4321 node scripts/measure-live/measure.mjs /   (ours)
//   SHOT=1 also saves a full-page screenshot next to each text file.
//
// Live's scripts wait for the first mouse move or scroll, so it does both
// before measuring. See docs/agents/handoff.md.
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const out = new URL(`./out/${process.env.TAG ?? 'live'}/`, import.meta.url);
fs.mkdirSync(out, { recursive: true });
const base = process.env.BASE ?? 'https://chesamel.com';
const widths = (process.env.WIDTHS ?? '1440,390').split(',').map(Number);

const measure = () => {
  const vis = (e) => {
    const r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const rgb = (c) => c.replace(/rgba?\((\d+), (\d+), (\d+)(, ([\d.]+))?\)/g, (m, a, b, c2, _, al) => `${a},${b},${c2}${al ? '@' + al : ''}`);
  const bc = document.querySelector('.seoworks-breadcrumbs');
  const root = bc ? bc.parentElement : document.querySelector('.entry-content') ?? document.querySelector('main');
  const blocks = [document.querySelector('header'), ...root.children, document.querySelector('footer')].filter((e) => e && vis(e));
  const lines = [];
  for (const [i, s] of blocks.entries()) {
    const cs = getComputedStyle(s);
    const r = s.getBoundingClientRect();
    lines.push(
      `#${i} <${s.tagName.toLowerCase()} ${(s.className + '').split(' ').filter((c) => !/^(wp-container|is-layout|wp-elements)/.test(c)).slice(0, 5).join('.')}> bg ${rgb(cs.backgroundColor)} pad ${cs.paddingTop}/${cs.paddingRight}/${cs.paddingBottom}/${cs.paddingLeft} y ${Math.round(r.top + scrollY)} h ${Math.round(r.height)} w ${Math.round(r.width)}`,
    );
    // Layout rows: flex/grid containers with >=2 visible children side by side.
    let rows = 0;
    for (const e of s.querySelectorAll('*')) {
      if (rows >= 6) break;
      const c = getComputedStyle(e);
      if (!/flex|grid/.test(c.display) || !vis(e)) continue;
      const kids = [...e.children].filter(vis);
      if (kids.length < 2) continue;
      const kr = kids.map((k) => k.getBoundingClientRect());
      const same = kr.filter((k) => Math.abs(k.top - kr[0].top) < 5).length;
      const er = e.getBoundingClientRect();
      if (er.width < 250) continue;
      rows++;
      lines.push(
        `   row <${e.tagName.toLowerCase()} ${(e.className + '').split(' ').slice(0, 3).join('.')}> ${c.display} ${c.flexDirection} x ${Math.round(er.left)} w ${Math.round(er.width)} gap ${c.columnGap}/${c.rowGap} cols ${same}/${kids.length} widths ${kr.slice(0, 6).map((k) => Math.round(k.width)).join(',')} lefts ${kr.slice(0, 6).map((k) => Math.round(k.left)).join(',')} pad ${c.paddingTop}/${c.paddingRight}/${c.paddingBottom}/${c.paddingLeft} bg ${rgb(c.backgroundColor)} border ${c.borderTopWidth} ${rgb(c.borderTopColor)}`,
      );
    }
    // Text
    let n = 0;
    for (const e of s.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,a,button,blockquote,figure,img,svg,summary')) {
      if (n >= 30 || !vis(e)) continue;
      const tag = e.tagName.toLowerCase();
      if ((tag === 'a' || tag === 'li') && e.querySelector('h1,h2,h3,h4,p')) continue;
      const c = getComputedStyle(e);
      const er = e.getBoundingClientRect();
      const t = (e.textContent || e.getAttribute('alt') || '').trim().replace(/\s+/g, ' ').slice(0, 28);
      if (['img', 'svg', 'figure'].includes(tag)) {
        if (er.width < 12) continue;
        lines.push(`   ${tag} ${Math.round(er.left)},${Math.round(er.top + scrollY - r.top - scrollY)} ${Math.round(er.width)}x${Math.round(er.height)} fit ${c.objectFit} ${tag === 'svg' ? rgb(c.color) + ' ' + rgb(c.fill) : ''}`);
      } else {
        const box = /a|button|blockquote/.test(tag) || c.borderTopWidth !== '0px' || c.backgroundColor !== 'rgba(0, 0, 0, 0)' ? ` box ${Math.round(er.width)}x${Math.round(er.height)} pad ${c.paddingTop}/${c.paddingRight}/${c.paddingBottom}/${c.paddingLeft} bg ${rgb(c.backgroundColor)} bd ${c.borderTopWidth}/${c.borderBottomWidth}/${c.borderLeftWidth} ${rgb(c.borderTopColor)}/${rgb(c.borderBottomColor)}` : '';
        lines.push(`   ${tag} "${t}" ${c.fontSize}/${c.lineHeight} w${c.fontWeight} ${rgb(c.color)} ${c.fontFamily.split(',')[0].replace(/"/g, '')} x ${Math.round(er.left)} y ${Math.round(er.top - r.top)} mt ${c.marginTop} mb ${c.marginBottom}${c.listStyleType !== 'none' && tag === 'li' ? ' list ' + c.listStyleType : ''}${box}`);
      }
      n++;
    }
  }
  return `${location.pathname} @ ${innerWidth}px, doc w ${document.documentElement.scrollWidth}\n` + lines.join('\n');
};

const browser = await chromium.launch();
for (const path of process.argv.slice(2)) {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(base + path, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {});
    await page.mouse.move(100, 100);
    await page.mouse.wheel(0, 50);
    await page.waitForTimeout(2500);
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(500);
    const text = await page.evaluate(measure);
    const name = (path.replace(/\//g, '_').replace(/^_|_$/g, '') || 'home') + '_' + width;
    fs.writeFileSync(new URL(name + '.txt', out), text);
    if (process.env.SHOT) await page.screenshot({ path: new URL(name + '.png', out).pathname, fullPage: true });
    console.log(name, text.length);
    await page.close();
  }
}
await browser.close();
