// What every Page, Pillar, Service, Team Member and Office file must hold. The
// build fails on any file that doesn't match, so a broken page never reaches
// the site.
//
// Pages, Pillars and Services are built from Sections: an ordered list in
// which each kind of Section is drawn by one Component (src/components/Sections.astro).
// A Content Editor reorders, adds or removes Sections; the look stays the
// Design System's.

import { z } from 'astro/zod';
import { pillarSlugs, teamSlugs } from '../data/taxonomy';
import { text, image } from './schema-parts';

const link = z.object({ label: text, href: text });
const heading = { eyebrow: text.optional(), heading: text };

const sectionTypes = [
  // A heading with paragraphs, optionally an image beside it and buttons.
  z.object({ type: z.literal('intro'), ...heading, paragraphs: z.array(text).default([]), image: image.optional(), links: z.array(link).default([]) }),
  // Big numbers: "150+ / People".
  z.object({ type: z.literal('stats'), items: z.array(z.object({ value: text, label: text })).min(1) }),
  // A grid of cards: approach steps, capabilities, benefits, partners.
  z.object({
    type: z.literal('cards'),
    ...heading,
    text: text.optional(),
    image: image.optional(),
    tone: z.enum(['light', 'off-white', 'dark']).default('light'),
    items: z.array(z.object({ heading: text, text: text.optional(), image: image.optional(), href: text.optional() })).min(1),
  }),
  // A heading with a list of points and an optional closing note: "How we work".
  z.object({ type: z.literal('points'), ...heading, paragraphs: z.array(text).default([]), items: z.array(text).min(1), note: text.optional(), image: image.optional(), tone: z.enum(['light', 'dark']).default('dark') }),
  // Buttons that switch between panels: What We Do's four Pillars.
  z.object({
    type: z.literal('tabs'),
    ...heading,
    paragraphs: z.array(text).default([]),
    items: z.array(z.object({ title: text, paragraphs: z.array(text).min(1), listLabel: text.optional(), list: z.array(text).default([]), href: text.optional() })).min(1),
  }),
  // A Pillar's own delivery models, or, without items, the shared three.
  z.object({ type: z.literal('deliveryModels'), ...heading, text: text.optional(), items: z.array(z.object({ heading: text, text, image: image.optional() })).optional() }),
  z.object({ type: z.literal('brands'), ...heading, text: text.optional() }),
  // Chosen Team Members, by file name.
  z.object({ type: z.literal('team'), heading: text.optional(), members: z.array(text).min(1) }),
  // Every Team Member, filtered by team.
  z.object({ type: z.literal('teamDirectory'), ...heading, text: text.optional() }),
  z.object({ type: z.literal('caseStudies'), ...heading, text: text.optional(), pillar: z.enum(pillarSlugs).optional() }),
  z.object({ type: z.literal('insights'), ...heading, text: text.optional(), pillar: z.enum(pillarSlugs).optional() }),
  z.object({ type: z.literal('industries'), ...heading, text: text.optional() }),
  z.object({ type: z.literal('logos') }),
  z.object({ type: z.literal('joinUs'), heading: text, text, links: z.array(link).min(1) }),
  z.object({ type: z.literal('newsletter'), eyebrow: text.optional(), heading: text.optional() }),
  z.object({ type: z.literal('offices'), ...heading, text: text.optional() }),
  // The open roles: every Page under /careers/.
  z.object({ type: z.literal('roles'), heading: text }),
  // The file's Markdown body, where it should sit among the Sections. A Page
  // without a body Section shows its body after the Sections.
  z.object({ type: z.literal('body') }),
  z.object({ type: z.literal('cta'), heading: text, text: text.optional() }),
] as const;

export const sectionSchema = z.discriminatedUnion('type', sectionTypes);
export type Section = z.infer<typeof sectionSchema>;

const hero = z.object({
  title: text,
  eyebrow: text.optional(),
  subtitle: text.optional(),
  paragraphs: z.array(text).default([]),
  // Short facts under the title, such as a role's "Hybrid", "Full-Time".
  details: z.array(text).default([]),
  links: z.array(link).default([]),
});

const built = {
  title: text,
  description: z.string().optional(),
  hero,
  sections: z.array(sectionSchema).default([]),
};

export const pageSchema = z.object(built);

// One of the six service areas at /services/<file name>/.
export const pillarSchema = z.object({
  ...built,
  order: z.number().int(),
});

// One of a Pillar's services at /services/<pillar>/<file name>/.
export const serviceSchema = z.object({ ...built, pillar: z.enum(pillarSlugs), order: z.number().int() });

// The body is the bio.
export const teamMemberSchema = z.object({
  name: text,
  role: text,
  teams: z.array(z.enum(teamSlugs)).default([]),
  order: z.number().int(),
  photo: image,
  linkedin: z.url().optional(),
  email: z.email().optional(),
});

export const officeSchema = z.object({
  name: text,
  country: text,
  city: text,
  address: z.array(text).min(1),
  phone: text.optional(),
  image: image.optional(),
  directions: z.url().optional(),
  order: z.number().int(),
});

export type PageData = z.infer<typeof pageSchema>;
export type PillarData = z.infer<typeof pillarSchema>;
export type ServiceData = z.infer<typeof serviceSchema>;
export type TeamMemberData = z.infer<typeof teamMemberSchema>;
export type OfficeData = z.infer<typeof officeSchema>;

// What a file must hold, before defaults are filled in; the importer writes these.
export type PillarFile = z.input<typeof pillarSchema>;
export type ServiceFile = z.input<typeof serviceSchema>;
export type PageFile = z.input<typeof pageSchema>;
export type TeamMemberFile = z.input<typeof teamMemberSchema>;
export type SectionFile = z.input<typeof sectionSchema>;
