// Maps a WordPress item's ACF relationship fields to the site's label slugs.
// Shared by every importer that files content under Pillars or Industries.

import { serialisedIds, type Wxr } from './wxr.ts';
import { pillarSlugs, type PillarSlug } from '../../src/data/taxonomy.ts';

// One old post stores its service as the word "ESG" instead of an ID; the
// live site redirects the old ESG service to Investment & Impact Transformation.
const LEGACY_SERVICE_NAMES: Record<string, PillarSlug> = { ESG: 'investment-impact-transformation' };

export function pillarsOf(wxr: Wxr, value: string | undefined): PillarSlug[] {
  const legacy = LEGACY_SERVICE_NAMES[value ?? ''];
  return legacy ? [legacy] : linkedSlugs(wxr, value, 'services', pillarSlugs);
}

// Maps ACF relationship IDs to label slugs via the linked post's address:
// /services/<slug>/… or /industries/<slug>/. Sub-services count as their
// parent service; IDs of deleted or Arabic posts are dropped. WordPress order
// is kept, because the first label is the one cards show.
export function linkedSlugs<T extends string>(wxr: Wxr, value: string | undefined, section: string, allowed: readonly T[]): T[] {
  const found = new Set<T>();
  for (const id of serialisedIds(value)) {
    const linked = wxr.byId.get(id);
    if (!linked) continue;
    const [first, slug] = new URL(linked.link).pathname.split('/').filter(Boolean);
    if (first === section && (allowed as readonly string[]).includes(slug)) found.add(slug as T);
  }
  return [...found];
}
