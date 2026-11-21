# Site Agents learn through Diaries, Consolidation and approved Lessons, kept in git

Each Site Agent starts every ticket with no memory, so "getting better over time" has to be built around the model, not inside it. Each Role writes a Diary freely, recording what it did and any Feedback it received. Every past ticket, review and correction stays searchable. Consolidation runs weekly or after every 10 finished tickets, whichever comes first. It reads the Diaries, merges repeats, drops contradictions, and proposes Lessons as a pull request. A Lesson only becomes something an agent acts on once the Project Manager approves it. Lessons belong to a Role unless Consolidation promotes them to Company Knowledge. All of it lives as files in Chesamel's own repo.

We rejected three alternatives. Letting agents write lasting memory freely learns fastest, but one wrong lesson gets repeated confidently forever. Retraining the model is costly, and Chesamel could not own the result. Hosted memory services store what agents believe with a third party, the same dependency trap ADR-0001 exists to avoid, and their conclusions are derived automatically rather than approved.

## Consequences

- The Project Manager receives a Lesson pull request roughly weekly and has to review it, or learning stalls.
- A Diary entry is never treated as truth on its own. Only approved Lessons and Company Knowledge are.
