// What the Podcast, Webinar and Report importers share: a published item of
// one WordPress type, kept at its original address, with its featured image.

import { decodeEntities, type Wxr, type WxrItem } from './wxr.ts';
import { localiseUrls } from './html.ts';

export interface ImportedItem<Data> {
  // Address on the live site, which the item keeps: /<type>/<slug>/.
  address: string;
  // Repo-relative path of the Markdown file.
  file: string;
  data: Data;
  body: string;
}

export interface ItemImport<Data> {
  items: ImportedItem<Data>[];
  // Live chesamel.com media the items use, to download into the repo.
  media: string[];
}

export const publishedOfType = (wxr: Wxr, type: string) => wxr.items.filter((i) => i.type === type && i.status === 'publish');

export const addressOf = (item: WxrItem) => new URL(item.link).pathname;

// /podcasts/foo/ is stored as src/content/podcasts/foo.md.
export const fileOf = (address: string) => `src/content${address.replace(/\/$/, '')}.md`;

export const isoDate = (item: WxrItem) => item.dateGmt.replace(' ', 'T') + 'Z';

export const titleOf = (item: WxrItem) => decodeEntities(item.title);

export const descriptionOf = (item: WxrItem) => decodeEntities(item.meta._yoast_wpseo_metadesc ?? '').trim();

// The featured image, plus the live URL to download. Alt text is almost always
// empty in WordPress; pages decide whether the image is decorative.
export function featuredImage(wxr: Wxr, item: WxrItem): { image?: { src: string; alt: string }; url?: string } {
  const attachment = wxr.byId.get(item.meta._thumbnail_id ?? '');
  if (!attachment?.attachmentUrl) return {};
  return {
    image: { src: localiseUrls(attachment.attachmentUrl), alt: decodeEntities(attachment.meta._wp_attachment_image_alt ?? '') },
    url: attachment.attachmentUrl,
  };
}
