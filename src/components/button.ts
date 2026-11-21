// Shared by Button.astro and every Component that takes a list of buttons.
export type ButtonTone = 'dark' | 'light' | 'indigo' | 'outline';

export interface ButtonAction {
  label: string;
  href: string;
  tone: ButtonTone;
}
