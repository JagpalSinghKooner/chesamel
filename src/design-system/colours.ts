// The brand palette as data, for the style-guide page and its test.
// The tokens themselves live in src/styles/global.css; keep the two in step.
// The test checks each swatch's rendered colour against the hex here.

export interface Colour {
  name: string;
  token: string;
  hex: string;
}

export interface ColourGroup {
  title: string;
  usage: string;
  colours: Colour[];
}

export const colourGroups: ColourGroup[] = [
  {
    title: 'Primary',
    usage: 'The predominant brand hue. Subheadings may be Indigo.',
    colours: [{ name: 'Indigo', token: 'indigo', hex: '#7342FF' }],
  },
  {
    title: 'Black and greys',
    usage:
      'Black for headings. Dark Grey for body text, tags and captions (ADR-0002). Grey only for text 24px or larger. Medium and Light Grey for borders and UI.',
    colours: [
      { name: 'Black', token: 'black', hex: '#141E25' },
      { name: 'Dark Grey', token: 'dark-grey', hex: '#3C464D' },
      { name: 'Grey', token: 'grey', hex: '#7F848C' },
      { name: 'Medium Grey', token: 'medium-grey', hex: '#B5BBBE' },
      { name: 'Light Grey', token: 'light-grey', hex: '#D9DBDE' },
    ],
  },
  {
    title: 'Off-whites',
    usage: 'Backgrounds.',
    colours: [
      { name: 'White', token: 'white', hex: '#FFFFFF' },
      { name: 'Off-white', token: 'off-white', hex: '#ECEDED' },
    ],
  },
  {
    title: 'Secondary (limited use only)',
    usage: 'Small accents such as tags and icons. Never large areas, never one per Pillar.',
    colours: [
      { name: 'Fuchsia', token: 'fuchsia', hex: '#DF73F0' },
      { name: 'Mint', token: 'mint', hex: '#1CB280' },
      { name: 'Tiger', token: 'tiger', hex: '#FF8A54' },
      { name: 'Rose', token: 'rose', hex: '#FF4A7D' },
      { name: 'Sky', token: 'sky', hex: '#24ADEB' },
    ],
  },
  {
    title: 'Accent (limited use only)',
    usage: 'Small accents, such as the lime detail in icons.',
    colours: [{ name: 'Lime', token: 'lime', hex: '#C3F00F' }],
  },
];
