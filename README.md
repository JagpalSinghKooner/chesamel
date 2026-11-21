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
npm run preview   # serves dist/ at http://localhost:4321
```

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

## Deployment

Cloudflare Pages builds the repo through its Git integration (build command `npm run build`, output directory `dist`):

- Every push to `main` deploys the live site.
- Every pull request gets its own **Preview** deployment, linked from the pull request's checks.

GitHub Actions (`.github/workflows/ci.yml`) runs the type check and tests on every pull request and on `main`.

## Working on this repo

See `AGENTS.md` for the workflow rules and `GLOSSARY.md` for the project's vocabulary.
