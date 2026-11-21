// Pages hidden from search engines. Base.astro adds a noindex meta to these,
// and astro.config.mjs leaves them out of the sitemap. Plain .mjs so the
// Astro config can import it.
export const noindexPaths = ['/style-guide/'];

/** @param {string} path */
export const isNoindex = (path) =>
  noindexPaths.includes(path.endsWith('/') ? path : `${path}/`);
