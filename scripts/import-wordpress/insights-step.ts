// The import step for Podcasts, Webinars and Reports. It writes only
// src/content/{podcasts,webinars,reports}/, so it can run on its own
// (`npm run import -- --only=insights`) without touching Blog Posts.

import { importPodcasts } from './podcasts.ts';
import { importWebinars } from './webinars.ts';
import { importReports } from './reports.ts';
import { downloadMedia } from './media.ts';
import type { ImportedItem } from './insight-item.ts';

const serialise = (item: ImportedItem<object>) =>
  `---\n${Object.entries(item.data)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join('\n')}\n---\n\n${item.body}`;

// Returns the addresses written, for the pending list.
export async function importInsightItems(
  xml: string,
  { withMedia, write }: { withMedia: boolean; write: (path: string, contents: string) => Promise<void> },
): Promise<string[]> {
  const imports = { Podcasts: importPodcasts(xml), Webinars: importWebinars(xml), Reports: importReports(xml) };
  const all = Object.values(imports);

  if (withMedia) {
    const failures = await downloadMedia(all.flatMap((i) => i.media));
    if (failures.length) {
      console.error(`${failures.length} Podcast, Webinar or Report images failed; re-run to retry:\n${failures.join('\n')}`);
      process.exitCode = 1;
    }
  }

  for (const [name, { items }] of Object.entries(imports)) {
    for (const item of items) await write(item.file, serialise(item));
    console.log(`Wrote ${items.length} ${name}`);
  }
  return all.flatMap((i) => i.items.map((item) => item.address));
}
