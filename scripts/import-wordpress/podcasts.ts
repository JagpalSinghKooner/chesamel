// Turns WordPress `podcasts` items (episodes of Chesamel Unplugged) into Podcast files.

import { asWxr, type WxrSource } from './wxr.ts';
import { toMarkdown, mediaUrls } from './html.ts';
import { pillarsOf } from './labels.ts';
import type { PillarSlug } from '../../src/data/taxonomy.ts';
import { publishedOfType, addressOf, fileOf, isoDate, titleOf, featuredImage, type ItemImport } from './insight-item.ts';

export interface PodcastData {
  title: string;
  date: string;
  guest: string;
  // Where to listen: there is no audio file in the export, only these platforms.
  listen: { spotify?: string; amazon?: string; podcastAddict?: string; podchaser?: string };
  image?: { src: string; alt: string };
  pillars: PillarSlug[];
}

const PLATFORMS = { spotify: 'podcast_spotify', amazon: 'podcast_amazon', podcastAddict: 'podcast_podcastaddict', podchaser: 'podcast_podchase' } as const;

export function importPodcasts(source: WxrSource): ItemImport<PodcastData> {
  const wxr = asWxr(source);
  const media = new Set<string>();
  const items = publishedOfType(wxr, 'podcasts').map((item) => {
    const address = addressOf(item);
    const { image, url } = featuredImage(wxr, item);
    if (url) media.add(url);
    for (const u of mediaUrls(item.content)) media.add(u);
    const listen: PodcastData['listen'] = {};
    for (const [key, field] of Object.entries(PLATFORMS)) {
      const link = item.meta[field]?.trim();
      if (link) listen[key as keyof typeof PLATFORMS] = link;
    }
    const data: PodcastData = {
      title: titleOf(item),
      date: isoDate(item),
      guest: item.meta.podcast_guest?.trim() ?? '',
      listen,
      ...(image && { image }),
      pillars: pillarsOf(wxr, item.meta.service),
    };
    return { address, file: fileOf(address), data, body: toMarkdown(item.content) };
  });
  return { items, media: [...media].sort() };
}
