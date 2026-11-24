// Turns WordPress case_studies items into Case Study files.

import { parseWxr, decodeEntities } from './wxr.ts';
import { toMarkdown, localiseUrls, mediaUrls } from './html.ts';
import { pillarsOf, linkedSlugs } from './labels.ts';
import { withoutMissingImages, type ImportOptions } from './blog-posts.ts';
import { industrySlugs } from '../../src/data/taxonomy.ts';
import type { CaseStudyData as CaseStudyFields } from '../../src/content/case-study-schema.ts';

// A Case Study file's frontmatter, as the schema defines it, except that the
// date is written as text and the image is left out when the live site has
// lost it (the schema then fails the build until one is added).
export type CaseStudyData = Omit<CaseStudyFields, 'date' | 'image'> & { date: string; image?: CaseStudyFields['image'] };

export interface ImportedCaseStudy {
  address: string;
  file: string;
  data: CaseStudyData;
  body: string;
}

export interface CaseStudyImport {
  caseStudies: ImportedCaseStudy[];
  media: string[];
  missingImages: { address: string; image: string; alt: string }[];
}

// One Case Study uses a one-cell table as a paragraph; a table there would
// tell screen readers it is data.
const ONE_CELL_TABLE = /<figure class="wp-block-table">\s*<table[^>]*>\s*<tbody>\s*<tr>\s*<td>([\s\S]*?)<\/td>\s*<\/tr>\s*<\/tbody>\s*<\/table>\s*<\/figure>/g;
const flattenOneCellTables = (html: string) => html.replace(ONE_CELL_TABLE, '<p>$1</p>');

const clean = (s: string | undefined) => decodeEntities(s ?? '').trim();

export function importCaseStudies(xml: string, { missingMedia = new Set() }: ImportOptions = {}): CaseStudyImport {
  const wxr = parseWxr(xml);
  const caseStudies: ImportedCaseStudy[] = [];
  const media = new Set<string>();
  const missingImages: CaseStudyImport['missingImages'] = [];

  for (const item of wxr.items) {
    if (item.type !== 'case_studies' || item.status !== 'publish') continue;
    const address = new URL(item.link).pathname;
    const thumbnail = wxr.byId.get(item.meta._thumbnail_id ?? '');
    if (thumbnail?.attachmentUrl) media.add(thumbnail.attachmentUrl);
    for (const url of mediaUrls(item.content)) media.add(url);

    const client = clean(item.meta.client);
    const description = clean(item.meta._yoast_wpseo_metadesc);
    caseStudies.push({
      address,
      file: `src/content${address.replace(/\/$/, '')}.md`,
      data: {
        title: decodeEntities(item.title),
        date: item.dateGmt.replace(' ', 'T') + 'Z',
        excerpt: clean(item.excerpt),
        objective: clean(item.meta.case_study_objective),
        ...(client && { client }),
        // Without a featured image the schema rejects the file, so the build says so.
        ...(thumbnail?.attachmentUrl && {
          image: { src: localiseUrls(thumbnail.attachmentUrl), alt: clean(thumbnail.meta._wp_attachment_image_alt) },
        }),
        pillars: pillarsOf(wxr, item.meta.service),
        industries: linkedSlugs(wxr, item.meta.industry, 'industries', industrySlugs),
        ...(description && { description }),
      },
      body: withoutMissingImages(toMarkdown(flattenOneCellTables(item.content)), missingMedia, (image, alt) =>
        missingImages.push({ address, image, alt }),
      ),
    });
  }

  return { caseStudies, media: [...media].sort(), missingImages };
}
