// Decides whether one inventoried address behaves as the old site promised.

export type InventoryEntry =
  | { path: string; expect: 'page'; source: 'sitemap' | 'crawl' }
  | { path: string; expect: 'redirect'; to: string; source: 'sitemap' | 'crawl' };

// A Project Manager decision to change what an inventoried address does,
// instead of copying the live site. Kept apart from inventory.json because
// `npm run inventory` rewrites that file from the live site.
export type Decision =
  | { path: string; expect: 'page'; why: string }
  | { path: string; expect: 'redirect'; to: string; why: string };

export function applyDecisions(inventory: InventoryEntry[], decisions: Decision[]): InventoryEntry[] {
  const byPath = new Map(decisions.map((d) => [d.path, d]));
  const inventoried = new Set(inventory.map((e) => e.path));
  for (const d of decisions) {
    if (!inventoried.has(d.path)) throw new Error(`${d.path} is not in urls/inventory.json`);
  }
  return inventory.map((entry) => {
    const d = byPath.get(entry.path);
    if (!d) return entry;
    return d.expect === 'page'
      ? { path: entry.path, expect: 'page', source: entry.source }
      : { path: entry.path, expect: 'redirect', to: d.to, source: entry.source };
  });
}

export interface Observed {
  status: number;
  location: string | null;
}

// Returns why the address fails parity, or null if it passes.
export function judge(
  entry: InventoryEntry,
  observed: Observed,
  context: { pending: boolean; url: string },
): string | null {
  const problem = mismatch(entry, observed, context.url);
  // A pending address is allowed to be missing, but once it works it must
  // leave the pending list, or a later regression would go unnoticed.
  if (context.pending) return problem ? null : 'now resolves as expected: remove it from urls/pending.json';
  return problem;
}

function mismatch(entry: InventoryEntry, observed: Observed, url: string): string | null {
  if (entry.expect === 'page') {
    if (observed.status === 200) return null;
    return `expected a page, got ${observed.status}`;
  }

  // Only permanent redirects carry search ranking over to the new address.
  const permanent = observed.status === 301 || observed.status === 308;
  const landed = observed.location ? targetOf(observed.location, url) : null;
  if (permanent && landed === entry.to) return null;
  const got = landed ? `${observed.status} to ${landed}` : `${observed.status}`;
  return `expected a permanent redirect to ${entry.to}, got ${got}`;
}

// Same-site targets are inventoried as paths, so they match on any host
// (production or a Preview); off-site targets stay full addresses.
function targetOf(location: string, requested: string): string {
  const target = new URL(location, requested);
  if (target.origin !== new URL(requested).origin) return target.href;
  return decodeURI(target.pathname) + target.search;
}
