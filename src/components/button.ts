// Shared by Button.astro and every Component that takes a list of buttons.

// Passed to Fulldev's Button wherever the brand's own button or link-button
// is drawn (ADR-0005): its fixed height, single line, medium weight, centring
// and press nudge give way to the size and look each Component sets.
export const brandButton = 'h-auto justify-start whitespace-normal font-semibold transition-colors active:not-aria-[haspopup]:translate-y-0';

// The visible keyboard-focus outline every link and button with a hover
// effect shares; pair it with an outline colour that suits the background.
// Fulldev's `outline-none` clears the outline style, so this sets it again.
export const focusOutline = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-solid';

export type ButtonTone = 'dark' | 'light' | 'indigo' | 'outline';

export interface ButtonAction {
  label: string;
  href: string;
  tone: ButtonTone;
}
