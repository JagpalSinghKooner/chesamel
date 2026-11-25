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

// Each tone's colours, hover and focus outline (see Button.astro). Shared so a
// plain <button>, such as the cookie banner's, can wear the same tone.
export const buttonTones: Record<ButtonTone, string> = {
  dark: 'border-0 bg-black text-white hover:bg-dark-grey focus-visible:outline-black',
  light: 'border-light-grey bg-white text-black hover:border-black focus-visible:outline-black',
  indigo: 'border-0 bg-indigo text-white hover:bg-black focus-visible:outline-indigo',
  outline: 'border-white/40 bg-transparent text-white hover:bg-white hover:text-black focus-visible:outline-white',
};

export interface ButtonAction {
  label: string;
  href: string;
  tone: ButtonTone;
}
