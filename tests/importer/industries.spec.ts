import { test, expect } from '@playwright/test';
import { importIndustries } from '../../scripts/import-wordpress/industries';
import { wxr } from './fixture';

// The Industry page as WordPress stores it: the whole page built from
// blocks, trimmed to the parts that carry copy.
const financePage = `<!-- wp:cover -->
<div class="wp-block-cover"><h1 class="wp-block-heading">Finance</h1>
<p class="has-neutral-grey-color">Providing the right intelligence for business growth.</p></div>
<!-- wp:seoworks/breadcrumbs --><div class="wp-block-seoworks-breadcrumbs"><p><a href="https://chesamel.com/industries/">Industries</a></p></div>
<p>/ making an impact</p>
<h2 class="wp-block-heading">Data management, made easy</h2>
<p style="margin-top:0">We partner with financial services clients.</p>
<div class="wp-block-button"><a href="https://chesamel.com/insights/our-work/">How We Do It</a></div>
<div class="wp-block-seoworks-slider">
<figure class="wp-block-image size-full"><img src="https://chesamel.com/wp-content/uploads/2024/11/AI-powered-Asset-Management.png" alt="" class="wp-image-1659"/></figure>
<h4 class="wp-block-heading">Business deep dive</h4>
<p>We get to know your business' priorities.</p>
<figure class="wp-block-image size-full"><img src="https://chesamel.com/wp-content/uploads/2024/11/Website-images.png" alt=""/></figure>
<h4 class="wp-block-heading">Finding solutions</h4>
<p>Together, we start mapping out the best project strategy for you.</p>
</div>
<p class="has-neutral-grey-color">/ our industry experience</p>
<h2 class="wp-block-heading">Helping finance grow</h2>
<p>Managing risk is a major challenge.</p>
<p>We are dedicated to giving these businesses the right tools for growth.</p>
<!-- wp:block {"ref":506} /-->
<p>/ stories from the tech sector</p>
<h2 class="wp-block-heading">Our Work</h2>
<p>See how we power our technology clients.</p>
<p></p>
<p>/ our latest insights</p>
<h2 class="wp-block-heading">Related Posts</h2>
<p>Take a look at our latest content on the financial services industry.</p>
<h2 class="wp-block-heading">Ready to get started?</h2>
<p class="has-accent-lime-color">don't wait to drive your business forward.</p>`;

// The "Industries Grid" reusable block, which holds each Industry's card.
const grid = `<h2 class="wp-block-heading">Industries</h2>
<p>How we work in each of our industries, and the value we bring.</p>
<a href="https://chesamel.com/industries/technology/"><img src="https://chesamel.com/wp-content/uploads/2024/10/bdb225.png" alt=""/>
<h3 class="wp-block-heading">Technology</h3>
<p>Helping technology providers evolve.</p></a>
<a href="https://chesamel.com/industries/finance/"><img src="https://chesamel.com/wp-content/uploads/2024/10/b1f9e9.png" alt=""/>
<h3 class="wp-block-heading">Finance</h3>
<p>Helping the financial sector make better business decisions.</p></a>`;

const finance = {
  id: 451,
  type: 'industries',
  title: 'Finance',
  slug: 'finance',
  link: 'https://chesamel.com/industries/finance/',
  content: financePage,
  meta: { _yoast_wpseo_metadesc: 'Learn how Chesamel drives growth in the finance industry.' },
};
const gridBlock = { id: 2127, type: 'wp_block', title: 'Industries Grid', slug: 'industries-grid', content: grid };

test('a published Industry keeps its address and the copy of each section of its page', () => {
  const { industries } = importIndustries(wxr([finance, gridBlock]));
  const imported = industries.find((i) => i.address === '/industries/finance/')!;

  expect(imported.file).toBe('src/content/industries/finance.md');
  expect(imported.data).toEqual({
    title: 'Finance',
    subtitle: 'Providing the right intelligence for business growth.',
    description: 'Learn how Chesamel drives growth in the finance industry.',
    order: 2,
    card: {
      image: { src: '/wp-content/uploads/2024/10/b1f9e9.png', alt: '' },
      summary: 'Helping the financial sector make better business decisions.',
    },
    intro: {
      eyebrow: '/ making an impact',
      heading: 'Data management, made easy',
      text: 'We partner with financial services clients.',
    },
    steps: [
      {
        image: { src: '/wp-content/uploads/2024/11/AI-powered-Asset-Management.png', alt: '' },
        heading: 'Business deep dive',
        text: 'We get to know your business\' priorities.',
      },
      {
        image: { src: '/wp-content/uploads/2024/11/Website-images.png', alt: '' },
        heading: 'Finding solutions',
        text: 'Together, we start mapping out the best project strategy for you.',
      },
    ],
    experience: {
      eyebrow: '/ our industry experience',
      heading: 'Helping finance grow',
      paragraphs: ['Managing risk is a major challenge.', 'We are dedicated to giving these businesses the right tools for growth.'],
    },
    caseStudies: { eyebrow: '/ stories from the tech sector', heading: 'Our Work', text: 'See how we power our technology clients.' },
    relatedPosts: { text: 'Take a look at our latest content on the financial services industry.' },
  });
});

test('drafts are skipped', () => {
  const { industries, unreadable } = importIndustries(
    wxr([finance, gridBlock, { id: 3179, type: 'industries', status: 'draft', title: 'FMCG', link: 'https://chesamel.com/?post_type=industries&#038;p=3179' }]),
  );
  expect([...industries.map((i) => i.address), ...unreadable.map((u) => u.address)]).not.toContainEqual(expect.stringContaining('3179'));
  expect(industries.map((i) => i.address)).toContain('/industries/finance/');
});

test('the images the pages use are listed for download', () => {
  const { media } = importIndustries(wxr([finance, gridBlock]));
  expect(media).toEqual([
    'https://chesamel.com/wp-content/uploads/2024/10/b1f9e9.png',
    'https://chesamel.com/wp-content/uploads/2024/11/AI-powered-Asset-Management.png',
    'https://chesamel.com/wp-content/uploads/2024/11/Website-images.png',
  ]);
});

test('a page whose layout no longer matches is reported instead of written half-empty', () => {
  const { industries, unreadable } = importIndustries(wxr([{ ...finance, content: '<h1>Finance</h1><p>Just a line.</p>' }, gridBlock]));
  expect(industries.map((i) => i.address)).not.toContain('/industries/finance/');
  expect(unreadable).toContainEqual({ address: '/industries/finance/', reason: expect.stringMatching(/making an impact/) });
});
