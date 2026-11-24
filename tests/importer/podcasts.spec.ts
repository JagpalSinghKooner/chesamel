import { test, expect } from '@playwright/test';
import { importPodcasts } from '../../scripts/import-wordpress/podcasts';
import { wxr, ids } from './fixture';

const episodeLinks = {
  podcast_guest: 'Mandana Ahmadi',
  podcast_spotify: 'https://open.spotify.com/episode/2OfeM73Xzd2ReQYtPimrh1',
  podcast_amazon: 'https://music.amazon.co.uk/podcasts/4f3b/episodes/810d/stress',
  podcast_podcastaddict: 'https://podcastaddict.com/podcast/chesamel-unplugged/4416027',
  podcast_podchase: 'https://www.podchaser.com/podcasts/chesamel-unplugged-5305692/episodes/stress-171317341',
  podcast_length: '',
};

test('a published podcast becomes a Podcast at its original address, with its guest and listening links', () => {
  const { items } = importPodcasts(
    wxr([
      {
        id: 497,
        type: 'podcasts',
        title: 'Stress Awareness at Work',
        slug: 'stress-awareness-at-work',
        link: 'https://chesamel.com/podcasts/stress-awareness-at-work/',
        date: '2023-04-26 10:31:00',
        content:
          '<!-- wp:paragraph -->\n<p>Mani is the Founder of Alena.<a href="https://open.spotify.com/episode/2OfeM73Xzd2ReQYtPimrh1" target="_blank"></a></p>\n<!-- /wp:paragraph -->',
        meta: { ...episodeLinks, service: 'a:0:{}', industry: 'a:0:{}' },
      },
      { id: 2, type: 'podcasts', status: 'draft', slug: 'unfinished', link: 'https://chesamel.com/podcasts/unfinished/' },
      { id: 3, slug: 'a-blog-post' },
    ]),
  );

  expect(items).toHaveLength(1);
  const [podcast] = items;
  expect(podcast.address).toBe('/podcasts/stress-awareness-at-work/');
  expect(podcast.file).toBe('src/content/podcasts/stress-awareness-at-work.md');
  expect(podcast.data).toEqual({
    title: 'Stress Awareness at Work',
    date: '2023-04-26T10:31:00Z',
    guest: 'Mandana Ahmadi',
    listen: {
      spotify: 'https://open.spotify.com/episode/2OfeM73Xzd2ReQYtPimrh1',
      amazon: 'https://music.amazon.co.uk/podcasts/4f3b/episodes/810d/stress',
      podcastAddict: 'https://podcastaddict.com/podcast/chesamel-unplugged/4416027',
      podchaser: 'https://www.podchaser.com/podcasts/chesamel-unplugged-5305692/episodes/stress-171317341',
    },
    pillars: [],
  });
  expect(podcast.body).toBe('Mani is the Founder of Alena.\n');
});

test('a podcast keeps its Pillar and cover image, and leaves out an empty listening link', () => {
  const { items, media } = importPodcasts(
    wxr([
      { id: 4156, type: 'attachment', attachmentUrl: 'https://chesamel.com/wp-content/uploads/2025/02/Episode-10-1.png' },
      {
        id: 4155,
        type: 'podcasts',
        slug: 'shaping',
        link: 'https://chesamel.com/podcasts/shaping/',
        meta: { ...episodeLinks, podcast_podchase: '', _thumbnail_id: '4156', service: ids(356) },
      },
    ]),
  );
  expect(items[0].data.listen).not.toHaveProperty('podchaser');
  expect(items[0].data.pillars).toEqual(['digital-transformation']);
  expect(items[0].data.image).toEqual({ src: '/wp-content/uploads/2025/02/Episode-10-1.png', alt: '' });
  expect(media).toEqual(['https://chesamel.com/wp-content/uploads/2025/02/Episode-10-1.png']);
});
