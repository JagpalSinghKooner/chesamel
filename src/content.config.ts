import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { blogPostSchema } from './content/blog-schema';
import { caseStudySchema, industrySchema } from './content/case-study-schema';
import { podcastSchema, webinarSchema, reportSchema } from './content/insight-schemas';
import { pageSchema, pillarSchema, serviceSchema, teamMemberSchema, officeSchema } from './content/page-schemas';

// A Blog Post's file path is its address: blog/foo.md is served at /foo/,
// blog/news/foo.md (WordPress's former `news` type) at /news/foo/.
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: blogPostSchema,
});

// Case Studies are served at /case-studies/<file name>/.
const caseStudies = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/case-studies' }),
  schema: caseStudySchema,
});

// Industries are served at /industries/<file name>/; the file holds the page's copy.
const industries = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/industries' }),
  schema: industrySchema,
});

// Podcasts, Webinars and Reports: <type>/foo.md is served at /<type>/foo/.
const podcasts = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/podcasts' }),
  schema: podcastSchema,
});
const webinars = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/webinars' }),
  schema: webinarSchema,
});
const reports = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/reports' }),
  schema: reportSchema,
});

// Pillars are served at /services/<file name>/, their Services at
// /services/<pillar>/<file name>/ (services/<pillar>/<name>.md).
const pillars = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/pillars' }),
  schema: pillarSchema,
});
const services = defineCollection({
  loader: glob({ pattern: '*/*.md', base: './src/content/services' }),
  schema: serviceSchema,
});

// Standard Pages: pages/who-we-are/network.md is served at /who-we-are/network/.
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: pageSchema,
});

// Team Members and Offices have no pages of their own; Pages show them.
const team = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/team' }),
  schema: teamMemberSchema,
});
const offices = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/offices' }),
  schema: officeSchema,
});

export const collections = { blog, caseStudies, industries, podcasts, webinars, reports, pillars, services, pages, team, offices };
