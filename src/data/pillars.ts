// The four Pillars as the homepage shows them. `label` is the live
// homepage's wording, which differs from the Pillar names in GLOSSARY.md.
//
// `accent` is the Pillar's secondary colour token (ADR-0002, Pillar accents).
// A Pillar's Services share it. Use it only for small non-text accents: tag
// borders, dots, icons, accent bars. Never as a fill behind text and never
// as text colour, since white or black text on these fails WCAG AA.
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
