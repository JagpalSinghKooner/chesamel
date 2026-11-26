# Copy live chesamel.com's colours 1:1, through themeable role variables

Supersedes ADR-0002. Decided by the Project Manager on 26 Nov 2026 (#52).

The site copies live chesamel.com's look **1:1, colours and fonts included**, so a visitor sees the site they know. It is coded so the brand guidelines' palette can replace it later with one change.

## How

- **One theme file, `src/styles/theme.css`,** holds every colour and font family as a role-based CSS variable: `--cta`, `--heading`, `--body`, `--band-dark`, `--band-indigo`, `--footer`, `--border`, `--accent-marketing`, `--font-heading`, and the rest. Role names describe a purpose, never a colour (`--cta`, not `--lime`).
- **Two palettes fill the roles**, each a `[data-palette="…"]` block in `theme.css`:
  - `live`, the default: values measured from chesamel.com with `scripts/measure-live/`, written as `rgb()`.
  - `brand`: the hex values of `Chesamel-Brand-Guidelines.pdf`, and the look ADR-0002 gave the site (Indigo calls to action, white step words on an Indigo underline, DM Sans subheadings).
- **The switch is one line:** `palette` in `src/data/theme.ts`. `Base.astro` sets it as `<html data-palette="…">`.
- **Components name roles, never colours.** Every role is a Tailwind utility through `@theme` (`bg-cta`, `text-heading`, `border-border-strong`, `font-subheading`). Tailwind's own palette and fonts are cleared, so a colour name such as `bg-indigo` produces nothing. Fulldev's theme tokens (`--primary`, `--background`, `--ring`, …) point at roles (ADR-0005). A tint or overlay is a role of its own (`control-on-dark`, `overlay-on-image`, `field-on-indigo`), never an opacity modifier on another role (`bg-inverse/10`).
- **Pillar accents stay keyed by Pillar:** `--accent-digital`, `--accent-marketing`, `--accent-investment`, `--accent-hybrid`, each with a `-text` role for tag text and a `-fill` role for fills under white text, where live's own value fails AA. An element sets `data-accent="digital"` (from `accent` in `src/data/pillars.ts`), and inside it the `pillar`, `pillar-text` and `pillar-fill` utilities (`border-pillar`, `text-pillar-text`, `bg-pillar-fill`) take that Pillar's roles, in either palette.
- **The guard:** `npm run check:toolkit` checks every colour utility class (`bg-`, `text-`, `border-`, `ring-`, `outline-`, `fill-`, `stroke-`, `decoration-`, `accent-`, `caret-`, `from-`/`via-`/`to-`, `divide-`, `placeholder-`, `shadow-`) in `src/` against the roles `theme.css` defines, so a colour name (`bg-sky-500`), a typo (`bg-cta-hovr`) or an arbitrary colour (`text-[white]`), which would all render nothing, fails. It also fails on an opacity modifier on a role, a hex, `rgb()`/`hsl()`/`oklch()`/`color-mix()` value, and a CSS colour keyword in a style or attribute (`color: white`, `fill="red"`). `theme.css` is the only exception. The Fulldev copies in `src/components/ui/` stay exempt (ADR-0005); their `bg-black/10` overlays point at the `scrim` role, and `black` is not a role our code may use.
- **Both palettes stay working:** `tests/theme.spec.ts` renders a few pages in the palette not in use and runs axe on them. `tests/style-guide.spec.ts` checks both palettes fill the same roles and the style guide shows every one.
- **A new colour** is a new role: a value in both palettes, a `--color-<role>` line in `theme.css`'s `@theme` block (a test checks every palette role has one), and an entry in `src/design-system/colours.ts`, which the style guide shows through the role's own utility.

## 1:1 means everything ADR-0002 overrode

Lime calls to action; the Pillar-coloured brandmark rings on Pillar, Service and Insight heroes, and Indigo rings on the call-to-action band; the hero's sliding words in their own colours (Business Indigo, Digital Sky, Marketing Rose, Workforce Tiger); the coloured closing words of the homepage steps; Report tiles, Case Study tags and hovered Pillar tiles and Blog Post tags filled with the Pillar accent; tag and Pillar-label text in the accent; the footer's own darker palette; Figtree for subheadings.

## The one exception: WCAG AA contrast

Where a live pairing fails AA (axe runs in CI), the role takes the nearest value that passes: the same hue moved toward black or white just far enough. Each is marked `AA:` in `theme.css`.

| Role | Live | Ours | Why |
| --- | --- | --- | --- |
| `body` | rgb(127 132 140) | rgb(60 70 77), Dark Grey | 3.5:1 on the off-white page. Live's grey stays as `subtle`, for large text (24px, or 18.7px bold) and icons only |
| `muted-on-dark` | rgb(127 132 140) | rgb(134 139 147) | 4.1:1 on the raised dark card |
| `label-on-indigo` | rgb(194 240 15), Lime | rgb(224 247 131) | 4.0:1 on Indigo for small labels ("/ get the latest industry news") |
| `body-on-indigo` | rgb(217 219 222) | rgb(236 237 238) | 3.8:1 on Indigo |
| `accent-*-text` | the accent itself | Sky rgb(25 120 164), Rose rgb(201 58 99), Mint rgb(20 128 92), Tiger rgb(169 92 56) | 2.1 to 3.0:1 as tag text on off-white |
| `accent-*-fill` | the accent itself | Sky rgb(26 126 172), Rose rgb(211 61 104), Mint rgb(21 134 97), Tiger rgb(178 97 59) | white text on the accent is 2.3 to 3.2:1 |
| `step-1` | rgb(115 66 255), Indigo | rgb(118 70 255) | 2.9:1 for the 30px step words on the raised dark card |
| `error-fill` | rgb(255 74 125), Rose | rgb(211 61 104) | white error text, 3.2:1 |
| `field-on-indigo` (newsletter fields) | 10% white on Indigo | 5% white | white text at 10% is 4.49:1 (#11) |

Also kept from before, for the same reason: Dark Grey (`body`) instead of grey for the Blog Post date and reading time, "read full bio" and the team filter buttons (#42), and the Careers card's chips keep their Indigo with a white outline on hover instead of live's translucent white (3.8:1).

## Carried over from ADR-0002, unchanged

- Type sizes already follow live: from 1024px wide, Heading 1 72px, Heading 2 52px, Heading 3 30px and body text 18px; below 1024px the guidelines' sizes.
- Arabic text uses IBM Plex Sans Arabic (`--font-arabic`), which Figtree lacks. It is loaded for Arabic characters only, so it sits second in every font stack.
- Hex values in the `brand` palette follow the RGB values printed in the guidelines: Dark Grey #3C464D, Medium Grey #B5BBBE.
- AI & Machine Learning and BI & Data Analytics take Digital Transformation's accent, as on live (#42).

## Consequences

- `--rings-on-light` is rgb(117 66 255 / 0.24), not Indigo's 115: that is what live's Contact hero measures.
- Open-role heroes have no rings, as on live.
- Layout is not part of this decision: header variants, the dark logo strip and the Section layouts are #43's, Insight detail pages #44's. Both use the roles here, adding new ones to `theme.css` when live needs a colour no role holds (measure it with `scripts/measure-live/`).
- `--logo-strip` is defined for #43: live's dark client-logo strip needs light logo files first.
- Switching to `brand` gives the guidelines' colours and DM Sans subheadings, not a full return to ADR-0002's layout choices.
