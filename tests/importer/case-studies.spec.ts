import { test, expect } from '@playwright/test';
import { importCaseStudies } from '../../scripts/import-wordpress/case-studies';
import { wxr, ids } from './fixture';

const thumbnail = { id: 900, type: 'attachment', attachmentUrl: 'https://chesamel.com/wp-content/uploads/2024/11/Finance-2.png', meta: { _wp_attachment_image_alt: '' } };
// BI & Data Analytics and Hospitality are not in the shared fixture.
const extraLabels = [
  { id: 352, type: 'services', title: 'BI &amp; Data Analytics', link: 'https://chesamel.com/services/bi-data-analytics/' },
  { id: 453, type: 'industries', title: 'Hospitality', link: 'https://chesamel.com/industries/hospitality/' },
];
const caseStudy = (fields: Record<string, unknown> = {}) => ({
  id: 1,
  type: 'case_studies',
  slug: 'business-intelligence-in-finance',
  link: 'https://chesamel.com/case-studies/business-intelligence-in-finance/',
  ...fields,
});

test('a published Case Study keeps its address, labels, objective, excerpt and card image', () => {
  const { caseStudies } = importCaseStudies(
    wxr([
      thumbnail,
      ...extraLabels,
      caseStudy({
        title: 'Event Steerco with Google Cloud UK&amp;I',
        date: '2024-11-13 16:46:25',
        excerpt: 'Effectively analysing Business Intelligence (BI) in financial services.',
        content: '<!-- wp:heading {"level":3} -->\n<h3 class="wp-block-heading">The Story</h3>\n<!-- /wp:heading -->\n<p>A financial services business wanted more.</p>',
        meta: {
          _thumbnail_id: '900',
          service: ids(352, 356),
          industry: ids(451),
          case_study_objective: 'To consolidate and analyse data.',
          client: '',
          _yoast_wpseo_metadesc: 'Chesamel’s BI work.',
        },
      }),
    ]),
  );

  expect(caseStudies).toHaveLength(1);
  const [cs] = caseStudies;
  expect(cs.address).toBe('/case-studies/business-intelligence-in-finance/');
  expect(cs.file).toBe('src/content/case-studies/business-intelligence-in-finance.md');
  expect(cs.data).toEqual({
    title: 'Event Steerco with Google Cloud UK&I',
    date: '2024-11-13T16:46:25Z',
    excerpt: 'Effectively analysing Business Intelligence (BI) in financial services.',
    objective: 'To consolidate and analyse data.',
    image: { src: '/wp-content/uploads/2024/11/Finance-2.png', alt: '' },
    pillars: ['bi-data-analytics', 'digital-transformation'],
    industries: ['finance'],
    description: 'Chesamel’s BI work.',
  });
  expect(cs.body).toBe('### The Story\n\nA financial services business wanted more.\n');
});

test('drafts and other post types are skipped', () => {
  const { caseStudies } = importCaseStudies(
    wxr([
      caseStudy({ id: 1 }),
      caseStudy({ id: 2, status: 'draft', link: 'https://chesamel.com/?post_type=case_studies&#038;p=2' }),
      { id: 3, slug: 'a-blog-post' },
    ]),
  );
  expect(caseStudies.map((c) => c.address)).toEqual(['/case-studies/business-intelligence-in-finance/']);
});

test('the client name is kept only when set', () => {
  const { caseStudies } = importCaseStudies(
    wxr([
      caseStudy({ id: 1, meta: { client: 'Google Cloud' } }),
      caseStudy({ id: 2, link: 'https://chesamel.com/case-studies/other/', meta: { client: '' } }),
    ]),
  );
  expect(caseStudies[0].data.client).toBe('Google Cloud');
  expect(caseStudies[1].data).not.toHaveProperty('client');
});

test('body images, including resized variants, and the card image are listed for download', () => {
  const { caseStudies, media } = importCaseStudies(
    wxr([
      thumbnail,
      caseStudy({
        meta: { _thumbnail_id: '900' },
        content: '<figure class="wp-block-image size-large"><img src="https://chesamel.com/wp-content/uploads/2024/11/Finance-1-1024x576.png" alt="" class="wp-image-1668"/></figure>',
      }),
    ]),
  );
  expect(caseStudies[0].body).toBe('![](/wp-content/uploads/2024/11/Finance-1-1024x576.png)\n');
  expect(media).toEqual([
    'https://chesamel.com/wp-content/uploads/2024/11/Finance-1-1024x576.png',
    'https://chesamel.com/wp-content/uploads/2024/11/Finance-2.png',
  ]);
});

test('a Case Study without a featured image has no card image, so the schema rejects it', () => {
  const { caseStudies } = importCaseStudies(wxr([caseStudy()]));
  expect(caseStudies[0].data).not.toHaveProperty('image');
});

test('a one-cell table used as a paragraph becomes a paragraph', () => {
  const { caseStudies } = importCaseStudies(
    wxr([
      caseStudy({
        content:
          '<figure class="wp-block-table"><table class="has-neutral-grey-color" style="border-style:none"><tbody><tr><td>Our strategic approach included:</td></tr></tbody></table></figure>',
      }),
    ]),
  );
  expect(caseStudies[0].body).toBe('Our strategic approach included:\n');
});

test('a body image the live site no longer has is left out and reported', () => {
  const gone = 'https://chesamel.com/wp-content/uploads/2024/11/gone-1024x576.png';
  const { caseStudies, missingImages } = importCaseStudies(
    wxr([caseStudy({ content: `<p>Before.</p><figure class="wp-block-image"><img src="${gone}" alt=""/></figure><p>After.</p>` })]),
    { missingMedia: new Set([gone]) },
  );
  expect(caseStudies[0].body).toBe('Before.\n\nAfter.\n');
  expect(missingImages).toEqual([{ address: '/case-studies/business-intelligence-in-finance/', image: '/wp-content/uploads/2024/11/gone-1024x576.png', alt: '' }]);
});
