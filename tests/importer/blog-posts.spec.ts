import { test, expect } from '@playwright/test';
import { importBlogPosts } from '../../scripts/import-wordpress/blog-posts';
import { wxr, ids } from './fixture';

const hero = { id: 900, type: 'attachment', attachmentUrl: 'https://chesamel.com/wp-content/uploads/2024/12/hero.png', meta: { _wp_attachment_image_alt: 'A ship at sea' } };

test('a published post becomes a Blog Post at its original address', () => {
  const { posts } = importBlogPosts(
    wxr([
      hero,
      {
        id: 1,
        title: 'Shaping a Responsible Tech Strategy',
        slug: 'shaping-a-responsible-tech-strategy',
        date: '2024-12-10 12:20:12',
        creator: 'graham',
        content: '<!-- wp:paragraph -->\n<p>Remember when <strong>adopting</strong> tech was easy?</p>\n<!-- /wp:paragraph -->',
        meta: { _thumbnail_id: '900', service: ids(356), industry: ids(455), _yoast_wpseo_metadesc: 'Avoid innovation for its own sake.' },
      },
    ]),
  );

  expect(posts).toHaveLength(1);
  const [post] = posts;
  expect(post.address).toBe('/shaping-a-responsible-tech-strategy/');
  expect(post.file).toBe('src/content/blog/shaping-a-responsible-tech-strategy.md');
  expect(post.data).toEqual({
    title: 'Shaping a Responsible Tech Strategy',
    date: '2024-12-10T12:20:12Z',
    author: 'Graham Jones',
    hero: { src: '/wp-content/uploads/2024/12/hero.png', alt: 'A ship at sea' },
    pillars: ['digital-transformation'],
    industries: ['technology'],
  });
  expect(post.body).toBe('Remember when **adopting** tech was easy?\n');
});

test('drafts, trashed items and other post types are skipped', () => {
  const { posts } = importBlogPosts(
    wxr([
      { id: 1, slug: 'live' },
      { id: 2, slug: 'unfinished', status: 'draft' },
      { id: 3, slug: 'binned', status: 'trash' },
      { id: 4, slug: 'a-case-study', type: 'case_studies' },
    ]),
  );
  expect(posts.map((p) => p.address)).toEqual(['/live/']);
});

test('a WordPress news-type post becomes a Blog Post under /news/', () => {
  const { posts } = importBlogPosts(
    wxr([{ id: 1, type: 'news', slug: 'qatar-oasis', link: 'https://chesamel.com/news/qatar-oasis/' }]),
  );
  expect(posts[0].address).toBe('/news/qatar-oasis/');
  expect(posts[0].file).toBe('src/content/blog/news/qatar-oasis.md');
});

test('Pillars come from the service field in WordPress order: sub-services count as their parent, unknown IDs are dropped', () => {
  const { posts } = importBlogPosts(
    wxr([
      { id: 1, meta: { service: ids(365, 349, 4834), industry: ids(451, 455) } },
      { id: 2, meta: { service: 'ESG', industry: 'a:0:{}' } },
    ]),
  );
  expect(posts[0].data.pillars).toEqual(['marketing-engine', 'ai-machine-learning']);
  expect(posts[0].data.industries).toEqual(['finance', 'technology']);
  expect(posts[1].data.pillars).toEqual(['investment-impact-transformation']);
  expect(posts[1].data.industries).toEqual([]);
});

test('live-site links become relative and the media they use is listed for download', () => {
  const { posts, media } = importBlogPosts(
    wxr([
      hero,
      {
        id: 1,
        meta: { _thumbnail_id: '900' },
        content: `<!-- wp:image -->
<figure class="wp-block-image"><img src="https://chesamel.com/wp-content/uploads/2024/11/chart-1024x683.jpg" alt="Chart"/></figure>
<!-- /wp:image -->
<!-- wp:paragraph -->
<p>See <a href="https://chesamel.com/services/marketing-engine/">our work</a> and <a href="https://www.bcg.com/report">BCG</a>.</p>
<!-- /wp:paragraph -->`,
      },
    ]),
  );
  expect(posts[0].body).toBe(
    '![Chart](/wp-content/uploads/2024/11/chart-1024x683.jpg)\n\nSee [our work](/services/marketing-engine/) and [BCG](https://www.bcg.com/report).\n',
  );
  expect(media).toEqual([
    'https://chesamel.com/wp-content/uploads/2024/11/chart-1024x683.jpg',
    'https://chesamel.com/wp-content/uploads/2024/12/hero.png',
  ]);
});

test('a post without a featured image has no hero', () => {
  const { posts } = importBlogPosts(wxr([{ id: 1 }]));
  expect(posts[0].data.hero).toBeUndefined();
});

test('a YouTube embed becomes a privacy-friendly video player', () => {
  const { posts } = importBlogPosts(
    wxr([
      {
        id: 1,
        content: `<!-- wp:embed {"url":"https://youtu.be/rxUUd0T5D7o?si=abc","type":"video","providerNameSlug":"youtube"} -->
<figure class="wp-block-embed is-type-video is-provider-youtube wp-block-embed-youtube"><div class="wp-block-embed__wrapper">
https://youtu.be/rxUUd0T5D7o?si=abc
</div></figure>
<!-- /wp:embed -->`,
      },
    ]),
  );
  expect(posts[0].body).toBe(
    '<iframe src="https://www.youtube-nocookie.com/embed/rxUUd0T5D7o" title="YouTube video" width="560" height="315" loading="lazy" allowfullscreen></iframe>\n',
  );
});

test('lists use a single space after the marker', () => {
  const { posts } = importBlogPosts(
    wxr([{ id: 1, content: '<ul class="wp-block-list"><li>One</li><li>Two</li></ul><ol><li>First</li></ol>' }]),
  );
  expect(posts[0].body).toBe('- One\n- Two\n\n1. First\n');
});

test('an image the live site no longer has is left out and reported', () => {
  const gone = 'https://chesamel.com/wp-content/uploads/2023/07/gone-1024x683.webp';
  const { posts, missingImages } = importBlogPosts(
    wxr([
      {
        id: 1,
        slug: 'qatar',
        content: `<p>Before.</p><figure class="wp-block-image"><img src="${gone}" alt="Doha skyline"/></figure><p>After.</p>`,
      },
    ]),
    { missingMedia: new Set([gone]) },
  );
  expect(posts[0].body).toBe('Before.\n\nAfter.\n');
  expect(missingImages).toEqual([{ address: '/qatar/', image: '/wp-content/uploads/2023/07/gone-1024x683.webp', alt: 'Doha skyline' }]);
});

test('a media address missing its slash after the domain is repaired', () => {
  const { posts, media } = importBlogPosts(
    wxr([{ id: 1, content: '<img src="https://chesamel.comwp-content/uploads/2019/05/team.jpg" alt="Team"/>' }]),
  );
  expect(posts[0].body).toBe('![Team](/wp-content/uploads/2019/05/team.jpg)\n');
  expect(media).toEqual(['https://chesamel.com/wp-content/uploads/2019/05/team.jpg']);
});

test('a link with no text is dropped, keeping anything inside it', () => {
  const { posts } = importBlogPosts(
    wxr([{ id: 1, content: '<p>Join <a href="https://transtechsocial.org/"><br></a>us<a href="/services/x/"></a>.</p>' }]),
  );
  expect(posts[0].body).toBe('Join  \nus.\n');
});
