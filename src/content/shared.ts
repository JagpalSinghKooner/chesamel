// Helpers every kind of dated, labelled content uses: Blog Posts, Case
// Studies, Podcasts, Webinars and Reports.

import type { PillarSlug } from '../data/taxonomy';

// The first label is the item's main Pillar, the one cards and headers show.
export const primaryPillar = (item: { pillars: PillarSlug[] }) => item.pillars[0];

// Sort order for listings: newest first, then by file name so equal dates
// always come out the same way.
export const newestFirst = (a: { id: string; data: { date: Date } }, b: { id: string; data: { date: Date } }) =>
  b.data.date.getTime() - a.data.date.getTime() || a.id.localeCompare(b.id);

// "2024-11-13", for <time datetime>.
export const isoDate = (date: Date) => date.toISOString().slice(0, 10);

// "November 13, 2024", as the live site shows dates.
export const formatDate = (date: Date) =>
  date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

// "19th Oct 2026", as the live Careers cards show the day a role was posted.
export function formatShortDate(date: Date): string {
  const day = date.getUTCDate();
  const suffix = day % 10 === 1 && day !== 11 ? 'st' : day % 10 === 2 && day !== 12 ? 'nd' : day % 10 === 3 && day !== 13 ? 'rd' : 'th';
  const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
  return `${day}${suffix} ${month} ${date.getUTCFullYear()}`;
}
