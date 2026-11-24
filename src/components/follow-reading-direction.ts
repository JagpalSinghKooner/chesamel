// Data Slot's tabs and toggle groups always treat the right arrow as "next".
// Right to left, the left arrow should be. This swaps the two arrow keys
// before Data Slot sees them, on any root whose text runs right to left.
const swap: Record<string, string> = { ArrowLeft: 'ArrowRight', ArrowRight: 'ArrowLeft' };

export function followReadingDirection(root: HTMLElement) {
  root.addEventListener(
    'keydown',
    (event) => {
      const key = swap[event.key];
      if (!key || !event.isTrusted || getComputedStyle(root).direction !== 'rtl') return;
      event.stopImmediatePropagation();
      event.preventDefault();
      event.target!.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    },
    { capture: true },
  );
}
