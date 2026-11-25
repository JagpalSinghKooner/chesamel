# Follow the brand guidelines exactly, except body text colour

The Design System follows `Chesamel-Brand-Guidelines.pdf` to the letter, including DM Sans for subheadings even though Figtree is the stated primary typeface. The one deliberate deviation is body text: the guidelines specify Grey (#7F848C), which is about 3.8:1 contrast on white and fails WCAG AA (4.5:1). On the website body text uses Dark Grey (#3C464D); Grey is kept for large text (24px, or 18.7px bold, and up). Tags and captions also use Grey only at those sizes; small tags and captions use Dark Grey, because Grey fails AA there too. Do not "correct" body text back to Grey.

Arabic text uses IBM Plex Sans Arabic, because Figtree has no Arabic glyphs and the guidelines don't name an Arabic face. Secondary and accent colours stay limited to small accents (tags, icons) and are not assigned per Pillar.

Hex values follow the RGB values printed in the guidelines: Dark Grey is #3C464D (R60 G70 B77) and Medium Grey is #B5BBBE (R181 G187 B190). Earlier drafts of this ADR and the spec had #3C404D and #B5B8BE by mistake.

Type sizes on wide screens (#35): the guidelines give one size per style, sized for documents. From 1024px wide the website's headings grow to the live site's sizes (Heading 1 72px, Heading 2 52px, Heading 3 30px) and body text to 18px, keeping the guidelines' faces, weights, order and colours. Below 1024px the guidelines' sizes apply unchanged.
