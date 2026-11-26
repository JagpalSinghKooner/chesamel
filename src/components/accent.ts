// Pillar accent classes, written out in full so Tailwind can see them: a
// class built at runtime (`border-accent-${accent}`) never gets its CSS.
// Each names a role in src/styles/theme.css (ADR-0006):
//   accent-*        the accent itself, for borders, bars, rings and icon boxes
//   accent-*-text   the accent as text, darkened where live's fails WCAG AA
//   accent-*-fill   the accent as a fill under white text, likewise
import type { PillarAccent } from '../data/pillars';

export const accentBorder: Record<PillarAccent, string> = {
  digital: 'border-accent-digital',
  marketing: 'border-accent-marketing',
  investment: 'border-accent-investment',
  hybrid: 'border-accent-hybrid',
};

// A tag: accent border and text, as on live.
export const accentTag: Record<PillarAccent, string> = {
  digital: 'border-accent-digital text-accent-digital-text',
  marketing: 'border-accent-marketing text-accent-marketing-text',
  investment: 'border-accent-investment text-accent-investment-text',
  hybrid: 'border-accent-hybrid text-accent-hybrid-text',
};

// A tag filled with the accent under white text, as on live.
export const accentFilledTag: Record<PillarAccent, string> = {
  digital: 'border-accent-digital-fill bg-accent-digital-fill text-inverse',
  marketing: 'border-accent-marketing-fill bg-accent-marketing-fill text-inverse',
  investment: 'border-accent-investment-fill bg-accent-investment-fill text-inverse',
  hybrid: 'border-accent-hybrid-fill bg-accent-hybrid-fill text-inverse',
};

// A tag inside a hovered or focused card fills, as on live.
export const accentTagFillOnHover: Record<PillarAccent, string> = {
  digital: 'group-hover:border-accent-digital-fill group-hover:bg-accent-digital-fill group-hover:text-inverse group-focus-visible:border-accent-digital-fill group-focus-visible:bg-accent-digital-fill group-focus-visible:text-inverse',
  marketing: 'group-hover:border-accent-marketing-fill group-hover:bg-accent-marketing-fill group-hover:text-inverse group-focus-visible:border-accent-marketing-fill group-focus-visible:bg-accent-marketing-fill group-focus-visible:text-inverse',
  investment: 'group-hover:border-accent-investment-fill group-hover:bg-accent-investment-fill group-hover:text-inverse group-focus-visible:border-accent-investment-fill group-focus-visible:bg-accent-investment-fill group-focus-visible:text-inverse',
  hybrid: 'group-hover:border-accent-hybrid-fill group-hover:bg-accent-hybrid-fill group-hover:text-inverse group-focus-visible:border-accent-hybrid-fill group-focus-visible:bg-accent-hybrid-fill group-focus-visible:text-inverse',
};

// A hovered or focused card itself fills with the accent under white text.
export const accentFillOnOwnHover: Record<PillarAccent, string> = {
  digital: 'hover:border-accent-digital-fill hover:bg-accent-digital-fill hover:text-inverse focus-visible:border-accent-digital-fill focus-visible:bg-accent-digital-fill focus-visible:text-inverse',
  marketing: 'hover:border-accent-marketing-fill hover:bg-accent-marketing-fill hover:text-inverse focus-visible:border-accent-marketing-fill focus-visible:bg-accent-marketing-fill focus-visible:text-inverse',
  investment: 'hover:border-accent-investment-fill hover:bg-accent-investment-fill hover:text-inverse focus-visible:border-accent-investment-fill focus-visible:bg-accent-investment-fill focus-visible:text-inverse',
  hybrid: 'hover:border-accent-hybrid-fill hover:bg-accent-hybrid-fill hover:text-inverse focus-visible:border-accent-hybrid-fill focus-visible:bg-accent-hybrid-fill focus-visible:text-inverse',
};

// The arrow box behind an icon on a hovered or focused card.
export const accentFillOnHover: Record<PillarAccent, string> = {
  digital: 'group-hover:bg-accent-digital group-focus-visible:bg-accent-digital',
  marketing: 'group-hover:bg-accent-marketing group-focus-visible:bg-accent-marketing',
  investment: 'group-hover:bg-accent-investment group-focus-visible:bg-accent-investment',
  hybrid: 'group-hover:bg-accent-hybrid group-focus-visible:bg-accent-hybrid',
};

// An accent bar or other solid mark with no text on it.
export const accentFill: Record<PillarAccent, string> = {
  digital: 'bg-accent-digital',
  marketing: 'bg-accent-marketing',
  investment: 'bg-accent-investment',
  hybrid: 'bg-accent-hybrid',
};

// The `accent` Button tone's fill (button.ts).
export const accentButton: Record<PillarAccent, string> = {
  digital: 'bg-accent-digital-fill',
  marketing: 'bg-accent-marketing-fill',
  investment: 'bg-accent-investment-fill',
  hybrid: 'bg-accent-hybrid-fill',
};

// A whole tile filled with the accent under white text (the Report card).
export const accentTile: Record<PillarAccent, string> = {
  digital: 'bg-accent-digital-fill',
  marketing: 'bg-accent-marketing-fill',
  investment: 'bg-accent-investment-fill',
  hybrid: 'bg-accent-hybrid-fill',
};

// Text in the accent: eyebrows and labels.
export const accentText: Record<PillarAccent, string> = {
  digital: 'text-accent-digital-text',
  marketing: 'text-accent-marketing-text',
  investment: 'text-accent-investment-text',
  hybrid: 'text-accent-hybrid-text',
};

// The brandmark rings drawn in the accent (BrandmarkRings).
export const accentRings: Record<PillarAccent, string> = {
  digital: 'text-accent-digital',
  marketing: 'text-accent-marketing',
  investment: 'text-accent-investment',
  hybrid: 'text-accent-hybrid',
};
