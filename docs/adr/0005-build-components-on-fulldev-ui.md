# Build the Components on Fulldev UI, copied into the repo

The Components are built on [Fulldev UI](https://ui.full.dev) (MIT, vanilla Astro and Tailwind v4) instead of being hand-built. Its source is copied into `src/components/ui/` through the shadcn registry (`npx shadcn add @fulldev/<name>`), never imported from an npm package, so every line is ours to read, patch and keep. Chesamel Components stay thin wrappers that pass the brand's classes to the Fulldev building blocks: button, card, breadcrumb, tabs, carousel, marquee, toggle group, navigation menu, sheet and accordion. We chose this so tested, accessible pieces replace hand-written markup and scripts, while the brand stays in charge.

**The brand wins (ADR-0002).** Fulldev's theme tokens (`--primary`, `--background`, `--border`, `--ring`, …) are mapped onto the brand tokens in `src/styles/global.css` and never point anywhere else. `--radius: 0` is the one setting for corners: every building block is square, and raising it rounds them all. There is no `.dark` theme. The few corners that were rounded before Fulldev (the header's controls, the footer's social links, the skip link, the style guide's logo panels) follow `--radius` too since #35, through `rounded-md` and `rounded-lg`, because the live site's controls are square. Where a Fulldev default and ADR-0002 disagree, ADR-0002 wins, either through the token mapping or through the classes a Component passes.

## Pinned version

Fulldev UI **v0.26.0** (git tag `fulldev-ui@0.26.0`, 2026-10-26), style `base-vega`, from the registry in `components.json`. The shadcn CLI used was `shadcn@4.23.0`.

The registry serves the newest release, not a pinned one. At the time of copying, the served files matched the `fulldev-ui@0.26.0` source with the Vega style applied.

## Updating safely

Updates are pulled deliberately, one building block at a time, never automatically.

1. Read Fulldev's `CHANGELOG.md` up to the release you want, and confirm the registry now serves it (the newest GitHub release named `fulldev-ui@<version>`).
2. Never run `shadcn init` or `add @fulldev/init` over this setup: `init` replaces the theme tokens.
3. Re-add one item: `npx shadcn@<version> add @fulldev/<name> --overwrite`. On this Mac, prefix `npm_config_os=darwin` (`~/.npmrc` sets `os=linux`).
4. Review the diff. The overwrite drops our local patches, so put back every one listed below. Each is marked `Chesamel patch (ADR-0005)` in the source.
5. Run `npm run check` and the full Playwright and axe suite. Compare before and after screenshots of every page at 1440px and 390px.
6. Update the pinned version above.

## Local patches

- **Carousel works right to left** (`carousel/carousel.astro`, `carousel-content.astro`, `carousel-item.astro`, `carousel-previous.astro`, `carousel-next.astro`). Fulldev's Carousel ignores `dir="rtl"`, and Embla reads its direction only from its options, so a right-to-left page slid every card out of view. The patch passes Embla the computed direction, mirrors the arrow keys, mirrors the default chevrons, and uses logical sides (`-ms-4`, `ps-4`, `-start-12`, `-end-12`) for the slide gaps and the floating buttons.
- **Carousel viewport takes attributes** (`carousel-content.astro`, #35). `viewportProps` reach the scrolling viewport, so the Slider can give a natively scrolling row a tab stop until the carousel starts.
- **Carousel buttons follow `--radius`** (`carousel-previous.astro`, `carousel-next.astro`). Fulldev makes them `rounded-full`, which no radius setting reaches.
- **Inactive tab text passes WCAG AA** (`tabs/tabs-trigger.astro`). Fulldev's 60% foreground is about 3:1 on the muted list with the brand tokens. 80% is about 4.9:1.
- **No faint focus outline everywhere** (`src/styles/global.css`). `@fulldev/init` sets `outline-ring/50` on every element. That would swap the browser's focus outline for a faint Indigo one, which is hard to see on Black, so the base layer leaves it out.

Data Slot's tabs and toggle groups ignore the reading direction for arrow keys. `src/components/follow-reading-direction.ts` fixes that for the Tabs Section and the filters, not in the copies, because the logic lives in the `@data-slot/*` packages.

The Marquee (added in #35 for the client-logo strip) is copied as delivered, with no local patch: it already follows the reading direction, pauses on hover, focus and its toggle, and stays still under reduced motion.

`@fulldev/init` also adds a `prefers-reduced-motion` rule that cuts every animation and transition to almost nothing for visitors who ask for less motion. It is kept as delivered.

## Dependencies

Accepted with the ticket: Embla (`embla-carousel`, and `embla-carousel-auto-scroll` for the Marquee, added in #35), the `@data-slot/*` packages, `tw-animate-css`, `shadcn` (for `shadcn/tailwind.css`), `components.json`, and the `@/*` path alias. Fulldev also brings `cn` and `class-variance-authority` (its class helpers), `@lucide/astro` (its icons), and `@data-slot/dialog` with Fulldev's Dialog, which its Sheet is built on.

## Consequences

- The Header keeps its own disclosure menus. Fulldev's Navigation Menu opens on hover, animates one shared panel and covers wide screens only. On phones it would need a second, Sheet-based menu. Adopting it is a visible change, left to #35 with the rest of the live site's look and motion.
- The Team Member card keeps its native `<details>` for the bio. Fulldev's Accordion needs JavaScript to open; `<details>` works without it.
- The filters' buttons use Data Slot's roving focus: Tab reaches one button per filter, and the arrow keys move between its buttons, as in the WAI-ARIA toolbar pattern. Before, Tab stopped on every button.
- Without JavaScript, every tab panel still shows and the Case Study slider still scrolls natively, as before. The Tabs and Case Study slider Components keep these fallbacks.
- Fulldev's Button and Card bring their own height, padding, weight, rings and shadows. The brand resets for them live in `src/components/button.ts` and `src/components/card.ts`, so each Component passes them in one place.
