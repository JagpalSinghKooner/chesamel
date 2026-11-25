// Shared by Pager.astro and the scripts that page a listing in the browser
// (FilteredListing, the Team Directory).

// The page numbers shown: the current page and the next two, held back at the
// end so three still show (page 1 of 34: 1 2 3; page 34: 32 33 34).
export function pageWindow(current: number, last: number): number[] {
  const start = Math.max(1, Math.min(current, last - 2));
  const end = Math.min(last, start + 2);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

// A button Pager (Pager.astro without `href`) showing `current` of `last`:
// hides the numbers outside the window, marks the current one, hides first
// and previous on page 1 and next and last on the last page, and hides the
// whole Pager when everything fits on one page.
export function showPage(pager: HTMLElement, current: number, last: number) {
  pager.hidden = last <= 1;
  const shown = new Set(pageWindow(current, last));
  for (const button of pager.querySelectorAll<HTMLButtonElement>('[data-page]')) {
    const n = Number(button.dataset.page);
    button.parentElement!.hidden = !shown.has(n);
    if (n === current) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  }
  const steps: Record<string, [boolean, number]> = {
    first: [current > 1, 1],
    prev: [current > 1, current - 1],
    next: [current < last, current + 1],
    last: [current < last, last],
  };
  for (const button of pager.querySelectorAll<HTMLButtonElement>('[data-step]')) {
    const [visible, target] = steps[button.dataset.step!];
    button.parentElement!.hidden = !visible;
    button.dataset.target = String(target);
  }
}

// Calls `go` with the page a button Pager's control asks for.
export function onPage(pager: HTMLElement, go: (page: number) => void) {
  pager.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('button[data-page], button[data-step]');
    if (!button) return;
    go(Number(button.dataset.page ?? button.dataset.target));
  });
}
