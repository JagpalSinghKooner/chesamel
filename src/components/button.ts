// Shared by Button.astro and every Component that takes a list of buttons.

// Passed to Fulldev's Button wherever the brand's own button or link-button
// is drawn (ADR-0005): its fixed height, single line, medium weight, centring
// and press nudge give way to the size and look each Component sets.
export const brandButton = 'h-auto justify-start whitespace-normal font-semibold transition-colors active:not-aria-[haspopup]:translate-y-0';

// The visible keyboard-focus outline every link and button with a hover
// effect shares; pair it with an outline colour that suits the background.
// Fulldev's `outline-none` clears the outline style, so this sets it again.
export const focusOutline = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid';

// cta: the call to action (live's Lime), on dark bands
// primary: Indigo, on any background
// dark: on light backgrounds    light: bordered, on light backgrounds
// outline: bordered, on dark and Indigo backgrounds
// accent: filled with a Pillar's accent (Button's `accent` prop), as on
// live's Pillar and Service heroes
export type ButtonTone = 'cta' | 'primary' | 'dark' | 'light' | 'outline' | 'accent';

// Each tone's colours, hover and focus outline (see Button.astro), all theme
// roles (ADR-0006). Shared so a plain <button>, such as the cookie banner's,
// can wear the same tone.
export const buttonTones: Record<ButtonTone, string> = {
  cta: 'border-0 bg-cta text-cta-foreground hover:bg-cta-hover hover:text-cta-hover-foreground focus-visible:outline-inverse',
  primary: 'border-0 bg-primary text-primary-foreground hover:bg-primary-hover focus-visible:outline-focus',
  dark: 'border-0 bg-button-dark text-button-dark-foreground hover:bg-button-dark-hover hover:text-button-dark-hover-foreground focus-visible:outline-heading',
  light:
    'border-button-light-border bg-button-light text-button-light-foreground hover:border-button-light-hover-border hover:bg-button-light-hover hover:text-button-light-hover-foreground focus-visible:outline-heading',
  outline: 'border-button-outline-border bg-transparent text-inverse hover:bg-button-outline-hover hover:text-button-outline-hover-foreground focus-visible:outline-inverse',
  // The fill comes from accentButton (accent.ts).
  accent: 'border-0 text-inverse hover:bg-button-dark hover:text-button-dark-foreground focus-visible:outline-heading',
};

export interface ButtonAction {
  label: string;
  href: string;
  tone: ButtonTone;
}
