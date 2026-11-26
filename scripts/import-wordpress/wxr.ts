// Reads a WordPress export (WXR) into plain objects. Knows nothing about the
// site's content model; each importer decides what to do with the items.

import { XMLParser } from 'fast-xml-parser';

export interface WxrItem {
  id: string;
  type: string;
  status: string;
  title: string;
  link: string;
  // GMT, as WordPress writes it: "2024-12-10 12:20:12".
  dateGmt: string;
  // The same moment in the site's own time zone (wp:post_date), the date
  // WordPress shows on the page.
  dateLocal: string;
  creator: string;
  content: string;
  // The hand-written summary; Case Studies show it as the hero subtitle.
  excerpt: string;
  attachmentUrl: string;
  // WordPress's manual ordering; the Our Team page sorts by it.
  menuOrder: number;
  // Taxonomy terms, such as a Team Member's teams: { domain: 'teams', slug: 'gcc', name: 'GCC' }.
  categories: { domain: string; slug: string; name: string }[];
  meta: Record<string, string>;
}

export interface Wxr {
  // Author login to display name. Emails in the export are never read.
  authors: Map<string, string>;
  items: WxrItem[];
  byId: Map<string, WxrItem>;
}

const parser = new XMLParser({
  // The only attributes the importers read: a <category>'s domain and nicename.
  ignoreAttributes: (attribute: string) => !['domain', 'nicename'].includes(attribute),
  attributeNamePrefix: '@',
  parseTagValue: false,
  trimValues: false,
  // Titles and bodies keep their entities as written; decoding is the importer's job.
  processEntities: false,
  isArray: (name) => ['item', 'wp:postmeta', 'wp:author', 'category'].includes(name),
});

const str = (v: unknown): string => (v === undefined || v === null ? '' : String(v)).trim();

export function parseWxr(xml: string): Wxr {
  const channel = parser.parse(xml).rss.channel;
  const authors = new Map<string, string>();
  for (const a of channel['wp:author'] ?? []) {
    authors.set(str(a['wp:author_login']), str(a['wp:author_display_name']) || str(a['wp:author_login']));
  }

  const items: WxrItem[] = (channel.item ?? []).map((i: Record<string, unknown>) => {
    const meta: Record<string, string> = {};
    for (const m of (i['wp:postmeta'] as Record<string, unknown>[] | undefined) ?? []) {
      meta[str(m['wp:meta_key'])] = str(m['wp:meta_value']);
    }
    return {
      id: str(i['wp:post_id']),
      type: str(i['wp:post_type']),
      status: str(i['wp:status']),
      title: str(i.title),
      link: str(i.link),
      dateGmt: str(i['wp:post_date_gmt']),
      dateLocal: str(i['wp:post_date']),
      creator: str(i['dc:creator']),
      content: i['content:encoded'] === undefined ? '' : String(i['content:encoded']),
      excerpt: str(i['excerpt:encoded']),
      attachmentUrl: str(i['wp:attachment_url']),
      menuOrder: Number(str(i['wp:menu_order']) || 0),
      categories: ((i.category as Record<string, unknown>[] | undefined) ?? []).map((c) => ({
        domain: str(c['@domain']),
        slug: str(c['@nicename']),
        name: decodeEntities(str(c['#text'])),
      })),
      meta,
    };
  });

  return { authors, items, byId: new Map(items.map((i) => [i.id, i])) };
}

// ACF stores relationship fields as PHP-serialised arrays: a:1:{i:0;s:3:"356";}.
// Importers take the export's text or, to save parsing it again, the parsed
// export.
export type WxrSource = string | Wxr;
export const asWxr = (source: WxrSource): Wxr => (typeof source === 'string' ? parseWxr(source) : source);

export function serialisedIds(value: string | undefined): string[] {
  return [...(value ?? '').matchAll(/s:\d+:"(\d+)"/g)].map((m) => m[1]);
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0' };

export function decodeEntities(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, e: string) => {
    if (e[0] === '#') return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    return ENTITIES[e.toLowerCase()] ?? whole;
  });
}
