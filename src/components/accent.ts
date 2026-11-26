// Pillar accent classes, written out in full so Tailwind can see them: a
// class built at runtime (`border-${accent}`) never gets its CSS. Accents
// are for small marks only: borders, bars, icon boxes, never text or a fill
// behind text (ADR-0002).
import type { PillarAccent } from '../data/pillars';

export const accentBorder: Record<PillarAccent, string> = {
  sky: 'border-sky',
  rose: 'border-rose',
  mint: 'border-mint',
  tiger: 'border-tiger',
};

// The border of a hovered or focused card itself.
export const accentBorderOnOwnHover: Record<PillarAccent, string> = {
  sky: 'hover:border-sky focus-visible:border-sky',
  rose: 'hover:border-rose focus-visible:border-rose',
  mint: 'hover:border-mint focus-visible:border-mint',
  tiger: 'hover:border-tiger focus-visible:border-tiger',
};

// The arrow box behind an icon on a hovered or focused card.
export const accentFillOnHover: Record<PillarAccent, string> = {
  sky: 'group-hover:bg-sky group-focus-visible:bg-sky',
  rose: 'group-hover:bg-rose group-focus-visible:bg-rose',
  mint: 'group-hover:bg-mint group-focus-visible:bg-mint',
  tiger: 'group-hover:bg-tiger group-focus-visible:bg-tiger',
};

// An accent bar or other solid mark with no text on it.
export const accentFill: Record<PillarAccent, string> = {
  sky: 'bg-sky',
  rose: 'bg-rose',
  mint: 'bg-mint',
  tiger: 'bg-tiger',
};
