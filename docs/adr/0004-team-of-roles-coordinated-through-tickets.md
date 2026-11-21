# Site Agents work as a team of Roles, coordinated through GitHub tickets

Rather than one generalist agent, the site is run by a team of Site Agents, each holding one Role: Coordinator, Content Writer, Designer, Developer, SEO Specialist and Reviewer. The Project Manager is the only one who can create or change a Role. Requesters talk only to the Coordinator, in Slack. The Coordinator asks clarifying questions, splits each Change Request into GitHub tickets with blocking order, and copies the Requester's name and original words into every ticket. Roles hand work to each other through those tickets: for example, the Designer's Design Brief is posted as the handoff on a ticket that blocks the Developer's ticket. Agents wake only when their ticket or message arrives.

We chose this over a single agent because separate jobs keep each agent's instructions and Lessons focused, and because the Reviewer (quality of each ticket) and the Coordinator (whole request matches what was asked) give two independent checks before anything goes live. We chose tickets over agents messaging each other directly because tickets already give a visible history, an existing handoff process, and a place for the Project Manager to step in.

## Consequences

- Content changes (text, images, Insights) start immediately. Design, layout and SEO changes wait for the Project Manager's approval before any ticket starts.
- Approval is an explicit Approve button in Slack, never a reaction or a casual reply.
- If the Reviewer sends a ticket back twice, or a Requester rejects a Preview twice, the Coordinator escalates to the Project Manager instead of retrying.
- Each Role keeps its Role description, Diary and Lessons in its own folder in the repo (see ADR-0003).
