// What every Case Study and Industry file must hold. The build fails on any
// file that doesn't match, so a broken page never reaches the site.

import { z } from 'astro/zod';
import { pillarSlugs, industrySlugs } from '../data/taxonomy';
import { text, date, image } from './schema-parts';

export const caseStudySchema = z.object({
  title: text,
  date,
  // The hero subtitle.
  excerpt: text,
  // Shown as "/ objective" beside the story.
  objective: text,
  // The client's name; cards show it as "/ <client>".
  client: z.string().trim().min(1).optional(),
  // The card image. The Case Study page itself doesn't show it.
  image,
  // The first Pillar is the one cards and the hero show.
  pillars: z.array(z.enum(pillarSlugs)).min(1),
  industries: z.array(z.enum(industrySlugs)).default([]),
  description: z.string().optional(),
});

export type CaseStudyData = z.infer<typeof caseStudySchema>;

// An Industry page is laid out by its template; the file holds its copy.
export const industrySchema = z.object({
  title: text,
  subtitle: text,
  description: z.string().optional(),
  // Position of the Industry's card wherever all five are shown.
  order: z.number().int(),
  card: z.object({ image, summary: text }),
  intro: z.object({ eyebrow: text, heading: text, text }),
  // The "How we work" slides.
  steps: z.array(z.object({ image, heading: text, text })).min(1),
  experience: z.object({ eyebrow: text, heading: text, paragraphs: z.array(text).min(1) }),
  // Copy above the Industry's Case Study slider.
  caseStudies: z.object({ eyebrow: text, heading: text, text }),
  relatedPosts: z.object({ text }),
});

export type IndustryData = z.infer<typeof industrySchema>;
