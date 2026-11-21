# Handoff

Each ticket runs in its own fresh context window. The **handoff** is the only memory that crosses from one window to the next, so it lives on GitHub, where every window can read it.

## Starting a ticket

1. Read the ticket with its comments: `gh issue view <n> --comments`. Handoffs from the tickets that blocked it are posted there.
2. Read `GLOSSARY.md` and any ADR in `docs/adr/` touching the ticket's area.
3. Create a branch for the ticket from the latest `main`.

Done when you can name every acceptance criterion and every open point raised in the handoffs.

## Finishing a ticket

The ticket is finished when its PR is merged with CI and the Preview green, every acceptance criterion is ticked, and the handoff is posted.

1. List the tickets this one unblocks: `gh api repos/{owner}/{repo}/issues/<n>/dependencies/blocking --jq '.[].number'`.
2. Post the handoff as a comment on the finished ticket and on each ticket it unblocks. Use this shape:

   ```markdown
   ## Handoff from #<n>: <title>

   **Landed:** <PR link>, one line on what now works.
   **Decisions:** choices made that the code doesn't explain, and any deviation from the ticket.
   **Gotchas:** traps the next window would otherwise rediscover.
   **For the next ticket:** what it must know or do first, including human steps still outstanding.
   ```

   Write only what the next window cannot learn from the code, the ticket, or git history.
3. Close the ticket.
4. End your final message to the Project Manager with the next frontier ticket (open, every blocker closed) and the line to paste into a new window: `Work on #<n>. Follow docs/agents/handoff.md.`
