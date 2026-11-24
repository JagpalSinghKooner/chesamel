# Chesamel

Rebuild of https://chesamel.com/.

## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues for this repo, via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

### Handoff

Each ticket runs in a fresh context window. Starting or finishing a ticket: follow `docs/agents/handoff.md`.

## Workflow

- One branch and one pull request per ticket. Name the branch `<issue number>-<short-slug>` and reference the issue in the pull request.
- Never commit or push to `main` directly. `main` changes only by merging a pull request.
- Merge only when CI (the `Build and test` and `URL parity on Preview` checks) and the Cloudflare Pages Preview are all green, and, for a Change Request, the Requester has given Approval.
- When you add a page, add its path to `tests/pages.ts` so the smoke and accessibility tests cover it.

## Commit rules

- Never add AI attribution anywhere on GitHub: no Claude co-author trailer in commits, no Claude Code footer in pull requests, issues or comments. `.claude/settings.json` turns attribution off, and `.claude/hooks/no-ai-attribution.sh` blocks any command that carries it.
- Every commit and pull request made for a Change Request must name the Requester and quote their original request.
