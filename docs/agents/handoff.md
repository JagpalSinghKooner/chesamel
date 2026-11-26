# Handoff

Each ticket runs in its own fresh context window. The **handoff** is the only memory that crosses from one window to the next, so it lives on GitHub, where every window can read it.

## Starting a ticket

1. Read the ticket with its comments: `gh issue view <n> --comments`. Handoffs from the tickets that blocked it are posted there.
2. Read `GLOSSARY.md` and any ADR in `docs/adr/` touching the ticket's area.
3. Check that the ticket settles every choice the work needs (its **Settled decisions** section, `.github/ISSUE_TEMPLATE/ticket.md`). If one is open, add the `needs-info` label, comment the question, and wait. Don't pick an answer. A ticket that predates the template is rewritten into it and grilled first.
4. Create a branch for the ticket from the latest `main`.

Done when you can name every acceptance criterion, every settled decision and every open point raised in the handoffs.

## During a ticket

A choice the ticket doesn't settle stops the work: `needs-info`, a comment with the question, and wait for the answer. Record each answer as a comment on the ticket. An answer that outlives the ticket also goes into the repo (`GLOSSARY.md`, an ADR or a `src/data/` file), and the ticket links to where.

## Finishing a ticket

The ticket is finished when its PR is merged with CI and the Preview green, every acceptance criterion is ticked, and the handoff is posted.

Every PR that changes layout or colour lists each changed Section with live chesamel.com's measured values (at 1440px and 390px wide) next to the Tailwind classes or theme roles chosen, and marks each one "matches" or "approved deviation: <which>". For example:

| Section | Property | Live 1440 | Live 390 | Classes | |
| --- | --- | --- | --- | --- | --- |
| Page hero | padding-top | 120px | 80px | `pt-20 lg:pt-30` | matches |
| Blog Post card | title size | 22px | 22px | `text-xl` (20px) | approved deviation: Tailwind scale |

### Measuring live

Measure live with the headless Playwright scripts in `scripts/measure-live/`, not by hand. They move the mouse and scroll first, since live's scripts wait for that. Output goes to `scripts/measure-live/out/` (ignored by git).

- `node scripts/measure-live/measure.mjs /what-we-do/ /culture/`: each block's background, padding, flex and grid rows, and its text's size, weight and colour.
- `node scripts/measure-live/colours.mjs /what-we-do/`: every colour the page uses, grouped as text (with the background behind it), fills, borders and SVG paint, with sample elements. Use it to give a new theme role its `live` value (ADR-0006).
- `node scripts/measure-live/shots.mjs /what-we-do/`, then the same with `BASE=http://localhost:4321 TAG=ours`, then `python3 scripts/measure-live/compare.py what-we-do_1440 ours`: live and ours side by side, for the PR's screenshots.

Every script takes `BASE` (default `https://chesamel.com`) and `WIDTHS` (default `1440,390`). Use Claude in Chrome only to spot-check one value, such as a hover state.

1. List the tickets this one unblocks: `gh api repos/{owner}/{repo}/issues/<n>/dependencies/blocking --jq '.[].number'`.
2. Post the handoff as a comment on the finished ticket and on each ticket it unblocks. Use this shape:

   ```markdown
   ## Handoff from #<n>: <title>

   **Landed:** <PR link>, one line on what now works.
   **Settled during work:** each question raised via needs-info and the answer given.
   **Gotchas:** traps the next window would otherwise rediscover.
   **For the next ticket:** what it must know or do first, including human steps still outstanding.
   ```

   Write only what the next window cannot learn from the code, the ticket, or git history.
3. Close the ticket.
4. End your final message to the Project Manager with the next frontier ticket (open, every blocker closed) and the line to paste into a new window: `Work on #<n>. Follow docs/agents/handoff.md.`
