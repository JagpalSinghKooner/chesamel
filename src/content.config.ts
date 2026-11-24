import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { blogPostSchema } from './content/blog-schema';
import { podcastSchema, webinarSchema, reportSchema } from './content/insight-schemas';

// A Blog Post's file path is its address: blog/foo.md is served at /foo/,
// blog/news/foo.md (WordPress's former `news` type) at /news/foo/.
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: blogPostSchema,
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

export const collections = { blog, podcasts, webinars, reports };
