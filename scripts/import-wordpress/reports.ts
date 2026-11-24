// Turns WordPress `reports` items (gated white papers) into Report files.
//
// A live report is its intro paragraphs, then a theme-built download box and a
// HubSpot form that emails the PDF (the export has no PDF). The intro becomes
// the body; the box is rebuilt by the page, and the form is kept by its ID for
// when HubSpot forms are wired up.

import { asWxr, type WxrSource } from './wxr.ts';
import { toMarkdown, mediaUrls } from './html.ts';
import { pillarsOf } from './labels.ts';
import type { PillarSlug } from '../../src/data/taxonomy.ts';
import { publishedOfType, addressOf, fileOf, isoDate, titleOf, descriptionOf, featuredImage, type ItemImport } from './insight-item.ts';

export interface ReportData {
  title: string;
  date: string;
  image?: { src: string; alt: string };
  pillars: PillarSlug[];
  hubspotFormId?: string;
  description?: string;
}

const DOWNLOAD_BOX = /<!-- wp:group \{[^}]*"className":"download-report-section"/;
const FORM_ID = /formId:\s*"([0-9a-f-]{36})"/;

export function importReports(source: WxrSource): ItemImport<ReportData> {
  const wxr = asWxr(source);
  const media = new Set<string>();
  const items = publishedOfType(wxr, 'reports').map((item) => {
    const address = addressOf(item);
    const { image, url } = featuredImage(wxr, item);
    if (url) media.add(url);
    const box = item.content.search(DOWNLOAD_BOX);
    const intro = box === -1 ? item.content : item.content.slice(0, box);
    for (const u of mediaUrls(intro)) media.add(u);
    const hubspotFormId = item.content.match(FORM_ID)?.[1];
    const description = descriptionOf(item);
    const data: ReportData = {
      title: titleOf(item),
      date: isoDate(item),
      ...(image && { image }),
      pillars: pillarsOf(wxr, item.meta.service),
      ...(hubspotFormId && { hubspotFormId }),
      ...(description && { description }),
    };
    return { address, file: fileOf(address), data, body: toMarkdown(intro) };
  });
  return { items, media: [...media].sort() };
}
