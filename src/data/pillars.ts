// The four Pillars as the homepage shows them. `label` is the live
// homepage's wording, which differs from the Pillar names in GLOSSARY.md.
//
// `accent` is the Pillar's secondary colour token (ADR-0002, Pillar accents).
// A Pillar's Services share it. Use it only for small non-text accents: tag
// borders, dots, icons, accent bars. Never as a fill behind text and never
// as text colour, since white text on these is 2.3 to 3.2:1 and fails
// WCAG AA.
import type { PillarSlug } from './taxonomy';

export type PillarAccent = 'sky' | 'rose' | 'mint' | 'tiger';

export interface Pillar {
  name: string;
  label: string;
  summary: string;
  href: string;
  icon: string;
  accent: PillarAccent;
}

export const pillars: Pillar[] = [
  {
    name: 'Digital Transformation',
    label: 'Digital Transformation',
    summary: 'Innovate your digital experience and strategy',
    href: '/services/digital-transformation/',
    icon: '/images/pillars/digital-transformation.svg',
    accent: 'sky',
  },
  {
    name: 'Marketing Engine',
    label: 'Marketing Transformation',
    summary: 'Turn potential buyers into loyal customers',
    href: '/services/marketing-engine/',
    icon: '/images/pillars/marketing-engine.svg',
    accent: 'rose',
  },
  {
    name: 'Investment & Impact Transformation',
    label: 'Investments & Impact Transformation',
    summary: 'Reduce your carbon footprint and increase your social impact',
    href: '/services/investment-impact-transformation/',
    icon: '/images/pillars/investment-impact-transformation.svg',
    accent: 'mint',
  },
  {
    name: 'Hybrid Workforce',
    label: 'Workforce Transformation',
    summary: 'Build your ultimate team of business advocates',
    href: '/services/hybrid-workforce/',
    icon: '/images/pillars/hybrid-workforce.svg',
    accent: 'tiger',
  },
];

// The accent of every label an Insight can carry (its `pillars` field), for
// tags and accent bars. The four Pillars take their own; AI & Machine
// Learning and BI & Data Analytics take Sky, as on the live site (#42,
// ADR-0002).
export const labelAccents: Record<PillarSlug, PillarAccent> = {
  'ai-machine-learning': 'sky',
  'bi-data-analytics': 'sky',
  'digital-transformation': 'sky',
  'hybrid-workforce': 'tiger',
  'investment-impact-transformation': 'mint',
  'marketing-engine': 'rose',
};
