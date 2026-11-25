// The Blog Post schema is what stops broken content reaching the site:
// the build fails on any file it rejects.
import { test, expect } from '@playwright/test';
import { blogPostSchema } from '../src/content/blog-schema';

const valid = {
  title: 'Shaping a Responsible Tech Strategy',
  date: '2024-12-10T12:20:12Z',
  author: 'Graham Jones',
  hero: { src: '/images/hero-poster.webp', alt: '' },
  pillars: ['digital-transformation'],
  industries: [],
};

const problems = (data: unknown) => {
  const result = blogPostSchema.safeParse(data);
  return result.success ? [] : result.error.issues.map((i) => i.path.join('.'));
};

test('a complete Blog Post is accepted', () => {
  expect(problems(valid)).toEqual([]);
  const parsed = blogPostSchema.parse(valid);
  expect(parsed.date).toEqual(new Date('2024-12-10T12:20:12Z'));
});

test('a Blog Post without a title, date or author is rejected', () => {
  const { title, date, author, ...rest } = valid;
  expect(problems(rest).sort()).toEqual(['author', 'date', 'title']);
  expect(problems({ ...valid, title: '  ' })).toEqual(['title']);
  expect(problems({ ...valid, date: 'last Tuesday' })).toEqual(['date']);
});

test('a Blog Post needs at least one known Pillar; Industries are optional but must be known', () => {
  expect(problems({ ...valid, pillars: [] })).toEqual(['pillars']);
  expect(problems({ ...valid, pillars: ['marketing'] })).toEqual(['pillars.0']);
  expect(problems({ ...valid, industries: ['retail'] })).toEqual(['industries.0']);
  expect(problems({ ...valid, industries: undefined })).toEqual([]);
});

test('a hero image must exist in the repo', () => {
  expect(problems({ ...valid, hero: { src: '/wp-content/uploads/nope.png', alt: '' } })).toEqual(['hero.src']);
  expect(problems({ ...valid, hero: undefined })).toEqual([]);
});
