// The Case Study and Industry schemas stop broken content reaching the site:
// the build fails on any file they reject.
import { test, expect } from '@playwright/test';
import { caseStudySchema, industrySchema } from '../src/content/case-study-schema';

const image = { src: '/images/hero.webp', alt: '' };

const caseStudy = {
  title: 'Business Intelligence in Finance',
  date: '2024-11-13T16:46:25Z',
  excerpt: 'Effectively analysing Business Intelligence (BI) in financial services.',
  objective: 'To consolidate and analyse data.',
  image,
  pillars: ['bi-data-analytics'],
  industries: ['finance'],
};

const industry = {
  title: 'Finance',
  subtitle: 'Providing the right intelligence for business growth.',
  order: 3,
  card: { image, summary: 'Helping the financial sector make better business decisions.' },
  intro: { eyebrow: '/ making an impact', heading: 'Data management, made easy', text: 'We partner with financial services clients.' },
  steps: [{ image, heading: 'Business deep dive', text: 'We get to know your business.' }],
  experience: { eyebrow: '/ our industry experience', heading: 'Helping finance grow', paragraphs: ['Managing risk is hard.'] },
  caseStudies: { eyebrow: '/ stories from the tech sector', heading: 'Our Work', text: 'See how we power our technology clients.' },
  relatedPosts: { text: 'Take a look at our latest content on the financial services industry.' },
};

const problems = (schema: typeof caseStudySchema | typeof industrySchema, data: unknown) => {
  const result = schema.safeParse(data);
  return result.success ? [] : result.error.issues.map((i) => i.path.join('.'));
};

test('a complete Case Study is accepted; client and description are optional', () => {
  expect(problems(caseStudySchema, caseStudy)).toEqual([]);
  expect(problems(caseStudySchema, { ...caseStudy, client: 'Google Cloud', description: 'Meta.' })).toEqual([]);
  expect(caseStudySchema.parse(caseStudy).date).toEqual(new Date('2024-11-13T16:46:25Z'));
});

test('a Case Study needs a title, date, excerpt, objective and at least one known Pillar', () => {
  const { title, date, excerpt, objective, ...rest } = caseStudy;
  expect(problems(caseStudySchema, rest).sort()).toEqual(['date', 'excerpt', 'objective', 'title']);
  expect(problems(caseStudySchema, { ...caseStudy, pillars: [] })).toEqual(['pillars']);
  expect(problems(caseStudySchema, { ...caseStudy, industries: ['retail'] })).toEqual(['industries.0']);
  expect(problems(caseStudySchema, { ...caseStudy, industries: undefined })).toEqual([]);
});

test('a Case Study card image is required and must exist in the repo', () => {
  expect(problems(caseStudySchema, { ...caseStudy, image: undefined })).toEqual(['image']);
  expect(problems(caseStudySchema, { ...caseStudy, image: { src: '/wp-content/uploads/nope.png', alt: '' } })).toEqual(['image.src']);
});

test('a complete Industry is accepted', () => {
  expect(problems(industrySchema, industry)).toEqual([]);
});

test('an Industry needs its card, at least one step, and images that exist in the repo', () => {
  expect(problems(industrySchema, { ...industry, steps: [] })).toEqual(['steps']);
  expect(problems(industrySchema, { ...industry, card: { ...industry.card, image: { src: '/nope.png', alt: '' } } })).toEqual(['card.image.src']);
  expect(problems(industrySchema, { ...industry, steps: [{ ...industry.steps[0], image: { src: '/nope.png', alt: '' } }] })).toEqual(['steps.0.image.src']);
  expect(problems(industrySchema, { ...industry, subtitle: ' ' })).toEqual(['subtitle']);
});
