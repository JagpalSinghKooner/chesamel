// Static paging for the News, Our Work and Podcast listings (#42): page 1 at
// the listing's own address, page N at <listing>/page/N/. The routes are
// src/pages/insights/<listing>/[...page].astro.

import type { PaginateFunction } from 'astro';

// Each paged listing's address and page size, as on the live site. Kept here
// because getStaticPaths can't see a page's own constants.
export const listings = {
  news: { base: '/insights/blog/', perPage: 6 },
  ourWork: { base: '/insights/our-work/', perPage: 4 },
  podcasts: { base: '/insights/podcasts/', perPage: 3 },
} as const;

// getStaticPaths for a listing of `items`, `pageSize` a page. Each page gets
// its number and the last page's.
export function pagePaths(paginate: PaginateFunction, items: unknown[], pageSize: number) {
  return paginate(items, { pageSize }).map(({ params, props }) => ({
    params: { page: params.page ? `page/${params.page}` : undefined },
    props: { current: props.page.currentPage, last: props.page.lastPage },
  }));
}

// The address of page n of the listing at `base` (with its trailing slash).
export const pageHref = (base: string) => (n: number) => (n === 1 ? base : `${base}page/${n}/`);

// "News", or "News, page 2 of 34", for a page's title.
export const pageTitle = (name: string, current: number, last: number) => (current === 1 ? name : `${name}, page ${current} of ${last}`);
