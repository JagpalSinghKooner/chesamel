// The theme's colour roles as data, for the style-guide page and its test
// (ADR-0006). The values live only in src/styles/theme.css, one per palette;
// `paletteValues` reads them from there, so this file names roles and never a
// colour. Every role in theme.css must be listed here: the test checks.

export interface Role {
  // The role's background utility, written in full so Tailwind generates it:
  // `bg-` and the role's name.
  swatch: string;
  use: string;
}

export const roleOf = (r: Role) => r.swatch.slice('bg-'.length);

export interface RoleGroup {
  title: string;
  roles: Role[];
}

export const roleGroups: RoleGroup[] = [
  {
    title: 'Surfaces',
    roles: [
      { swatch: 'bg-page', use: 'The page behind everything' },
      { swatch: 'bg-surface', use: 'Light bands and panels' },
      { swatch: 'bg-panel', use: 'White boxes: cards, menus, form fields' },
      { swatch: 'bg-band-dark', use: 'Dark bands' },
      { swatch: 'bg-band-dark-raised', use: 'Cards on a dark band' },
      { swatch: 'bg-band-indigo', use: 'Indigo bands and heroes' },
      { swatch: 'bg-logo-strip', use: 'Live’s dark client-logo strip' },
      { swatch: 'bg-footer', use: 'The footer' },
      { swatch: 'bg-scrim', use: 'Overlays on images and dialogs' },
    ],
  },
  {
    title: 'Text',
    roles: [
      { swatch: 'bg-heading', use: 'Headings on light surfaces' },
      { swatch: 'bg-hero-title', use: 'The title of a Pillar’s or Service’s light hero' },
      { swatch: 'bg-body', use: 'Body text, tags and captions' },
      { swatch: 'bg-subtle', use: 'Large text, icons and quiet lines only' },
      { swatch: 'bg-emphasis', use: 'Indigo text and marks on light surfaces' },
      { swatch: 'bg-inverse', use: 'Text on dark and coloured fills' },
      { swatch: 'bg-body-on-dark', use: 'Body text on dark bands' },
      { swatch: 'bg-muted-on-dark', use: 'Quiet text on dark bands' },
      { swatch: 'bg-body-on-indigo', use: 'Body text on Indigo' },
      { swatch: 'bg-label-on-indigo', use: 'Small labels on Indigo' },
      { swatch: 'bg-cta-band-text', use: 'The line under a call-to-action heading' },
    ],
  },
  {
    title: 'Footer',
    roles: [
      { swatch: 'bg-footer-text', use: 'Footer text and links' },
      { swatch: 'bg-footer-heading', use: 'Office cities' },
      { swatch: 'bg-footer-rule', use: 'Rules between footer rows' },
      { swatch: 'bg-footer-marker', use: 'The dot before Global Offices' },
      { swatch: 'bg-footer-social', use: 'Social link tiles' },
    ],
  },
  {
    title: 'Lines',
    roles: [
      { swatch: 'bg-border', use: 'Borders and rules' },
      { swatch: 'bg-border-strong', use: 'Stronger borders and inputs' },
      { swatch: 'bg-border-on-dark', use: 'Borders on dark bands' },
      { swatch: 'bg-focus', use: 'Focus outlines' },
    ],
  },
  {
    title: 'Buttons',
    roles: [
      { swatch: 'bg-cta', use: 'Call to action' },
      { swatch: 'bg-cta-foreground', use: 'Call to action text' },
      { swatch: 'bg-cta-hover', use: 'Call to action, hovered' },
      { swatch: 'bg-cta-hover-foreground', use: 'Its text, hovered' },
      { swatch: 'bg-cta-arrow', use: 'Its arrow' },
      { swatch: 'bg-primary', use: 'Primary button' },
      { swatch: 'bg-primary-foreground', use: 'Primary button text' },
      { swatch: 'bg-primary-hover', use: 'Primary button, hovered' },
      { swatch: 'bg-button-dark', use: 'Dark button' },
      { swatch: 'bg-button-dark-foreground', use: 'Dark button text' },
      { swatch: 'bg-button-dark-hover', use: 'Dark button, hovered' },
      { swatch: 'bg-button-dark-hover-foreground', use: 'Its text, hovered' },
      { swatch: 'bg-button-light', use: 'Light button' },
      { swatch: 'bg-button-light-foreground', use: 'Light button text' },
      { swatch: 'bg-button-light-border', use: 'Light button border' },
      { swatch: 'bg-button-light-hover', use: 'Light button, hovered' },
      { swatch: 'bg-button-light-hover-foreground', use: 'Its text, hovered' },
      { swatch: 'bg-button-light-hover-border', use: 'Its border, hovered' },
      { swatch: 'bg-button-outline-border', use: 'Outline button border' },
      { swatch: 'bg-button-outline-hover', use: 'Outline button, hovered' },
      { swatch: 'bg-button-outline-hover-foreground', use: 'Its text, hovered' },
      { swatch: 'bg-detail', use: 'Small marks: arrows on dark buttons' },
      { swatch: 'bg-error', use: 'Invalid field borders' },
      { swatch: 'bg-error-fill', use: 'Behind error messages' },
      { swatch: 'bg-error-foreground', use: 'Error message text' },
    ],
  },
  {
    title: 'Pillar accents',
    roles: [
      { swatch: 'bg-accent-digital', use: 'Digital Transformation (and AI, BI)' },
      { swatch: 'bg-accent-marketing', use: 'Marketing Engine' },
      { swatch: 'bg-accent-investment', use: 'Investment & Impact Transformation' },
      { swatch: 'bg-accent-hybrid', use: 'Hybrid Workforce' },
      { swatch: 'bg-accent-digital-text', use: 'Its tag text' },
      { swatch: 'bg-accent-marketing-text', use: 'Its tag text' },
      { swatch: 'bg-accent-investment-text', use: 'Its tag text' },
      { swatch: 'bg-accent-hybrid-text', use: 'Its tag text' },
      { swatch: 'bg-accent-digital-fill', use: 'Its fill under white text' },
      { swatch: 'bg-accent-marketing-fill', use: 'Its fill under white text' },
      { swatch: 'bg-accent-investment-fill', use: 'Its fill under white text' },
      { swatch: 'bg-accent-hybrid-fill', use: 'Its fill under white text' },
    ],
  },
  {
    title: 'Homepage',
    roles: [
      { swatch: 'bg-hero-word', use: 'Hero word: Business' },
      { swatch: 'bg-hero-word-digital', use: 'Hero word: Digital' },
      { swatch: 'bg-hero-word-marketing', use: 'Hero word: Marketing' },
      { swatch: 'bg-hero-word-workforce', use: 'Hero word: Workforce' },
      { swatch: 'bg-highlight-marker', use: 'The marker behind the hero word' },
      { swatch: 'bg-hero-eyebrow', use: '“/ solutions”' },
      { swatch: 'bg-step-1', use: 'First step’s closing words' },
      { swatch: 'bg-step-2', use: 'Second step’s closing words' },
      { swatch: 'bg-step-3', use: 'Third step’s closing words' },
      { swatch: 'bg-step-underline', use: 'The line under them' },
    ],
  },
  {
    title: 'Tints and overlays',
    roles: [
      { swatch: 'bg-arrow-box', use: 'The arrow box on a Blog Post card.' },
      { swatch: 'bg-arrow-box-strong', use: 'The arrow box on Case Study cards and Pillar tiles.' },
      { swatch: 'bg-border-soft', use: 'Pillar tiles and the light Pager.' },
      { swatch: 'bg-filter-border', use: 'The team filter buttons.' },
      { swatch: 'bg-card-border', use: 'The Careers card.' },
      { swatch: 'bg-chip', use: 'The Careers card’s fact chips.' },
      { swatch: 'bg-chip-border-hover', use: 'Their outline on a hovered card.' },
      { swatch: 'bg-icon-button', use: 'The Team Member card’s icon buttons.' },
      { swatch: 'bg-rule-on-dark', use: 'Rules between rows on dark: header menu, cookie bar, hero panel.' },
      { swatch: 'bg-divider-on-dark', use: 'Rules above list items and cards on a dark band.' },
      { swatch: 'bg-chip-border-on-dark', use: 'Country chips on "Where we are".' },
      { swatch: 'bg-control-border-on-dark', use: 'Borders of small controls on dark: Pager, Slider, hero pause, Qatar.' },
      { swatch: 'bg-control-on-dark', use: 'The header’s controls and menu links, and their hover.' },
      { swatch: 'bg-control-on-dark-hover', use: 'Those controls, hovered.' },
      { swatch: 'bg-track-on-dark', use: 'A Slider’s progress track on dark.' },
      { swatch: 'bg-field', use: 'The Contact form fields.' },
      { swatch: 'bg-field-on-indigo', use: 'AA: live’s newsletter fields are 10% white, under which white text is 4.49:1 (#11).' },
      { swatch: 'bg-checkbox', use: 'Checkboxes on light surfaces.' },
      { swatch: 'bg-checkbox-on-indigo', use: 'Checkboxes on Indigo.' },
      { swatch: 'bg-header-overlay', use: 'The header over the homepage hero.' },
      { swatch: 'bg-overlay-on-image', use: 'The hero’s "/ solutions" panel, and its links hovered.' },
      { swatch: 'bg-overlay-control', use: 'The hero’s pause button.' },
      { swatch: 'bg-hero-shade-start', use: 'The shade over the hero’s video, left to right.' },
      { swatch: 'bg-hero-shade-middle', use: 'See above' },
      { swatch: 'bg-hero-shade-end', use: 'See above' },
      { swatch: 'bg-step-number', use: 'The number box on the homepage’s steps.' },
      { swatch: 'bg-footer-social-hover', use: 'A social tile, hovered.' },
    ],
  },
  {
    title: 'Brandmark rings and logo',
    roles: [
      { swatch: 'bg-rings-on-light', use: 'Rings on a light hero' },
      { swatch: 'bg-rings-on-indigo', use: 'Rings on an Indigo hero' },
      { swatch: 'bg-rings-on-dark', use: 'Rings on the call-to-action band' },
      { swatch: 'bg-rings-on-band', use: 'Rings on a dark band' },
      { swatch: 'bg-logo-on-dark', use: 'Logo on dark or Indigo' },
      { swatch: 'bg-logo-on-light', use: 'Logo on light' },
      { swatch: 'bg-logo-brand', use: 'Brandmark in Indigo' },
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
