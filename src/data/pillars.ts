// The four Pillars as the homepage shows them. `label` is the live
// homepage's wording, which differs from the Pillar names in GLOSSARY.md.
//
// `accent` names the Pillar's accent role (`--accent-digital`, ...) in
// src/styles/theme.css (ADR-0006). A Pillar's Services share it.
// src/components/accent.ts turns it into classes: the accent itself for marks,
// borders and rings, and AA-safe `-text` and `-fill` roles for tag text and
// fills under white text.
import type { PillarSlug } from './taxonomy';

export type PillarAccent = 'digital' | 'marketing' | 'investment' | 'hybrid';

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
    accent: 'digital',
  },
  {
    name: 'Marketing Engine',
    label: 'Marketing Transformation',
    summary: 'Turn potential buyers into loyal customers',
    href: '/services/marketing-engine/',
    icon: '/images/pillars/marketing-engine.svg',
    accent: 'marketing',
  },
  {
    name: 'Investment & Impact Transformation',
    label: 'Investments & Impact Transformation',
    summary: 'Reduce your carbon footprint and increase your social impact',
    href: '/services/investment-impact-transformation/',
    icon: '/images/pillars/investment-impact-transformation.svg',
    accent: 'investment',
  },
  {
    name: 'Hybrid Workforce',
    label: 'Workforce Transformation',
    summary: 'Build your ultimate team of business advocates',
    href: '/services/hybrid-workforce/',
    icon: '/images/pillars/hybrid-workforce.svg',
    accent: 'hybrid',
  },
];

// The accent of every label an Insight can carry (its `pillars` field), for
// tags and accent bars. The four Pillars take their own; AI & Machine
// Learning and BI & Data Analytics take Digital Transformation's Sky, as on
// the live site (#42, ADR-0006).
export const labelAccents: Record<PillarSlug, PillarAccent> = {
  'ai-machine-learning': 'digital',
  'bi-data-analytics': 'digital',
  'digital-transformation': 'digital',
  'hybrid-workforce': 'hybrid',
  'investment-impact-transformation': 'investment',
  'marketing-engine': 'marketing',
};
