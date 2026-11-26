// Each page's <title> and meta description (#54). They copy what live
// chesamel.com renders, held in the content's `seoTitle` and `seoDescription`
// or, for pages without a content file, in src/data/page-seo.json (both
// written by `npm run seo:live`). Where live has none, the title is the
// item's own with " | Chesamel", and the description the first 155
// characters of its own text, cut at a word.

import type { CollectionEntry, CollectionKey } from 'astro:content';
import { excerpt } from '../content/insight-items';
import { pageTitle } from '../content/paging';
import { siteName } from '../data/seo';
import pageSeo from '../data/page-seo.json';

export interface Meta {
  title: string;
  description: string;
}

type SeoEntry = CollectionEntry<Exclude<CollectionKey, 'team' | 'offices'>>;

const DESCRIPTION_LENGTH = 155;

// The text an item's fallback description is cut from.
function ownText(entry: SeoEntry): string {
  switch (entry.collection) {
    case 'caseStudies':
      return entry.data.excerpt;
    case 'industries':
      return entry.data.subtitle;
    case 'pages':
    case 'pillars':
    case 'services':
      return entry.data.hero.paragraphs[0] ?? entry.data.hero.subtitle ?? entry.body ?? '';
    default:
      return entry.body ?? '';
  }
}

export function entryMeta(entry: SeoEntry): Meta {
  const { title, seoTitle, seoDescription } = entry.data;
  return {
    title: seoTitle ?? `${title} | ${siteName}`,
    description: seoDescription ?? (excerpt(ownText(entry), DESCRIPTION_LENGTH) || title),
  };
}

// A page without a content file, such as the homepage or a listing.
export function pageMeta(path: keyof typeof pageSeo): Meta {
  return pageSeo[path];
}

// Page 2 onwards of a paged listing: "…, page 2 of 34", so no two pages
// share a title or description.
export function pagedMeta(meta: Meta, current: number, last: number): Meta {
  if (current === 1) return meta;
  return { title: pageTitle(meta.title, current, last), description: `${meta.description} Page ${current} of ${last}.` };
}
