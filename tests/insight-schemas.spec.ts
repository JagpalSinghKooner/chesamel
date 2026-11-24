// The Podcast, Webinar and Report schemas stop broken content reaching the
// site: the build fails on any file they reject.
import { test, expect } from '@playwright/test';
import type { z } from 'astro/zod';
import { podcastSchema, webinarSchema, reportSchema } from '../src/content/insight-schemas';

const problems = (schema: z.ZodType, data: unknown) => {
  const result = schema.safeParse(data);
  return result.success ? [] : result.error.issues.map((i) => i.path.join('.')).sort();
};

const image = { src: '/wp-content/uploads/2024/11/Agile-Marketing.jpg', alt: '' };

const podcast = {
  title: 'Stress Awareness at Work',
  date: '2023-04-26T10:31:00Z',
  guest: 'Mandana Ahmadi',
  listen: { spotify: 'https://open.spotify.com/episode/2OfeM73Xzd2ReQYtPimrh1' },
  pillars: [],
};

const webinar = {
  title: 'What Does COP27 Mean For Your Business?',
  date: '2024-11-06T10:28:47Z',
  video: 'fKUzKM9mY40',
  pillars: ['bi-data-analytics'],
  industries: ['technology'],
};

const report = {
  title: 'Agile Marketing',
  date: '2024-11-12T12:27:07Z',
  image,
  pillars: ['marketing-engine'],
  hubspotFormId: '8b98f465-751c-4bac-a9e2-5fa99ad21572',
};

test('complete Podcasts, Webinars and Reports are accepted', () => {
  expect(problems(podcastSchema, podcast)).toEqual([]);
  expect(problems(webinarSchema, webinar)).toEqual([]);
  expect(problems(reportSchema, report)).toEqual([]);
});

test('every kind needs a title and a valid date', () => {
  for (const [schema, valid] of [
    [podcastSchema, podcast],
    [webinarSchema, webinar],
    [reportSchema, report],
  ] as const) {
    expect(problems(schema, { ...valid, title: ' ', date: 'last Tuesday' })).toEqual(['date', 'title']);
  }
});

test('a Podcast needs a guest and at least one place to listen, each a web address', () => {
  expect(problems(podcastSchema, { ...podcast, guest: '' })).toEqual(['guest']);
  expect(problems(podcastSchema, { ...podcast, listen: {} })).toEqual(['listen']);
  expect(problems(podcastSchema, { ...podcast, listen: { spotify: 'spotify episode 12' } })).toEqual(['listen.spotify']);
});

test('a Webinar video is a YouTube video ID, and its labels must be known', () => {
  expect(problems(webinarSchema, { ...webinar, video: 'https://www.youtube.com/watch?v=fKUzKM9mY40' })).toEqual(['video']);
  expect(problems(webinarSchema, { ...webinar, video: undefined })).toEqual([]);
  expect(problems(webinarSchema, { ...webinar, industries: ['retail'], pillars: ['digital-evolution'] })).toEqual(['industries.0', 'pillars.0']);
});

test('a Report needs a cover image that exists in the repo and at least one Pillar', () => {
  expect(problems(reportSchema, { ...report, image: undefined })).toEqual(['image']);
  expect(problems(reportSchema, { ...report, image: { src: '/wp-content/uploads/nope.jpg', alt: '' } })).toEqual(['image.src']);
  expect(problems(reportSchema, { ...report, pillars: [] })).toEqual(['pillars']);
  expect(problems(reportSchema, { ...report, hubspotFormId: 'form 12' })).toEqual(['hubspotFormId']);
});
