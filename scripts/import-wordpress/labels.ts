// Maps a WordPress item's ACF relationship fields to the site's label slugs.
// Shared by every importer that files content under Pillars or Industries.

import type { Wxr } from './wxr.ts';
import { pillarSlugs, type PillarSlug } from '../../src/data/taxonomy.ts';

// One old post stores its service as the word "ESG" instead of an ID; the
// live site redirects the old ESG service to Investment & Impact Transformation.
const LEGACY_SERVICE_NAMES: Record<string, PillarSlug> = { ESG: 'investment-impact-transformation' };

// Webinars store some services by the slug of an old service page, which the
// live site now redirects to its successor.
const LEGACY_SERVICE_SLUGS: Record<string, PillarSlug> = {
  'digital-evolution': 'digital-transformation',
  'people-performance': 'hybrid-workforce',
};

export function pillarsOf(wxr: Wxr, value: string | undefined): PillarSlug[] {
  const legacy = LEGACY_SERVICE_NAMES[value ?? ''];
  return legacy ? [legacy] : linkedSlugs(wxr, value, 'services', pillarSlugs, LEGACY_SERVICE_SLUGS);
}

// Maps ACF relationship values to label slugs. Most values are post IDs,
// mapped via the linked post's address: /services/<slug>/… or
// /industries/<slug>/. Sub-services count as their parent service; IDs of
// deleted or Arabic posts are dropped. Some items (webinars) also hold the
// slug itself as a string, which counts when it is an allowed slug or a known
// legacy one. WordPress order is kept, because the first label is the one
// cards show.
export function linkedSlugs<T extends string>(
  wxr: Wxr,
  value: string | undefined,
  section: string,
  allowed: readonly T[],
  legacy: Record<string, T> = {},
): T[] {
  const isAllowed = (slug: string): slug is T => (allowed as readonly string[]).includes(slug);
  const found = new Set<T>();
  for (const [, entry] of (value ?? '').matchAll(/s:\d+:"([^"]*)"/g)) {
    if (!/^\d+$/.test(entry)) {
      const slug = legacy[entry] ?? entry;
      if (isAllowed(slug)) found.add(slug);
      continue;
    }
    const linked = wxr.byId.get(entry);
    if (!linked) continue;
    const [first, slug] = new URL(linked.link).pathname.split('/').filter(Boolean);
    if (first === section && isAllowed(slug)) found.add(slug);
  }
  return [...found];
}
