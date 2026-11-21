import { test, expect } from '@playwright/test';
import { judge, type InventoryEntry } from './parity';

const page: InventoryEntry = { path: '/about-us/', expect: 'page', source: 'sitemap' };
const live = { pending: false, url: 'https://example.pages.dev/about-us/' };

test('a migrated page that serves 200 passes', () => {
  expect(judge(page, { status: 200, location: null }, live)).toBeNull();
});

test('a migrated page that returns 404 fails', () => {
  expect(judge(page, { status: 404, location: null }, live)).toBe('expected a page, got 404');
});

const redirect: InventoryEntry = {
  path: '/qatar/',
  expect: 'redirect',
  to: '/contact-us/',
  source: 'crawl',
};
const atQatar = { pending: false, url: 'https://example.pages.dev/qatar/' };

test('a permanent redirect to the expected path passes, relative or absolute', () => {
  expect(judge(redirect, { status: 301, location: '/contact-us/' }, atQatar)).toBeNull();
  expect(
    judge(redirect, { status: 308, location: 'https://example.pages.dev/contact-us/' }, atQatar),
  ).toBeNull();
});

test('a temporary redirect fails, because it does not pass on search ranking', () => {
  expect(judge(redirect, { status: 302, location: '/contact-us/' }, atQatar)).toBe(
    'expected a permanent redirect to /contact-us/, got 302 to /contact-us/',
  );
});

test('a redirect to the wrong place fails', () => {
  expect(judge(redirect, { status: 301, location: '/' }, atQatar)).toBe(
    'expected a permanent redirect to /contact-us/, got 301 to /',
  );
});

test('a redirect entry served as a page fails', () => {
  expect(judge(redirect, { status: 200, location: null }, atQatar)).toBe(
    'expected a permanent redirect to /contact-us/, got 200',
  );
});

test('a redirect off-site is compared as a full address', () => {
  const external: InventoryEntry = { ...redirect, to: 'https://www.linkedin.com/company/chesamel/' };
  expect(
    judge(external, { status: 301, location: 'https://www.linkedin.com/company/chesamel/' }, atQatar),
  ).toBeNull();
});

const pendingAtAbout = { pending: true, url: 'https://example.pages.dev/about-us/' };

test('a pending address that is still missing passes', () => {
  expect(judge(page, { status: 404, location: null }, pendingAtAbout)).toBeNull();
});

test('a pending address that now works fails, so the pending list keeps shrinking', () => {
  expect(judge(page, { status: 200, location: null }, pendingAtAbout)).toBe(
    'now resolves as expected: remove it from urls/pending.json',
  );
});
