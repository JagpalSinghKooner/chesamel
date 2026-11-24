// Turns WordPress posts (both the post and the former news type) into Blog Post files.

import { asWxr, decodeEntities, type WxrSource } from './wxr.ts';
import { toMarkdown, localiseUrls, mediaUrls } from './html.ts';
import { industrySlugs, type PillarSlug, type IndustrySlug } from '../../src/data/taxonomy.ts';
import { pillarsOf, linkedSlugs } from './labels.ts';

export interface BlogPostData {
  title: string;
  date: string;
  author: string;
  hero?: { src: string; alt: string };
  pillars: PillarSlug[];
  industries: IndustrySlug[];
  description?: string;
}

export interface ImportedBlogPost {
  // Address on the live site, which the Blog Post keeps.
  address: string;
  // Repo-relative path of the Markdown file.
  file: string;
  data: BlogPostData;
  body: string;
}

export interface BlogPostImport {
  posts: ImportedBlogPost[];
  // Live chesamel.com media the posts use, to download into the repo.
  media: string[];
  // Body images left out because the live site no longer has the file.
  missingImages: { address: string; image: string; alt: string }[];
}

export interface ImportOptions {
  // Live media URLs that could not be downloaded (gone from the live site).
  missingMedia?: Set<string>;
}

const SOURCE_TYPES = ['post', 'news'];

export function importBlogPosts(source: WxrSource, { missingMedia = new Set() }: ImportOptions = {}): BlogPostImport {
  const wxr = asWxr(source);
  const posts: ImportedBlogPost[] = [];
  const media = new Set<string>();
  const missingImages: BlogPostImport['missingImages'] = [];

  for (const item of wxr.items) {
    if (!SOURCE_TYPES.includes(item.type) || item.status !== 'publish') continue;
    const address = new URL(item.link).pathname;
    const thumbnail = wxr.byId.get(item.meta._thumbnail_id ?? '');
    const hero = thumbnail?.attachmentUrl
      ? { src: localiseUrls(thumbnail.attachmentUrl), alt: decodeEntities(thumbnail.meta._wp_attachment_image_alt ?? '') }
      : undefined;
    if (thumbnail?.attachmentUrl) media.add(thumbnail.attachmentUrl);
    for (const url of mediaUrls(item.content)) media.add(url);

    const description = decodeEntities(item.meta._yoast_wpseo_metadesc ?? '').trim();
    posts.push({
      address,
      file: `src/content/blog${address.replace(/\/$/, '')}.md`,
      data: {
        title: decodeEntities(item.title),
        date: item.dateGmt.replace(' ', 'T') + 'Z',
        author: wxr.authors.get(item.creator) ?? item.creator,
        ...(hero && { hero }),
        pillars: pillarsOf(wxr, item.meta.service),
        industries: linkedSlugs(wxr, item.meta.industry, 'industries', industrySlugs),
        ...(description && { description }),
      },
      body: withoutMissingImages(toMarkdown(item.content), missingMedia, (image, alt) =>
        missingImages.push({ address, image, alt }),
      ),
    });
  }

  return { posts, media: [...media].sort(), missingImages };
}

// A broken image helps no one; the content team gets a list to replace them.
// Matches a Markdown image, optionally wrapped in a link.
const IMAGE = /\[?!\[([^\]]*)\]\((\/wp-content\/[^)\s]+)\)(?:\]\([^)]*\))?/g;

export function withoutMissingImages(markdown: string, missing: Set<string>, report: (image: string, alt: string) => void): string {
  if (!missing.size) return markdown;
  return markdown
    .replace(IMAGE, (whole, alt: string, src: string) => {
      if (!missing.has(`https://chesamel.com${src}`)) return whole;
      report(src, alt);
      return '';
    })
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\n+/, '');
}
