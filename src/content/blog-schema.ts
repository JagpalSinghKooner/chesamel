// What every Blog Post file must hold. The build fails on any file that
// doesn't match, so a broken post never reaches the site.

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'astro/zod';
import { pillarSlugs, industrySlugs } from '../data/taxonomy';

// Media lives in public/ at its old WordPress path. Builds and tests run from
// the repo root, so the working directory is the reliable anchor here.
const inPublic = (src: string) => src.startsWith('/') && existsSync(join(process.cwd(), 'public', decodeURI(src)));

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
  description: z.string().optional(),
});

export type BlogPostData = z.infer<typeof blogPostSchema>;
