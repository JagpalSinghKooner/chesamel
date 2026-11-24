// The pending list (urls/pending.json): live addresses not yet migrated, which
// the URL parity check skips. Migrated addresses leave it.

// Takes the file's text and returns the new text. JSON.stringify writes
// non-ASCII characters as themselves, so an Arabic address stays readable
// UTF-8 even if the file held it as \u escapes.
export function withoutMigrated(pendingJson: string, migrated: Iterable<string>): { json: string; removed: number } {
  const done = new Set(migrated);
  const pending: string[] = JSON.parse(pendingJson);
  const left = pending.filter((p) => !done.has(p));
  return { json: JSON.stringify(left, null, 2) + '\n', removed: pending.length - left.length };
}
