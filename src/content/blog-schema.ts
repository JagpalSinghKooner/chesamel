// What every Blog Post file must hold. The build fails on any file that
// doesn't match, so a broken post never reaches the site.

import { z } from 'astro/zod';
import { pillarSlugs, industrySlugs } from '../data/taxonomy';
import { inPublic } from './in-public';
import { seo } from './schema-parts';

export const blogPostSchema = z.object({
  title: z.string().trim().min(1),
  date: z.coerce.date().refine((d) => !Number.isNaN(d.getTime()), 'Not a valid date'),
  author: z.string().trim().min(1),
  hero: z
    .object({
      src: z.string().refine(inPublic, 'Image not found in public/'),
      alt: z.string(),
    })
    .optional(),
  pillars: z.array(z.enum(pillarSlugs)).min(1),
  industries: z.array(z.enum(industrySlugs)).default([]),
  ...seo,
});

export type BlogPostData = z.infer<typeof blogPostSchema>;
