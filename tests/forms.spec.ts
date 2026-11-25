import { test, expect, type Page, type Request } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { revealAll } from './reveal-all';
import { contactForm, newsletterForm, formMessages, type FormDefinition } from '../src/data/forms';

const WCAG_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

const cases: { name: string; path: string; prefix: string; form: FormDefinition }[] = [
  { name: 'contact', path: '/contact/', prefix: 'contact', form: contactForm },
  { name: 'newsletter', path: '/', prefix: 'newsletter', form: newsletterForm },
];

const valid: Record<string, string> = {
  email: 'test@example.com',
  firstname: 'Test',
  lastname: 'Person',
  phone: '+44 (0)20 1234-5678',
  company: 'Example Ltd',
  jobtitle: 'Tester',
  enquiry: 'Just testing',
};

const formOf = (page: Page, prefix: string) => page.locator(`#${prefix}-form`);

for (const { name, path, prefix, form } of cases) {
  test.describe(`${name} form`, () => {
    test('has the live fields, in order, with their required flags', async ({ page }) => {
      await page.goto(path);
      const inputs = formOf(page, prefix).locator('input[data-field]');
      await expect(inputs).toHaveCount(form.fields.length);
      for (const [i, field] of form.fields.entries()) {
        const input = inputs.nth(i);
        await expect(input).toHaveAttribute('name', field.name);
        await expect(input).toHaveAttribute('placeholder', field.placeholder);
        expect(await input.evaluate((el: HTMLInputElement) => el.required)).toBe(field.required);
        await expect(formOf(page, prefix).getByLabel(field.label, { exact: true })).toHaveCount(1);
      }
      await expect(formOf(page, prefix).getByRole('checkbox')).not.toBeChecked();
      await expect(formOf(page, prefix).getByRole('button', { name: form.submitLabel })).toHaveAttribute('type', 'submit');
    });

    test('checks a field when it loses focus', async ({ page }) => {
      await page.goto(path);
      const email = formOf(page, prefix).getByLabel('Email', { exact: true });
      await email.focus();
      await email.blur();
      await expect(email).toHaveAttribute('aria-invalid', 'true');
      await expect(email).toHaveAccessibleDescription(formMessages.required);

      await email.fill('not-an-email');
      await email.blur();
      await expect(email).toHaveAccessibleDescription(formMessages.email);

      await email.fill(valid.email);
      await expect(email).not.toHaveAttribute('aria-invalid');

      const phone = formOf(page, prefix).getByLabel('Phone number', { exact: true });
      await phone.fill('call me');
      await phone.blur();
      await expect(phone).toHaveAccessibleDescription(formMessages.phone);
    });

    test('an empty submit flags every required field and focuses the first', async ({ page }) => {
      await page.goto(path);
      await formOf(page, prefix).getByRole('button', { name: form.submitLabel }).click();
      for (const field of form.fields) {
        const input = formOf(page, prefix).getByLabel(field.label, { exact: true });
        if (field.required) await expect(input).toHaveAccessibleDescription(formMessages.required);
        else await expect(input).not.toHaveAttribute('aria-invalid');
      }
      await expect(formOf(page, prefix).getByText(formMessages.summary)).toBeVisible();
      await expect(formOf(page, prefix).getByLabel(form.fields[0].label, { exact: true })).toBeFocused();
      await revealAll(page);
      const results = await new AxeBuilder({ page }).include(`#${prefix}-form`).withTags(WCAG_AA).analyze();
      expect(results.violations).toEqual([]);
    });

    test('a valid submit shows the success message and sends nothing', async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const sent: Request[] = [];
      page.on('request', (request) => sent.push(request));

      for (const field of form.fields) await formOf(page, prefix).getByLabel(field.label, { exact: true }).fill(valid[field.name]);
      await formOf(page, prefix).getByRole('checkbox').check();
      await formOf(page, prefix).getByRole('button', { name: form.submitLabel }).click();

      const success = page.locator(`#${prefix}-form-success`);
      await expect(success).toBeVisible();
      await expect(success).toBeFocused();
      for (const line of form.success) await expect(success).toContainText(line);
      await expect(formOf(page, prefix)).toBeHidden();
      await page.waitForTimeout(500);

      expect(page.url()).toContain(path);
      // Scrolling to the form may load lazy images; anything else is a send.
      const origin = new URL(page.url()).origin;
      const sends = sent.filter((r) => {
        const url = new URL(r.url());
        return r.method() !== 'GET' || url.origin !== origin || url.search !== '' || r.resourceType() !== 'image';
      });
      expect(sends.map((r) => `${r.method()} ${r.url()}`)).toEqual([]);
      await revealAll(page);
      const results = await new AxeBuilder({ page }).withTags(WCAG_AA).analyze();
      expect(results.violations).toEqual([]);
    });
  });
}

test('the style guide shows both forms with their error and success states', async ({ page }) => {
  await page.goto('/style-guide/');
  for (const [name, form] of [
    ['contact', contactForm],
    ['newsletter', newsletterForm],
  ] as const) {
    const errors = page.locator(`#style-guide-${name}-errors-form`);
    await expect(errors.getByText(formMessages.required).first()).toBeVisible();
    await expect(errors.getByText(formMessages.summary)).toBeVisible();
    await expect(page.locator(`#style-guide-${name}-success-form-success`)).toContainText(form.success[0]);
    await expect(page.locator(`#style-guide-${name}-form`)).toBeVisible();
  }
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  for (const { name, path, prefix, form } of cases) {
    test(`the ${name} form cannot be submitted, so nothing is sent`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      const sent: Request[] = [];
      page.on('request', (request) => sent.push(request));

      for (const field of form.fields) await formOf(page, prefix).getByLabel(field.label, { exact: true }).fill(valid[field.name]);
      const submit = formOf(page, prefix).getByRole('button', { name: form.submitLabel });
      await expect(submit).toBeDisabled();
      await submit.click({ force: true });
      // Enter in a field is the other way to submit; a disabled default button blocks it.
      await formOf(page, prefix).getByLabel('Email', { exact: true }).press('Enter');
      await page.waitForTimeout(500);

      const url = new URL(page.url());
      expect(url.pathname).toBe(path);
      expect(url.search).toBe('');
      const sends = sent.filter((r) => r.method() !== 'GET' || new URL(r.url()).origin !== url.origin || r.resourceType() !== 'image');
      expect(sends.map((r) => `${r.method()} ${r.url()}`)).toEqual([]);
    });
  }
});
