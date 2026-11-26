// A Preview is never indexed (#54): Cloudflare Pages sends X-Robots-Tag
// noindex on every *.pages.dev address (public/_headers). Runs only against a
// deployed Preview (BASE_URL); the local server has no such rule.
import { test, expect } from '@playwright/test';

const preview = process.env.BASE_URL?.includes('.pages.dev');

test('a Preview tells search engines not to index it', async ({ request }) => {
  test.skip(!preview, 'Only a Preview on *.pages.dev sends the header');
  for (const path of ['/', '/insights/blog/', '/robots.txt']) {
    expect((await request.get(path)).headers()['x-robots-tag'], path).toBe('noindex');
  }
});
