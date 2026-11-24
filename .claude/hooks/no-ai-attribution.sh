#!/bin/bash
# Blocks any shell command that would put Claude/AI attribution on GitHub:
# "Generated with Claude Code" or a "Co-Authored-By: Claude" trailer, typed
# inline or inside a file passed with --body-file / -F / --file.
# The Project Manager's rule: no AI attribution in commits, PRs or comments.
pattern='generated with \[?claude code|co-authored-by:[[:space:]]*claude'
cmd=$(jq -r '.tool_input.command // ""')

if printf '%s' "$cmd" | grep -Eqi "$pattern"; then
  echo "Blocked: the command carries AI attribution (\"Generated with Claude Code\" or \"Co-Authored-By: Claude\"). Remove it and run again; this project never adds AI attribution." >&2
  exit 2
fi

# Files handed to gh or git as a message or body.
for f in $(printf '%s' "$cmd" | grep -Eo -- '(--body-file|--file|-F)[= ]+[^ ;&|]+' | sed -E 's/^(--body-file|--file|-F)[= ]+//'); do
  f="${f%\"}"; f="${f#\"}"; f="${f%\'}"; f="${f#\'}"
  if [ -f "$f" ] && grep -Eqi "$pattern" "$f"; then
    echo "Blocked: $f carries AI attribution (\"Generated with Claude Code\" or \"Co-Authored-By: Claude\"). Remove it from the file and run again." >&2
    exit 2
  fi
done
exit 0
