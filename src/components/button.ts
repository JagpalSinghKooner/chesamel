// Shared by Button.astro and every Component that takes a list of buttons.

// Passed to Fulldev's Button wherever the brand's own button or link-button
// is drawn (ADR-0005): its fixed height, single line, medium weight, centring
// and press nudge give way to the size and look each Component sets.
export const brandButton = 'h-auto justify-start whitespace-normal font-semibold transition-colors active:not-aria-[haspopup]:translate-y-0';

export type ButtonTone = 'dark' | 'light' | 'indigo' | 'outline';

export interface ButtonAction {
  label: string;
  href: string;
  tone: ButtonTone;
}
