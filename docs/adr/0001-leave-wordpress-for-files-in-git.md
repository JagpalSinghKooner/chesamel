# Leave WordPress for a site built from files in git

The current WordPress site runs on the Agency's proprietary theme, so ending the Agency relationship would take the site with it. We are rebuilding it as a code-based site whose content and design are plain files in Chesamel's own GitHub repo, styled with Tailwind using Chesamel's branding. Both Site Agents and Content Editors (through a visual editor) change those same files. We chose this over a self-owned WordPress theme because agents edit files in git far more reliably than a WordPress database, every change gets a Preview and a full history, and nothing depends on a third party.

## Consequences

- Content Editors use a git-based visual editor instead of the WordPress admin they may be used to.
- Existing URLs must be preserved exactly, with redirects for anything that moves, to protect SEO.
