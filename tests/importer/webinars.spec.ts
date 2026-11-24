import { test, expect } from '@playwright/test';
import { importWebinars } from '../../scripts/import-wordpress/webinars';
import { wxr, ids } from './fixture';

// ACF's PHP-serialised array, holding strings as webinars do: a:1:{i:0;s:10:"technology";}.
const values = (...v: string[]) => `a:${v.length}:{${v.map((s, i) => `i:${i};s:${s.length}:"${s}";`).join('')}}`;

const webinar = (id: number, extra: object = {}) => ({
  id,
  type: 'webinars',
  slug: `webinar-${id}`,
  link: `https://chesamel.com/webinars/webinar-${id}/`,
  content: '',
  ...extra,
});

test('a published webinar becomes a Webinar at its original address, its video taken from webinar_url when the body has none', () => {
  const { items, media } = importWebinars(
    wxr([
      { id: 489, type: 'attachment', attachmentUrl: 'https://chesamel.com/wp-content/uploads/2024/11/maxresdefault.jpg' },
      webinar(488, {
        title: 'The Role of Finance, Technology &amp; Innovations Ahead of COP28',
        slug: 'cop28',
        link: 'https://chesamel.com/webinars/cop28/',
        date: '2024-11-06 10:27:11',
        meta: { _thumbnail_id: '489', webinar_url: 'https://www.youtube.com/watch?v=V01qJZc8rIU', service: ids(356), industry: ids(451) },
      }),
      webinar(2, { status: 'draft' }),
    ]),
  );
  expect(items).toHaveLength(1);
  expect(items[0].address).toBe('/webinars/cop28/');
  expect(items[0].file).toBe('src/content/webinars/cop28.md');
  expect(items[0].data).toEqual({
    title: 'The Role of Finance, Technology & Innovations Ahead of COP28',
    date: '2024-11-06T10:27:11Z',
    video: 'V01qJZc8rIU',
    image: { src: '/wp-content/uploads/2024/11/maxresdefault.jpg', alt: '' },
    pillars: ['digital-transformation'],
    industries: ['finance'],
  });
  expect(items[0].body).toBe('');
  expect(media).toEqual(['https://chesamel.com/wp-content/uploads/2024/11/maxresdefault.jpg']);
});

test('legacy slug strings in the service and industry fields count, alongside IDs, without duplicates', () => {
  const { items } = importWebinars(
    wxr([
      webinar(488, { meta: { service: values('digital-evolution', '356'), industry: values('technology', 'finance', '451', '455') } }),
      webinar(490, { meta: { service: values('people-performance', '361') } }),
      webinar(494, { meta: { service: values('bi-data-analytics', '361'), industry: values('technology') } }),
      webinar(5146, { meta: { service: values('ai-machine-learning', '356', '348'), industry: values('no-such-industry') } }),
    ]),
  );
  expect(items.map((w) => [w.data.pillars, w.data.industries])).toEqual([
    [['digital-transformation'], ['technology', 'finance']],
    [['hybrid-workforce', 'investment-impact-transformation'], []],
    [['bi-data-analytics', 'investment-impact-transformation'], ['technology']],
    [['ai-machine-learning', 'digital-transformation'], []],
  ]);
});

test('a YouTube embed WordPress stored with the generic embed handler becomes a no-cookie player, not a bare URL', () => {
  const content = `<!-- wp:embed {"url":"https://www.youtube.com/embed/yDvo1kyxEMM","type":"rich","providerNameSlug":"embed-handler"} -->
<figure class="wp-block-embed is-type-rich is-provider-embed-handler wp-block-embed-embed-handler"><div class="wp-block-embed__wrapper">
https://www.youtube.com/embed/yDvo1kyxEMM
</div></figure>
<!-- /wp:embed -->`;
  const [item] = importWebinars(wxr([webinar(5153, { content })])).items;
  expect(item.body).toContain('<iframe src="https://www.youtube-nocookie.com/embed/yDvo1kyxEMM"');
  expect(item.body).not.toContain('https://www.youtube.com/embed/yDvo1kyxEMM');
  // The body already shows a video, so none is added from webinar_url.
  expect(item.data).not.toHaveProperty('video');
});

test('the same video embedded twice in a row is shown once', () => {
  const embed = `<!-- wp:embed {"url":"https://youtu.be/Y8adzMrcGGs","type":"video","providerNameSlug":"youtube"} -->
<figure class="wp-block-embed is-type-video is-provider-youtube wp-block-embed-youtube"><div class="wp-block-embed__wrapper">
https://youtu.be/Y8adzMrcGGs
</div></figure>
<!-- /wp:embed -->`;
  const [item] = importWebinars(
    wxr([webinar(5146, { content: `${embed}\n\n${embed}`, meta: { webinar_url: 'https://www.youtube.com/watch?v=gaGyftgP64w' } })]),
  ).items;
  expect(item.body.match(/<iframe/g)).toHaveLength(1);
  expect(item.data).not.toHaveProperty('video');
});
