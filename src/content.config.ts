import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { blogPostSchema } from './content/blog-schema';
import { caseStudySchema, industrySchema } from './content/case-study-schema';

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

export const collections = { blog, caseStudies, industries };
