// The theme's colour roles as data, for the style-guide page and its test
// (ADR-0006). The values live only in src/styles/theme.css, one per palette;
// `paletteValues` reads them from there, so this file names roles and never a
// colour. Every role in theme.css must be listed here: the test checks.

export interface Role {
  role: string;
  use: string;
}

export interface RoleGroup {
  title: string;
  roles: Role[];
}

export const roleGroups: RoleGroup[] = [
  {
    title: 'Surfaces',
    roles: [
      { role: 'page', use: 'The page behind everything' },
      { role: 'surface', use: 'Light bands and panels' },
      { role: 'panel', use: 'White boxes: cards, menus, form fields' },
      { role: 'band-dark', use: 'Dark bands' },
      { role: 'band-dark-raised', use: 'Cards on a dark band' },
      { role: 'band-indigo', use: 'Indigo bands and heroes' },
      { role: 'logo-strip', use: 'Live’s dark client-logo strip' },
      { role: 'footer', use: 'The footer' },
      { role: 'scrim', use: 'Overlays on images and dialogs' },
    ],
  },
  {
    title: 'Text',
    roles: [
      { role: 'heading', use: 'Headings on light surfaces' },
      { role: 'hero-title', use: 'The title of a Pillar’s or Service’s light hero' },
      { role: 'body', use: 'Body text, tags and captions' },
      { role: 'subtle', use: 'Large text, icons and quiet lines only' },
      { role: 'emphasis', use: 'Indigo text and marks on light surfaces' },
      { role: 'inverse', use: 'Text on dark and coloured fills' },
      { role: 'body-on-dark', use: 'Body text on dark bands' },
      { role: 'muted-on-dark', use: 'Quiet text on dark bands' },
      { role: 'body-on-indigo', use: 'Body text on Indigo' },
      { role: 'label-on-indigo', use: 'Small labels on Indigo' },
      { role: 'cta-band-text', use: 'The line under a call-to-action heading' },
    ],
  },
  {
    title: 'Footer',
    roles: [
      { role: 'footer-text', use: 'Footer text and links' },
      { role: 'footer-heading', use: 'Office cities' },
      { role: 'footer-rule', use: 'Rules between footer rows' },
      { role: 'footer-marker', use: 'The dot before Global Offices' },
      { role: 'footer-social', use: 'Social link tiles' },
    ],
  },
  {
    title: 'Lines',
    roles: [
      { role: 'border', use: 'Borders and rules' },
      { role: 'border-strong', use: 'Stronger borders and inputs' },
      { role: 'border-on-dark', use: 'Borders on dark bands' },
      { role: 'focus', use: 'Focus outlines' },
    ],
  },
  {
    title: 'Buttons',
    roles: [
      { role: 'cta', use: 'Call to action' },
      { role: 'cta-foreground', use: 'Call to action text' },
      { role: 'cta-hover', use: 'Call to action, hovered' },
      { role: 'cta-hover-foreground', use: 'Its text, hovered' },
      { role: 'cta-arrow', use: 'Its arrow' },
      { role: 'primary', use: 'Primary button' },
      { role: 'primary-foreground', use: 'Primary button text' },
      { role: 'primary-hover', use: 'Primary button, hovered' },
      { role: 'button-dark', use: 'Dark button' },
      { role: 'button-dark-foreground', use: 'Dark button text' },
      { role: 'button-dark-hover', use: 'Dark button, hovered' },
      { role: 'button-dark-hover-foreground', use: 'Its text, hovered' },
      { role: 'button-light', use: 'Light button' },
      { role: 'button-light-foreground', use: 'Light button text' },
      { role: 'button-light-border', use: 'Light button border' },
      { role: 'button-light-hover', use: 'Light button, hovered' },
      { role: 'button-light-hover-foreground', use: 'Its text, hovered' },
      { role: 'button-light-hover-border', use: 'Its border, hovered' },
      { role: 'button-outline-border', use: 'Outline button border' },
      { role: 'button-outline-hover', use: 'Outline button, hovered' },
      { role: 'button-outline-hover-foreground', use: 'Its text, hovered' },
      { role: 'detail', use: 'Small marks: arrows on dark buttons' },
      { role: 'error', use: 'Invalid field borders' },
      { role: 'error-fill', use: 'Behind error messages' },
      { role: 'error-foreground', use: 'Error message text' },
    ],
  },
  {
    title: 'Pillar accents',
    roles: [
      { role: 'accent-digital', use: 'Digital Transformation (and AI, BI)' },
      { role: 'accent-marketing', use: 'Marketing Engine' },
      { role: 'accent-investment', use: 'Investment & Impact Transformation' },
      { role: 'accent-hybrid', use: 'Hybrid Workforce' },
      { role: 'accent-digital-text', use: 'Its tag text' },
      { role: 'accent-marketing-text', use: 'Its tag text' },
      { role: 'accent-investment-text', use: 'Its tag text' },
      { role: 'accent-hybrid-text', use: 'Its tag text' },
      { role: 'accent-digital-fill', use: 'Its fill under white text' },
      { role: 'accent-marketing-fill', use: 'Its fill under white text' },
      { role: 'accent-investment-fill', use: 'Its fill under white text' },
      { role: 'accent-hybrid-fill', use: 'Its fill under white text' },
    ],
  },
  {
    title: 'Homepage',
    roles: [
      { role: 'hero-word', use: 'Hero word: Business' },
      { role: 'hero-word-digital', use: 'Hero word: Digital' },
      { role: 'hero-word-marketing', use: 'Hero word: Marketing' },
      { role: 'hero-word-workforce', use: 'Hero word: Workforce' },
      { role: 'highlight-marker', use: 'The marker behind the hero word' },
      { role: 'hero-eyebrow', use: '“/ solutions”' },
      { role: 'step-1', use: 'First step’s closing words' },
      { role: 'step-2', use: 'Second step’s closing words' },
      { role: 'step-3', use: 'Third step’s closing words' },
      { role: 'step-underline', use: 'The line under them' },
    ],
  },
  {
    title: 'Brandmark rings and logo',
    roles: [
      { role: 'rings-on-light', use: 'Rings on a light hero' },
      { role: 'rings-on-indigo', use: 'Rings on an Indigo hero' },
      { role: 'rings-on-dark', use: 'Rings on the call-to-action band' },
      { role: 'rings-on-band', use: 'Rings on a dark band' },
      { role: 'logo-on-dark', use: 'Logo on dark or Indigo' },
      { role: 'logo-on-light', use: 'Logo on light' },
      { role: 'logo-brand', use: 'Brandmark in Indigo' },
    ],
  },
];

export const fontRoles = ['font-heading', 'font-body', 'font-subheading', 'font-arabic'];

// Every `--name: value;` in theme.css's `[data-palette="<palette>"]` block.
export function paletteValues(css: string, palette: string): Record<string, string> {
  const block = css.match(new RegExp(`\\[data-palette="${palette}"\\]\\s*{([^}]*)}`));
  if (!block) throw new Error(`No ${palette} palette in theme.css`);
  const values: Record<string, string> = {};
  for (const [, name, value] of block[1].matchAll(/--([\w-]+):\s*([^;]+);/g)) values[name] = value.trim();
  return values;
}
