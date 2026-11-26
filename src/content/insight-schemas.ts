// What every Podcast, Webinar and Report file must hold. The build fails on
// any file that doesn't match, so a broken item never reaches the site.

import { z } from 'astro/zod';
import { pillarSlugs, industrySlugs } from '../data/taxonomy';
import { text, date, image, seo } from './schema-parts';

const title = text;
const pillars = z.array(z.enum(pillarSlugs));

export const podcastSchema = z.object({
  title,
  date,
  guest: text,
  // The episode on each platform. There is no audio on the site itself.
  listen: z
    .object({
      spotify: z.url().optional(),
      amazon: z.url().optional(),
      podcastAddict: z.url().optional(),
      podchaser: z.url().optional(),
    })
    .refine((l) => Object.values(l).some(Boolean), 'Give at least one place to listen'),
  image: image.optional(),
  pillars: pillars.default([]),
  ...seo,
});

export const webinarSchema = z.object({
  title,
  date,
  // YouTube video ID of the recording, shown when the body has no player.
  video: z
    .string()
    .regex(/^[\w-]{11}$/, 'A YouTube video ID, such as fKUzKM9mY40')
    .optional(),
  image: image.optional(),
  pillars: pillars.default([]),
  industries: z.array(z.enum(industrySlugs)).default([]),
  ...seo,
});

export const reportSchema = z.object({
  title,
  date,
  image,
  pillars: pillars.min(1),
  // The HubSpot form that sends the full report; forms are wired up separately.
  hubspotFormId: z.uuid().optional(),
  ...seo,
});

export type PodcastData = z.infer<typeof podcastSchema>;
export type WebinarData = z.infer<typeof webinarSchema>;
export type ReportData = z.infer<typeof reportSchema>;
