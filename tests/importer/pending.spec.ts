import { test, expect } from '@playwright/test';
import { withoutMigrated } from '../../scripts/import-wordpress/pending';

const arabic = '/ar/المملكة-العربية-السعودية/';

test('removes migrated addresses from the pending list and keeps the rest in order', () => {
  const pending = JSON.stringify(['/a/', '/b/', '/c/']);
  const { json, removed } = withoutMigrated(pending, ['/b/', '/not-pending/']);
  expect(removed).toBe(1);
  expect(JSON.parse(json)).toEqual(['/a/', '/c/']);
});

test('writes non-ASCII addresses as UTF-8, never as \\u escapes', () => {
  // Read in either form, written back as the characters themselves.
  const escaped =
    '["/x/", "/ar/\\u0627\\u0644\\u0645\\u0645\\u0644\\u0643\\u0629-\\u0627\\u0644\\u0639\\u0631\\u0628\\u064a\\u0629-\\u0627\\u0644\\u0633\\u0639\\u0648\\u062f\\u064a\\u0629/"]';
  const { json } = withoutMigrated(escaped, ['/x/']);
  expect(json).toBe(`[\n  "${arabic}"\n]\n`);
  expect(json).not.toContain('\\u');
});
