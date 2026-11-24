// Turns the WordPress industries items into Industry files.
//
// WordPress stores each Industry page as a whole page of theme blocks, not as
// an article, so its copy is read section by section (each section starts with
// a "/ …" eyebrow) into frontmatter, and the page template lays it out. Each
// Industry's card (image and one-line summary) comes from the "Industries
// Grid" reusable block, whose order is the order cards are shown in.

import { parseWxr, decodeEntities } from './wxr.ts';
import { localiseUrls } from './html.ts';

import type { IndustryData } from '../../src/content/case-study-schema.ts';

export type { IndustryData };
type Image = IndustryData['card']['image'];

export interface ImportedIndustry {
  address: string;
  file: string;
  data: IndustryData;
  // Industries have no article; the page is all frontmatter.
  body: string;
}

export interface IndustryImport {
  industries: ImportedIndustry[];
  media: string[];
  // Pages whose blocks no longer have the expected sections.
  unreadable: { address: string; reason: string }[];
}

type Token = { tag: string; text: string; src: string; alt: string };

const TOKEN = /<(h[1-6]|p)\b[^>]*>([\s\S]*?)<\/\1>|<img\b([^>]*)>/g;
const attr = (attrs: string, name: string) => attrs.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] ?? '';
const text = (html: string) => decodeEntities(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();

function tokens(html: string): Token[] {
  return [...html.matchAll(TOKEN)].map((m) =>
    m[1] ? { tag: m[1], text: text(m[2]), src: '', alt: '' } : { tag: 'img', text: '', src: attr(m[3], 'src'), alt: decodeEntities(attr(m[3], 'alt')) },
  );
}

class Unreadable extends Error {}

const image = (t: Token | undefined, what: string): Image => {
  if (t?.tag !== 'img' || !t.src) throw new Unreadable(`no image for ${what}`);
  return { src: localiseUrls(t.src), alt: t.alt };
};

const isEyebrow = (t: Token) => t.tag === 'p' && t.text.startsWith('/ ');

// A section: its "/ …" eyebrow, the h2 after it, and the non-empty paragraphs
// up to the next heading or eyebrow.
function section(all: Token[], eyebrow: RegExp) {
  const start = all.findIndex((t) => isEyebrow(t) && eyebrow.test(t.text));
  if (start < 0 || all[start + 1]?.tag !== 'h2') throw new Unreadable(`no section ${eyebrow.source}`);
  const paragraphs: string[] = [];
  let end = start + 2;
  for (; end < all.length && all[end].tag !== 'h2' && !isEyebrow(all[end]); end++) {
    if (all[end].tag === 'p' && all[end].text) paragraphs.push(all[end].text);
  }
  return { eyebrow: all[start].text, heading: all[start + 1].text, paragraphs, start, end };
}

function first(paragraphs: string[], what: string) {
  if (!paragraphs[0]) throw new Unreadable(`no text for ${what}`);
  return paragraphs[0];
}

function readPage(html: string) {
  const all = tokens(html);
  const h1 = all.findIndex((t) => t.tag === 'h1');
  const subtitle = all.slice(h1 + 1).find((t) => t.tag === 'p')?.text;
  if (h1 < 0 || !subtitle) throw new Unreadable('no title and subtitle');

  const intro = section(all, /making an impact/);
  const experience = section(all, /our industry experience/);
  const caseStudies = section(all, /stories from/);
  const relatedPosts = section(all, /our latest insights/);

  // The "How we work" slides sit between the intro and the experience section.
  const steps = all
    .map((t, i) => ({ t, i }))
    .filter(({ t, i }) => t.tag === 'h4' && i > intro.start && i < experience.start)
    .map(({ t, i }) => ({ image: image(all[i - 1], t.text), heading: t.text, text: first(all[i + 1]?.tag === 'p' ? [all[i + 1].text] : [], t.text) }));
  if (!steps.length) throw new Unreadable('no "How we work" steps');

  return {
    subtitle,
    intro: { eyebrow: intro.eyebrow, heading: intro.heading, text: first(intro.paragraphs, 'the intro') },
    steps,
    experience: { eyebrow: experience.eyebrow, heading: experience.heading, paragraphs: experience.paragraphs },
    caseStudies: { eyebrow: caseStudies.eyebrow, heading: caseStudies.heading, text: first(caseStudies.paragraphs, 'Our Work') },
    relatedPosts: { text: first(relatedPosts.paragraphs, 'Related Posts') },
  };
}

// Each card in the Industries Grid: image, h3 name, summary.
function readCards(html: string) {
  const all = tokens(html);
  return all
    .map((t, i) => ({ t, i }))
    .filter(({ t }) => t.tag === 'h3')
    .map(({ t, i }, n) => ({ name: t.text, order: n + 1, imageToken: all[i - 1], summary: all[i + 1]?.tag === 'p' ? all[i + 1].text : '' }));
}

export function importIndustries(xml: string): IndustryImport {
  const wxr = parseWxr(xml);
  const grid = wxr.items.find((i) => i.type === 'wp_block' && decodeEntities(i.title) === 'Industries Grid');
  const cards = readCards(grid?.content ?? '');
  const industries: ImportedIndustry[] = [];
  const media = new Set<string>();
  const unreadable: IndustryImport['unreadable'] = [];

  for (const item of wxr.items) {
    if (item.type !== 'industries' || item.status !== 'publish') continue;
    const address = new URL(item.link).pathname;
    const title = decodeEntities(item.title);
    try {
      const card = cards.find((c) => c.name === title);
      if (!card?.summary) throw new Unreadable('no card in the Industries Grid block');
      const page = readPage(item.content);
      const cardImage = image(card.imageToken, 'the card');
      const description = decodeEntities(item.meta._yoast_wpseo_metadesc ?? '').trim();
      for (const src of [cardImage.src, ...page.steps.map((s) => s.image.src)]) media.add(`https://chesamel.com${src}`);
      industries.push({
        address,
        file: `src/content${address.replace(/\/$/, '')}.md`,
        data: {
          title,
          subtitle: page.subtitle,
          ...(description && { description }),
          order: card.order,
          card: { image: cardImage, summary: card.summary },
          intro: page.intro,
          steps: page.steps,
          experience: page.experience,
          caseStudies: page.caseStudies,
          relatedPosts: page.relatedPosts,
        },
        body: '',
      });
    } catch (err) {
      if (!(err instanceof Unreadable)) throw err;
      unreadable.push({ address, reason: err.message });
    }
  }

  return { industries, media: [...media].sort(), unreadable };
}
