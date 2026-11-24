// Classes every Chesamel card passes to Fulldev's Card (ADR-0005).
//
// Fulldev's card is a rounded, ringed, shadowed white panel with its own
// padding, gaps and small text. The brand card is a flat bordered box that
// keeps the text size and colour of where it sits, so those defaults are
// switched off here and each card sets its own border, background and padding.
export const brandCard = 'gap-0 overflow-visible bg-transparent py-0 text-[length:inherit] text-inherit shadow-none ring-0';

// For CardContent: the card's own padding replaces Fulldev's spacing.
export const brandCardContent = 'gap-0';
