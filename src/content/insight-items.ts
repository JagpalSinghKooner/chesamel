// Reading Podcasts, Webinars and Reports for pages: newest first, each with
// its address, /<collection>/<file name>/.

import { getCollection, type CollectionEntry } from 'astro:content';
import { newestFirst } from './shared';

export type InsightCollection = 'podcasts' | 'webinars' | 'reports';
export type Podcast = CollectionEntry<'podcasts'>;
export type Webinar = CollectionEntry<'webinars'>;
export type Report = CollectionEntry<'reports'>;

export const addressOf = (item: { collection: InsightCollection; id: string }) => `/${item.collection}/${item.id}/`;

export async function getNewest<C extends InsightCollection>(collection: C): Promise<CollectionEntry<C>[]> {
  const items = (await getCollection(collection)) as CollectionEntry<C>[];
  return items.sort(newestFirst);
}

// The first `max` characters of a Markdown body as plain text, for cards.
export function excerpt(markdown: string, max = 220): string {
  const text = markdown
    .replace(/<[^>]+>/g, ' ')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_#>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length <= max ? text : text.slice(0, text.lastIndexOf(' ', max)) + '…';
}
