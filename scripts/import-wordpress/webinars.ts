// Turns WordPress `webinars` items into Webinar files.

import { asWxr, type WxrSource } from './wxr.ts';
import { toMarkdown, mediaUrls, youtubeId } from './html.ts';
import { pillarsOf, linkedSlugs } from './labels.ts';
import { industrySlugs, type PillarSlug, type IndustrySlug } from '../../src/data/taxonomy.ts';
import { publishedOfType, addressOf, fileOf, isoDate, titleOf, featuredImage, type ItemImport } from './insight-item.ts';

export interface WebinarData {
  title: string;
  date: string;
  // YouTube ID of the recording, when the body doesn't already embed one.
  video?: string;
  image?: { src: string; alt: string };
  pillars: PillarSlug[];
  industries: IndustrySlug[];
}

export function importWebinars(source: WxrSource): ItemImport<WebinarData> {
  const wxr = asWxr(source);
  const media = new Set<string>();
  const items = publishedOfType(wxr, 'webinars').map((item) => {
    const address = addressOf(item);
    const { image, url } = featuredImage(wxr, item);
    if (url) media.add(url);
    for (const u of mediaUrls(item.content)) media.add(u);
    const body = toMarkdown(item.content);
    // The live site never shows webinar_url, so webinars with an empty body
    // show no video at all; here the recording is shown instead.
    const video = body.includes('<iframe') ? undefined : youtubeId(item.meta.webinar_url ?? '');
    const data: WebinarData = {
      title: titleOf(item),
      date: isoDate(item),
      ...(video && { video }),
      ...(image && { image }),
      pillars: pillarsOf(wxr, item.meta.service),
      industries: linkedSlugs(wxr, item.meta.industry, 'industries', industrySlugs),
    };
    return { address, file: fileOf(address), data, body };
  });
  return { items, media: [...media].sort() };
}
