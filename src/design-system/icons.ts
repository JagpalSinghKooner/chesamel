// Every icon the site may show, by name. Icon.astro is the only thing that
// draws them (ADR-0005, Toolkit). To add one, import it here.
//
// Interface icons come from Lucide (@lucide/astro), one import per icon so
// only those used are bundled. Lucide icons are outlines; pass `filled` to
// Icon for a solid shape.
//
// Brand logos come from Simple Icons (CC0, simpleicons.org), saved in
// ./icons/ with their <title> and role removed, since Icon sets the label.
// From 16.38.1, except two Simple Icons removed: LinkedIn from 13.21.0 and
// Amazon Music from 14.15.0. Simple Icons has no Podchaser, so Podchaser
// shows Lucide's podcast icon (issue #41).
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

export const interfaceIcons = {
  menu: Menu,
  pause: Pause,
  play: Play,
  triangle: Triangle,
};

export const brandIcons = {
  linkedin: LinkedIn,
  facebook: Facebook,
  x: X,
  pinterest: Pinterest,
  youtube: YouTube,
  instagram: Instagram,
  spotify: Spotify,
  'amazon-music': AmazonMusic,
  'podcast-addict': PodcastAddict,
  podchaser: MicSignal,
  'google-maps': GoogleMaps,
};

export type IconName = keyof typeof interfaceIcons | keyof typeof brandIcons;
