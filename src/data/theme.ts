// Which palette fills the theme's colour and font roles (ADR-0006).
//
//   live   chesamel.com's look, measured from the live site
//   brand  Chesamel-Brand-Guidelines.pdf's colours and fonts
//
// Both palettes live in src/styles/theme.css. Change this one line to switch
// the whole site; tests/theme.spec.ts keeps the other palette passing axe.
export type Palette = 'live' | 'brand';

export const palette: Palette = 'live';
