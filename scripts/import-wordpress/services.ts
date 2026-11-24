// Turns the WordPress `services` items into Pillar and Service files.
//
// /services/<pillar>/ is a Pillar (one of the six service areas) and
// /services/<pillar>/<service>/ one of its Services. WordPress stores each as
// a whole page of theme blocks, so the copy is read section by section: every
// h2 starts a section, and its heading says which kind of Section it becomes.
// A heading this importer doesn't know is reported, never guessed.

import { asWxr, decodeEntities, type Wxr, type WxrSource } from './wxr.ts';
import { localiseUrls } from './html.ts';
import { pillarSlugs, type PillarSlug } from '../../src/data/taxonomy.ts';
import type { PillarFile, ServiceFile, SectionFile as Section } from '../../src/content/page-schemas.ts';

export interface Imported<T> {
  address: string;
  file: string;
  data: T;
  body: string;
}

export interface ServicesImport {
  pillars: Imported<PillarFile>[];
  services: Imported<ServiceFile>[];
  media: string[];
  unreadable: { address: string; reason: string }[];
}

type Image = { src: string; alt: string };
type Token =
  | { tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'li'; text: string }
  | { tag: 'img'; image: Image }
  | { tag: 'button'; text: string; href: string }
  | { tag: 'card'; attrs: { title?: string; content?: string; imageId?: number } }
  | { tag: 'link'; href: string }
  | { tag: 'reusable'; ref: number }
  | { tag: 'breadcrumbs' };

const TOKEN =
  /<(h[1-6]|p|li)\b[^>]*>([\s\S]*?)<\/\1>|<img\b([^>]*)>|<a\b[^>]*class="[^"]*wp-block-button__link[^"]*"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>|<!-- wp:seoworks\/card (\{.*?\}) \/?-->|<!-- wp:group \{.*?"linkSettings":\{"url":"([^"]*)"\}.*?-->|<!-- wp:block \{"ref":(\d+)\} \/-->|<!-- wp:seoworks\/breadcrumbs\b/g;

const attr = (attrs: string, name: string) => attrs.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] ?? '';
export const plain = (html: string) => decodeEntities(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();

// The live site still links the Pillars' old addresses, which only redirect.
const OLD_PILLARS: Record<string, PillarSlug> = {
  'marketing-experience': 'marketing-engine',
  'marketing-transformation': 'marketing-engine',
  'digital-evolution': 'digital-transformation',
  'business-transformation': 'digital-transformation',
  'people-performance': 'hybrid-workforce',
  'workforce-transformation': 'hybrid-workforce',
  'esg-solutions': 'investment-impact-transformation',
};

export function siteLink(href: string): string {
  const local = localiseUrls(href).replace(/^https?:\/\/(www\.)?chesamel\.com(?=\/)/, '');
  return local.replace(/^\/services\/([^/]+)\//, (whole, slug: string) => (OLD_PILLARS[slug] ? `/services/${OLD_PILLARS[slug]}/` : whole));
}

function tokens(html: string): Token[] {
  const out: Token[] = [];
  for (const m of html.matchAll(TOKEN)) {
    if (m[1]) {
      const text = plain(m[2]);
      if (text) out.push({ tag: m[1] as 'p', text });
    } else if (m[3] !== undefined) out.push({ tag: 'img', image: { src: localiseUrls(attr(m[3], 'src')), alt: decodeEntities(attr(m[3], 'alt')) } });
    else if (m[4] !== undefined) out.push({ tag: 'button', href: siteLink(m[4]), text: plain(m[5]) });
    else if (m[6]) out.push({ tag: 'card', attrs: JSON.parse(m[6]) });
    else if (m[7] !== undefined) out.push({ tag: 'link', href: m[7] });
    else if (m[8]) out.push({ tag: 'reusable', ref: Number(m[8]) });
    else out.push({ tag: 'breadcrumbs' });
  }
  return out;
}

// Placeholder copy the live site shows by mistake.
const PLACEHOLDERS = [/^Quote on your ethos/];
const real = (text: string) => !PLACEHOLDERS.some((p) => p.test(text));

const texts = (ts: Token[], tag: 'p' | 'li') => ts.flatMap((t) => (t.tag === tag && real(t.text) ? [t.text] : []));
const firstImage = (ts: Token[]) => ts.find((t): t is Extract<Token, { tag: 'img' }> => t.tag === 'img')?.image;
const buttons = (ts: Token[]) => ts.flatMap((t) => (t.tag === 'button' ? [{ label: t.text, href: t.href }] : []));

// h5 cards, each with the paragraph after it and, if its group links
// somewhere, that address.
function cardItems(ts: Token[]) {
  return ts.flatMap((t, i) => {
    if (t.tag !== 'h5') return [];
    const next = ts[i + 1];
    const link = ts[i - 1]?.tag === 'link' ? (ts[i - 1] as { href: string }).href : '';
    return [{ heading: t.text, ...(next?.tag === 'p' && { text: next.text }), ...(link && { href: siteLink(link) }) }];
  });
}

class Unreadable extends Error {}

interface Chunk {
  heading: string;
  own: Token[];
  // Images just before the heading: WordPress puts a section's side image first.
  leading: Image | undefined;
}

function chunks(body: Token[]): { before: Token[]; chunks: Chunk[] } {
  const starts = body.flatMap((t, i) => (t.tag === 'h2' ? [i] : []));
  const result: Chunk[] = [];
  starts.forEach((start, n) => {
    const end = starts[n + 1] ?? body.length;
    const heading = (body[start] as { text: string }).text;
    const own = body.slice(start + 1, end);
    // The live Industries slider repeats its heading.
    if (result.at(-1)?.heading === heading) {
      result.at(-1)!.own.push(...own);
      return;
    }
    let k = start - 1;
    while (k >= 0 && body[k].tag === 'img') k--;
    result.push({ heading, own, leading: start - 1 > k ? (body[start - 1] as { image: Image }).image : undefined });
  });
  return { before: body.slice(0, starts[0] ?? body.length), chunks: result };
}

const optional = <K extends string>(key: K, value: string | undefined) => (value ? ({ [key]: value } as Record<K, string>) : {});

function readSection(c: Chunk, pillar: PillarSlug, wxr: Wxr, isLast: boolean): Section | undefined {
  const h = c.heading;
  const paragraphs = texts(c.own, 'p').filter((p) => !p.startsWith('/ '));
  if (isLast) return { type: 'cta', heading: h, ...optional('text', paragraphs[0]) };
  if (/^(how we work|our process)$/i.test(h)) {
    const items = texts(c.own, 'li');
    return { type: 'points', heading: h, items, ...optional('note', paragraphs[0]) } as Section;
  }
  if (/capabilities|workstreams|^related services$/i.test(h)) {
    const image = firstImage(c.own) ?? c.leading;
    return { type: 'cards', heading: h, ...(image && { image }), tone: 'off-white', items: cardItems(c.own) } as Section;
  }
  if (/exploratory assessment/i.test(h)) {
    const image = firstImage(c.own);
    return { type: 'intro', heading: h, paragraphs, ...(image && { image }), links: buttons(c.own) } as Section;
  }
  if (/case studies/i.test(h)) return { type: 'caseStudies', heading: h, ...optional('text', paragraphs[0]), pillar };
  if (/delivery models|solutions approach/i.test(h)) {
    const cards = c.own.filter((t): t is Extract<Token, { tag: 'card' }> => t.tag === 'card');
    const items = cards.map(({ attrs }) => {
      const url = attrs.imageId ? wxr.byId.get(String(attrs.imageId))?.attachmentUrl : undefined;
      return { heading: decodeEntities(attrs.title ?? ''), text: decodeEntities(attrs.content ?? ''), ...(url && { image: { src: localiseUrls(url), alt: '' } }) };
    });
    return { type: 'deliveryModels', heading: h, ...optional('text', paragraphs[0]), ...(items.length && { items }) };
  }
  if (/^industries$/i.test(h)) return { type: 'industries', heading: h };
  if (/^elevate your business$/i.test(h)) return { type: 'brands', heading: h };
  if (/insights$/i.test(h)) return { type: 'insights', heading: h, ...optional('text', paragraphs[0]), pillar };
  throw new Unreadable(`unknown section "${h}"`);
}

// The client logo strip (reusable block 506) sits between sections.
const LOGO_STRIP = 506;

function readPage(html: string, pillar: PillarSlug, wxr: Wxr, unknown: (reason: string) => void) {
  const all = tokens(html);
  const crumbs = all.findIndex((t) => t.tag === 'breadcrumbs');
  const hero = all.slice(0, crumbs < 0 ? 0 : crumbs);
  const h1 = hero.find((t) => t.tag === 'h1');
  if (!h1 || h1.tag !== 'h1') throw new Unreadable('no title');
  const { before, chunks: parts } = chunks(all.slice(crumbs + 1));
  const sections: Section[] = [];
  // A stats strip under the breadcrumb: a figure, then its "/ …" label.
  const stats = before.flatMap((t, i) => {
    const label = before[i + 1];
    return t.tag === 'p' && !t.text.startsWith('/ ') && label?.tag === 'p' && label.text.startsWith('/ ') ? [{ value: t.text, label: label.text }] : [];
  });
  if (stats.length) sections.push({ type: 'stats', items: stats });
  parts.forEach((c, n) => {
    try {
      const section = readSection(c, pillar, wxr, n === parts.length - 1);
      if (section) sections.push(section);
    } catch (err) {
      if (!(err instanceof Unreadable)) throw err;
      unknown(err.message);
    }
    if (c.own.some((t) => t.tag === 'reusable' && t.ref === LOGO_STRIP)) sections.push({ type: 'logos' });
  });
  return {
    hero: { title: h1.text, paragraphs: texts(hero, 'p'), links: buttons(hero) },
    sections,
  };
}

const ORDER: PillarSlug[] = ['digital-transformation', 'marketing-engine', 'investment-impact-transformation', 'hybrid-workforce', 'ai-machine-learning', 'bi-data-analytics'];

export function importServices(source: WxrSource): ServicesImport {
  const wxr = asWxr(source);
  const result: ServicesImport = { pillars: [], services: [], media: [], unreadable: [] };
  const media = new Set<string>();
  const serviceCount = new Map<string, number>();

  const items = wxr.items.filter((i) => i.type === 'services' && i.status === 'publish').sort((a, b) => Number(a.id) - Number(b.id));
  for (const item of items) {
    const address = new URL(item.link).pathname;
    const [, , pillar, service] = address.split('/');
    // Only English pages: an Arabic copy lives under /ar/ (#14).
    if (!address.startsWith('/services/') || !(pillarSlugs as readonly string[]).includes(pillar)) continue;
    const slug = pillar as PillarSlug;
    try {
      const page = readPage(item.content, slug, wxr, (reason) => result.unreadable.push({ address, reason }));
      for (const src of JSON.stringify(page).match(/\/wp-content\/uploads\/[^"]+/g) ?? []) media.add(`https://chesamel.com${src}`);
      const description = decodeEntities(item.meta._yoast_wpseo_metadesc ?? '').trim();
      const common = { title: page.hero.title, ...(description && { description }), hero: page.hero, sections: page.sections };
      if (!service) {
        result.pillars.push({ address, file: `src/content/pillars/${slug}.md`, body: '', data: { ...common, colour: item.meta.service_color, order: ORDER.indexOf(slug) + 1 } });
      } else {
        const order = (serviceCount.get(slug) ?? 0) + 1;
        serviceCount.set(slug, order);
        result.services.push({ address, file: `src/content/services/${slug}/${service}.md`, body: '', data: { ...common, pillar: slug, order } });
      }
    } catch (err) {
      if (!(err instanceof Unreadable)) throw err;
      result.unreadable.push({ address, reason: err.message });
    }
  }
  result.media = [...media].sort();
  return result;
}
