// Reading Blog Posts for pages: newest first, with their address and the
// details a card shows.

import { getCollection, type CollectionEntry } from 'astro:content';
import type { PillarSlug, IndustrySlug } from '../data/taxonomy';
import { newestFirst } from './shared';

export type BlogPost = CollectionEntry<'blog'>;

export interface BlogPostSummary {
  title: string;
  address: string;
  date: Date;
  minutes: number;
  pillars: PillarSlug[];
  industries: IndustrySlug[];
}

// The file path under src/content/blog/ is the address.
export const addressOf = (post: BlogPost) => `/${post.id}/`;

const WORDS_PER_MINUTE = 200;

export function readingMinutes(markdown: string): number {
  const words = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter((w) => /\w/.test(w)).length;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function summarisePost(post: BlogPost): BlogPostSummary {
  return {
    title: post.data.title,
    address: addressOf(post),
    date: post.data.date,
    minutes: readingMinutes(post.body ?? ''),
    pillars: post.data.pillars,
    industries: post.data.industries,
  };
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog');
  return posts.sort(newestFirst);
}
