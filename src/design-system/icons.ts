// Every icon the site may show, by name. Icon.astro is the only thing that
// draws them (ADR-0005, Toolkit). To add one, import it here.
//
// Interface icons come from Lucide (@lucide/astro), one import per icon so
// only those used are bundled. Lucide icons are outlines; `solid` marks the
// ones the site shows filled.
//
// Brand logos come from Simple Icons (CC0, simpleicons.org), saved in
// ./icons/ with their <title> and role removed, since Icon sets the label.
// From 16.38.1, except two Simple Icons removed: LinkedIn from 13.21.0 and
// Amazon Music from 14.15.0. Simple Icons has no Podchaser, so Podchaser
// shows Lucide's podcast icon (issue #41).
import ArrowRight from '@lucide/astro/icons/arrow-right';
import ArrowUpRight from '@lucide/astro/icons/arrow-up-right';
import Calendar from '@lucide/astro/icons/calendar';
import ChevronDown from '@lucide/astro/icons/chevron-down';
import ChevronLeft from '@lucide/astro/icons/chevron-left';
import ChevronRight from '@lucide/astro/icons/chevron-right';
import ChevronsLeft from '@lucide/astro/icons/chevrons-left';
import ChevronsRight from '@lucide/astro/icons/chevrons-right';
import Clock from '@lucide/astro/icons/clock';
import Mail from '@lucide/astro/icons/mail';
import MapPin from '@lucide/astro/icons/map-pin';
import Menu from '@lucide/astro/icons/menu';
import MicSignal from '@lucide/astro/icons/mic-signal';
import Pause from '@lucide/astro/icons/pause';
import Play from '@lucide/astro/icons/play';
import Triangle from '@lucide/astro/icons/triangle';
import AmazonMusic from './icons/amazon-music.svg';
import Facebook from './icons/facebook.svg';
import GoogleMaps from './icons/google-maps.svg';
import Instagram from './icons/instagram.svg';
import LinkedIn from './icons/linkedin.svg';
import Pinterest from './icons/pinterest.svg';
import PodcastAddict from './icons/podcast-addict.svg';
import Spotify from './icons/spotify.svg';
import X from './icons/x.svg';
import YouTube from './icons/youtube.svg';

export interface IconEntry {
  // An Astro component that draws an <svg>: a Lucide icon or an imported file.
  svg: (props: Record<string, unknown>) => unknown;
  // Filled with currentColor rather than outlined.
  solid: boolean;
}

const outline = (svg: IconEntry['svg']): IconEntry => ({ svg, solid: false });
const solid = (svg: IconEntry['svg']): IconEntry => ({ svg, solid: true });

export const interfaceIcons = {
  'arrow-right': outline(ArrowRight),
  'arrow-up-right': outline(ArrowUpRight),
  calendar: outline(Calendar),
  'chevron-down': outline(ChevronDown),
  'chevron-left': outline(ChevronLeft),
  'chevron-right': outline(ChevronRight),
  'chevrons-left': outline(ChevronsLeft),
  'chevrons-right': outline(ChevronsRight),
  clock: outline(Clock),
  mail: outline(Mail),
  'map-pin': outline(MapPin),
  menu: outline(Menu),
  pause: solid(Pause),
  play: solid(Play),
  triangle: solid(Triangle),
};

export const brandIcons = {
  linkedin: solid(LinkedIn),
  facebook: solid(Facebook),
  x: solid(X),
  pinterest: solid(Pinterest),
  youtube: solid(YouTube),
  instagram: solid(Instagram),
  spotify: solid(Spotify),
  'amazon-music': solid(AmazonMusic),
  'podcast-addict': solid(PodcastAddict),
  podchaser: outline(MicSignal),
  'google-maps': solid(GoogleMaps),
};

export type IconName = keyof typeof interfaceIcons | keyof typeof brandIcons;

export const icons: Record<IconName, IconEntry> = { ...interfaceIcons, ...brandIcons };
