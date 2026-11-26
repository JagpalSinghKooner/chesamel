# Follow the brand guidelines exactly, except body text colour

**Superseded by ADR-0006** (`0006-copy-live-colours-through-theme-roles.md`): the site now copies live chesamel.com's colours 1:1 through theme roles, with these guidelines kept as the switchable `brand` palette.

The Design System follows `Chesamel-Brand-Guidelines.pdf` to the letter, including DM Sans for subheadings even though Figtree is the stated primary typeface. The one deliberate deviation is body text: the guidelines specify Grey (#7F848C), which is about 3.8:1 contrast on white and fails WCAG AA (4.5:1). On the website body text uses Dark Grey (#3C464D); Grey is kept for large text (24px, or 18.7px bold, and up). Tags and captions also use Grey only at those sizes; small tags and captions use Dark Grey, because Grey fails AA there too. Do not "correct" body text back to Grey.

Arabic text uses IBM Plex Sans Arabic, because Figtree has no Arabic glyphs and the guidelines don't name an Arabic face. Secondary and accent colours stay limited to small accents (tags, icons). Since #41 each Pillar has one, below.

Hex values follow the RGB values printed in the guidelines: Dark Grey is #3C464D (R60 G70 B77) and Medium Grey is #B5BBBE (R181 G187 B190). Earlier drafts of this ADR and the spec had #3C404D and #B5B8BE by mistake.

Type sizes on wide screens (#35): the guidelines give one size per style, sized for documents. From 1024px wide the website's headings grow to the live site's sizes (Heading 1 72px, Heading 2 52px, Heading 3 30px) and body text to 18px, keeping the guidelines' faces, weights, order and colours. Below 1024px the guidelines' sizes apply unchanged.

## Amendment: Pillar accent colours (#41)

Each Pillar, and every Service under it, gets one secondary colour:

- Digital Transformation: Sky (#24ADEB)
- Marketing Engine: Rose (#FF4A7D)
- Investment & Impact Transformation: Mint (#1CB280)
- Hybrid Workforce: Tiger (#FF8A54)

It is used **only for small non-text accents**: tag borders, dots, icons and accent bars. Never as a fill behind text, and never as text colour. The live site fills Report tiles and hovered tags with these colours; we don't, because white text on them is 2.3 to 3.2:1 and fails WCAG AA. The mapping lives in `src/data/pillars.ts` as a token name (`accent`), never a hex value.

The two further service areas a Blog Post or Case Study can be labelled with (GLOSSARY.md › Pillar) take **Sky**, as on the live site (#42):

- AI & Machine Learning: Sky (#24ADEB)
- BI & Data Analytics: Sky (#24ADEB)

`labelAccents` in `src/data/pillars.ts` maps every label to its accent, and `src/components/accent.ts` turns an accent into full class names.
