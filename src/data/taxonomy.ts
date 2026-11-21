// The labels Blog Posts are filtered by. The slug is the live site's address
// segment (/services/<slug>/, /industries/<slug>/), so it never changes.
//
// The Pillar list holds the four Pillars plus two service areas the live site
// also labels and filters by (AI & Machine Learning, BI & Data Analytics).
// The Project Manager chose to keep all six, matching the live News filter.

export const pillarLabels = {
  'ai-machine-learning': 'AI & Machine Learning',
  'bi-data-analytics': 'BI & Data Analytics',
  'digital-transformation': 'Digital Transformation',
  'hybrid-workforce': 'Hybrid Workforce',
  'investment-impact-transformation': 'Investment & Impact Transformation',
  'marketing-engine': 'Marketing Engine',
} as const;

export const industryLabels = {
  energy: 'Energy',
  finance: 'Finance',
  healthcare: 'Healthcare',
  hospitality: 'Hospitality',
  technology: 'Technology',
} as const;

export type PillarSlug = keyof typeof pillarLabels;
export type IndustrySlug = keyof typeof industryLabels;

export const pillarSlugs = Object.keys(pillarLabels) as [PillarSlug, ...PillarSlug[]];
export const industrySlugs = Object.keys(industryLabels) as [IndustrySlug, ...IndustrySlug[]];
