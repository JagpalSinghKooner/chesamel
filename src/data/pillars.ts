// The four Pillars as the homepage shows them. `label` is the live
// homepage's wording, which differs from the Pillar names in GLOSSARY.md.
export interface Pillar {
  name: string;
  label: string;
  summary: string;
  href: string;
  icon: string;
}

export const pillars: Pillar[] = [
  {
    name: 'Digital Transformation',
    label: 'Digital Transformation',
    summary: 'Innovate your digital experience and strategy',
    href: '/services/digital-transformation/',
    icon: '/images/pillars/digital-transformation.svg',
  },
  {
    name: 'Marketing Engine',
    label: 'Marketing Transformation',
    summary: 'Turn potential buyers into loyal customers',
    href: '/services/marketing-engine/',
    icon: '/images/pillars/marketing-engine.svg',
  },
  {
    name: 'Investment & Impact Transformation',
    label: 'Investments & Impact Transformation',
    summary: 'Reduce your carbon footprint and increase your social impact',
    href: '/services/investment-impact-transformation/',
    icon: '/images/pillars/investment-impact-transformation.svg',
  },
  {
    name: 'Hybrid Workforce',
    label: 'Workforce Transformation',
    summary: 'Build your ultimate team of business advocates',
    href: '/services/hybrid-workforce/',
    icon: '/images/pillars/hybrid-workforce.svg',
  },
];
