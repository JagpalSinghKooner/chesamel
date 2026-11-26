// What the contact and newsletter forms do in the browser (issue #11):
// HubSpot's live validation, checked when a field loses focus and again on
// submit, then the success message in place of the form.
//
// Nothing is sent yet. `sendForm` is the one seam for #48, which posts the
// values to HubSpot there.
import { formMessages } from '../data/forms';

export type FormValues = Record<string, string>;

// #48: post `values` to HubSpot's form submission endpoint for `hubspotFormId`,
// and throw when it fails. Until then it sends nothing.
export async function sendForm(_hubspotFormId: string, _values: FormValues): Promise<void> {}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9+()\-.x ]+$/i;

// HubSpot's message for a field's value, or '' when it is fine.
export function problemWith(input: HTMLInputElement): string {
  const value = input.value.trim();
  if (!value) return input.required ? formMessages.required : '';
  if (input.type === 'email' && !emailPattern.test(value)) return formMessages.email;
  if (input.type === 'tel' && !phonePattern.test(value)) return formMessages.phone;
  return '';
}

function show(input: HTMLInputElement, message: string) {
  const error = document.getElementById(`${input.id}-error`);
  if (!error) return;
  error.textContent = message;
  error.hidden = !message;
  if (message) input.setAttribute('aria-invalid', 'true');
  else input.removeAttribute('aria-invalid');
}

export function enhance(form: HTMLFormElement) {
  // The browser's own bubbles give way to HubSpot's messages.
  form.noValidate = true;
  const inputs = [...form.querySelectorAll<HTMLInputElement>('input[data-field]')];
  const summary = form.querySelector<HTMLElement>('[data-form-summary]');
  const success = document.getElementById(`${form.id}-success`);
  const message = success?.querySelector('template');
  // Buttons stay disabled until now, so a submit without JavaScript sends nothing.
  for (const button of form.querySelectorAll<HTMLButtonElement>('[data-form-submit]')) button.disabled = false;

  for (const input of inputs) {
    input.addEventListener('blur', () => show(input, problemWith(input)));
    // Once flagged, a field clears as soon as it is fixed.
    input.addEventListener('input', () => {
      if (input.hasAttribute('aria-invalid')) show(input, problemWith(input));
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const invalid = inputs.filter((input) => {
      const message = problemWith(input);
      show(input, message);
      return message !== '';
    });
    if (summary) summary.hidden = invalid.length === 0;
    if (invalid.length > 0) {
      invalid[0].focus();
      return;
    }

    const values: FormValues = {};
    for (const [name, value] of new FormData(form)) values[name] = String(value);
    await sendForm(form.dataset.hubspotForm ?? '', values);

    form.hidden = true;
    // The live region was empty until now, so the message is announced.
    if (success && message) {
      success.append(message.content.cloneNode(true));
      success.focus();
    }
  });
}
