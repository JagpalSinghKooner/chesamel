// Reading Case Studies and Industries for pages: newest first, with their
// address and the details a card shows.

import { getCollection, type CollectionEntry } from 'astro:content';
import type { PillarSlug, IndustrySlug } from '../data/taxonomy';
import { newestFirst, primaryPillar } from './shared';

export type CaseStudy = CollectionEntry<'caseStudies'>;
export type Industry = CollectionEntry<'industries'>;

export interface CaseStudySummary {
  title: string;
  address: string;
  date: Date;
  client?: string;
  image: { src: string; alt: string };
  pillars: PillarSlug[];
  industries: IndustrySlug[];
}

export const caseStudyAddress = (caseStudy: CaseStudy) => `/case-studies/${caseStudy.id}/`;
export const industryAddress = (industry: Industry) => `/industries/${industry.id}/`;

export function summariseCaseStudy(caseStudy: CaseStudy): CaseStudySummary {
  const { title, date, client, image, pillars, industries } = caseStudy.data;
  return { title, address: caseStudyAddress(caseStudy), date, client, image, pillars, industries };
}

export async function getCaseStudies(): Promise<CaseStudy[]> {
  const all = await getCollection('caseStudies');
  return all.sort(newestFirst);
}

// In the order the live site shows their cards.
export async function getIndustries(): Promise<Industry[]> {
  return (await getCollection('industries')).sort((a, b) => a.data.order - b.data.order);
}

// "Our Related Case Studies": the newest that share an Industry with this one,
// then the newest that share its main Pillar, never the Case Study itself.
export function related(caseStudy: CaseStudy, all: CaseStudy[], limit = 3): CaseStudy[] {
  const others = all.filter((c) => c.id !== caseStudy.id);
  const sameIndustry = others.filter((c) => c.data.industries.some((i) => caseStudy.data.industries.includes(i)));
  const samePillar = others.filter((c) => primaryPillar(c.data) === primaryPillar(caseStudy.data) && !sameIndustry.includes(c));
  return [...sameIndustry, ...samePillar].slice(0, limit);
}
