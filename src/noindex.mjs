// Pages hidden from search engines. Seo.astro gives these a noindex meta and
// no canonical, and astro.config.mjs leaves them out of the sitemap. Plain .mjs so the
// Astro config can import it.
export const noindexPaths = ['/style-guide/', '/404/'];

/** @param {string} path */
export const isNoindex = (path) =>
  noindexPaths.includes(path.endsWith('/') ? path : `${path}/`);
