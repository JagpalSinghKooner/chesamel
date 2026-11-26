# Chesamel website

The public website of Chesamel Group, rebuilt as an [Astro](https://astro.build) site styled with [Tailwind CSS](https://tailwindcss.com). Content and design live as plain files in this repo (see `docs/adr/0001-leave-wordpress-for-files-in-git.md`).

## Requirements

- Node.js, at the version in `.node-version`
- npm

## Run the site locally

```sh
npm install
npm run dev
```

Open http://localhost:4321. The page reloads as you edit files in `src/`.

To see the production build instead:

```sh
npm run build     # writes the static site to dist/
npm run serve     # serves dist/ at http://localhost:4321 with Cloudflare Pages' rules
```

`npm run serve` applies `public/_redirects`, adds the trailing slash (`/x` to `/x/`) and returns the 404 page for unknown addresses, as Cloudflare does. `npm run preview` (Astro's own server) does none of these.

## Run the tests

First time only, download the test browser:

```sh
npx playwright install chromium
```

Then:

```sh
npm run check   # TypeScript and Astro type check
npm test        # builds the site, serves it, runs the smoke and accessibility tests
```

`npm test` runs two suites against the built site, for every page listed in `tests/pages.ts`:

- `tests/smoke.spec.ts`: the page returns 200, has a title and a visible `h1`, and logs no errors.
- `tests/a11y.spec.ts`: an [axe](https://github.com/dequelabs/axe-core) scan finds no WCAG 2.2 AA violations.

**When you add a page, add its path to `tests/pages.ts`** so both suites cover it.

If a test fails, `npx playwright show-report` opens the report with traces.

## Importing from WordPress

```sh
npm run import              # Blog Posts, plus every media file from live chesamel.com
npm run import -- --no-media
```

The importer (`scripts/import-wordpress/`) reads the newest `*.WordPress.*.xml` export in the repo root. The export contains personal data, so it is gitignored and must never be committed. It writes:

- Blog Posts to `src/content/blog/` (posts of WordPress's former `news` type to `src/content/blog/news/`). A file's path is its address.
- Media to `public/wp-content/uploads/`, at the same paths as on the live site. Files over Cloudflare's 25 MiB limit go to `media-oversized/` instead, which is kept but not served.
- `docs/content-team/blog-posts-without-industry.md`, the posts the content team still needs to give an Industry.
- `urls/pending.json`, minus every address it migrated.

Re-running overwrites the imported Blog Posts, so don't run it once Content Editors have edited them.

## Redirects and URL parity

Every address the old site served must keep working. `urls/inventory.json` records what the live site did at each address (`npm run inventory` rebuilds it from the live site). `tests/url-parity/site.spec.ts` checks the built site against it, locally and on each Preview.

- **Redirects** live in `public/_redirects`, one `<old> <new> 301` per line. Cloudflare Pages applies them, matching each address exactly (`/x` and `/x/` are different lines). Every redirect is a 301. Only exact addresses are supported: no `*` or `:placeholder` rules, because the local test server doesn't implement them.
- **Decisions** (`urls/decisions.json`) are where the Project Manager chose something different from the live site, such as sending an English copy under `/ar/` to its English twin. Each has a `why`. They live apart from the inventory because `npm run inventory` rewrites that file. When you change an inventoried redirect, change both files.
- **Pending** (`urls/pending.json`) is empty. A new live address found by a re-crawl lands there until it's migrated or redirected.
- `docs/arabic-pages/` keeps the three live pages that were written in Arabic, for phase 2.

Redirects belong to the SEO Specialist. Changing a redirect or an address needs the Project Manager's go-ahead.

## Deployment

Cloudflare Pages builds the repo through its Git integration (build command `npm run build`, output directory `dist`):

- Every push to `main` deploys the live site.
- Every pull request gets its own **Preview** deployment, linked from the pull request's checks.

Environment variables, set in the Cloudflare Pages project (never in the repo):

- `CLOUDFLARE_WEB_ANALYTICS_TOKEN`: the Cloudflare Web Analytics site token. When set, every page loads the analytics beacon; when unset (local builds, tests), none is rendered.

GitHub Actions (`.github/workflows/ci.yml`) runs the type check and tests on every pull request and on `main`.

## Working on this repo

See `AGENTS.md` for the workflow rules and `GLOSSARY.md` for the project's vocabulary.
