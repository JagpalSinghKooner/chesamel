// Builds a tiny WordPress export (WXR) for importer tests.

export interface FixtureItem {
  id: number;
  type?: string;
  status?: string;
  title?: string;
  slug?: string;
  link?: string;
  date?: string;
  creator?: string;
  content?: string;
  excerpt?: string;
  attachmentUrl?: string;
  meta?: Record<string, string>;
}

const cdata = (s: string) => `<![CDATA[${s}]]>`;

function item(i: FixtureItem): string {
  const type = i.type ?? 'post';
  const slug = i.slug ?? `post-${i.id}`;
  const meta = Object.entries(i.meta ?? {})
    .map(([k, v]) => `<wp:postmeta><wp:meta_key>${cdata(k)}</wp:meta_key><wp:meta_value>${cdata(v)}</wp:meta_value></wp:postmeta>`)
    .join('\n');
  return `<item>
    <title>${cdata(i.title ?? `Post ${i.id}`)}</title>
    <link>${i.link ?? `https://chesamel.com/${slug}/`}</link>
    <dc:creator>${cdata(i.creator ?? 'graham')}</dc:creator>
    <content:encoded>${cdata(i.content ?? '<!-- wp:paragraph -->\n<p>Hello.</p>\n<!-- /wp:paragraph -->')}</content:encoded>
    <excerpt:encoded>${cdata(i.excerpt ?? '')}</excerpt:encoded>
    <wp:post_id>${i.id}</wp:post_id>
    <wp:post_date_gmt>${cdata(i.date ?? '2024-12-10 12:20:12')}</wp:post_date_gmt>
    <wp:post_name>${cdata(slug)}</wp:post_name>
    <wp:status>${cdata(i.status ?? (type === 'attachment' ? 'inherit' : 'publish'))}</wp:status>
    <wp:post_parent>0</wp:post_parent>
    <wp:post_type>${cdata(type)}</wp:post_type>
    ${i.attachmentUrl ? `<wp:attachment_url>${cdata(i.attachmentUrl)}</wp:attachment_url>` : ''}
    ${meta}
  </item>`;
}

// The services and industries every fixture export carries, with the live IDs.
// An item with the same ID replaces one of these.
const taxonomy: FixtureItem[] = [
  { id: 348, type: 'services', title: 'AI &amp; Machine Learning', link: 'https://chesamel.com/services/ai-machine-learning/' },
  { id: 349, type: 'services', title: 'AI Solutions', link: 'https://chesamel.com/services/ai-machine-learning/ai-solutions-implementations/' },
  { id: 356, type: 'services', title: 'Digital Transformation', link: 'https://chesamel.com/services/digital-transformation/' },
  { id: 361, type: 'services', title: 'Investments &amp; Sustainable Transformation', link: 'https://chesamel.com/services/investment-impact-transformation/' },
  { id: 365, type: 'services', title: 'Marketing Engine', link: 'https://chesamel.com/services/marketing-engine/' },
  { id: 455, type: 'industries', title: 'Technology', link: 'https://chesamel.com/industries/technology/' },
  { id: 451, type: 'industries', title: 'Finance', link: 'https://chesamel.com/industries/finance/' },
];

export function wxr(items: FixtureItem[]): string {
  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:excerpt="http://wordpress.org/export/1.2/excerpt/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:wp="http://wordpress.org/export/1.2/">
<channel>
  <wp:author><wp:author_id>2</wp:author_id><wp:author_login>${cdata('graham')}</wp:author_login><wp:author_email>${cdata('graham@example.com')}</wp:author_email><wp:author_display_name>${cdata('Graham Jones')}</wp:author_display_name></wp:author>
  ${[...taxonomy.filter((t) => !items.some((i) => i.id === t.id)), ...items].map(item).join('\n')}
</channel>
</rss>`;
}

// PHP-serialised array of post IDs, as ACF stores the service and industry fields.
export const ids = (...values: number[]) =>
  `a:${values.length}:{${values.map((v, i) => `i:${i};s:${String(v).length}:"${v}";`).join('')}}`;
