// Converts WordPress block HTML into Markdown that Content Editors can edit.

import TurndownService from 'turndown';
// @ts-expect-error: the GFM plugin ships no types.
import { gfm } from 'turndown-plugin-gfm';

const LIVE = /https?:\/\/(?:www\.)?chesamel\.com(?=[/"'\s)]|$)/g;
const LIVE_MEDIA = /https?:\/\/(?:www\.)?chesamel\.com\/wp-content\/uploads\/[^"'\s)<>]+/g;

// Live-site links become root-relative, so they work on every Preview and
// keep working after cutover. Media then resolves to the copy in public/.
export function localiseUrls(html: string): string {
  return repair(html).replace(LIVE, '');
}

// Some old posts have "chesamel.comwp-content/…", missing the slash.
const repair = (html: string) => html.replace(/(https?:\/\/(?:www\.)?chesamel\.com)(?=wp-content\/)/g, '$1/');

export function mediaUrls(html: string): string[] {
  return [...new Set(repair(html).match(LIVE_MEDIA) ?? [])].map((u) => u.replace(/^http:/, 'https:').replace('//www.', '//'));
}

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
});
turndown.use(gfm);
// Embeds have no Markdown form; keep them as HTML.
turndown.keep(['iframe', 'video', 'audio']);

// WordPress stores a YouTube embed as a bare URL that it expands on render.
// The no-cookie host sets no tracking cookies before consent.
const YOUTUBE_ID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/;
turndown.addRule('youtube', {
  filter: (node) => node.nodeName === 'FIGURE' && /wp-block-embed-youtube/.test(node.getAttribute('class') ?? ''),
  replacement: (_content, node) => {
    const id = (node.textContent ?? '').match(YOUTUBE_ID)?.[1];
    if (!id) return '';
    return `\n\n<iframe src="https://www.youtube-nocookie.com/embed/${id}" title="YouTube video" width="560" height="315" loading="lazy" allowfullscreen></iframe>\n\n`;
  },
});

// A link with nothing in it can't be named by a screen reader (and fails
// WCAG), so it is dropped; anything inside it, such as a line break, stays.
turndown.addRule('emptyLink', {
  filter: (node) => node.nodeName === 'A' && !(node.textContent ?? '').trim() && !node.querySelector('img, iframe'),
  replacement: (content) => content,
});

// Turndown pads list markers to four characters ("-   item"); one space is
// what people type, and nested lists still line up.
const tidyLists = (md: string) => md.replace(/^(\s*)(-|\d+\.) +/gm, '$1$2 ');

export function toMarkdown(html: string): string {
  const markdown = tidyLists(turndown.turndown(localiseUrls(html))).trim();
  return markdown ? markdown + '\n' : '';
}
