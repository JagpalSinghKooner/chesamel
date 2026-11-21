import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { blogPostSchema } from './content/blog-schema';

// A Blog Post's file path is its address: blog/foo.md is served at /foo/,
// blog/news/foo.md (a former news item) at /news/foo/.
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: blogPostSchema,
});

export const collections = { blog };
