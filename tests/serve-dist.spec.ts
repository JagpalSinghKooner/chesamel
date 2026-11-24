// The local test server must answer like Cloudflare Pages, or the parity
// check would pass locally and fail on the Preview (or the other way round).
import { test, expect } from '@playwright/test';
import { parseRedirects, route } from '../scripts/serve-dist';

const files = new Set(['index.html', '404.html', 'favicon.svg', 'contact/index.html', 'insights/blog/index.html']);
const site = (redirects = '') => ({ redirects: parseRedirects(redirects), exists: (f: string) => files.has(f) });

test('a _redirects line sends its address on with its status', () => {
  const s = site('# old address\n/contact-us/  /contact/  301\n');
  expect(route('/contact-us/', s)).toEqual({ status: 301, location: '/contact/' });
});

test('a built page is served at its address', () => {
  expect(route('/', site())).toEqual({ status: 200, file: 'index.html' });
  expect(route('/contact/', site())).toEqual({ status: 200, file: 'contact/index.html' });
  expect(route('/favicon.svg', site())).toEqual({ status: 200, file: 'favicon.svg' });
});

// Measured on chesamel.pages.dev: /insights/blog 308s to /insights/blog/,
// /404 serves 404.html with 200, /404.html 308s to /404, /nope is a 404.
test('addresses follow Cloudflare pretty URLs', () => {
  expect(route('/insights/blog', site())).toEqual({ status: 308, location: '/insights/blog/' });
  expect(route('/404', site())).toEqual({ status: 200, file: '404.html' });
  expect(route('/404.html', site())).toEqual({ status: 308, location: '/404' });
  expect(route('/contact/index.html', site())).toEqual({ status: 308, location: '/contact/' });
  expect(route('/nope', site())).toEqual({ status: 404, file: '404.html' });
});

test('an Arabic address matches its _redirects line whether written raw or percent-encoded', () => {
  const asked = encodeURI('/ar/المملكة-العربية-السعودية/');
  expect(route(asked, site('/ar/المملكة-العربية-السعودية/ /contact/ 301'))).toEqual({ status: 301, location: '/contact/' });
  expect(route(asked, site(`${asked} /contact/ 301`))).toEqual({ status: 301, location: '/contact/' });
});
