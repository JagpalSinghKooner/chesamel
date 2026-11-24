// What the standard Pages must show beyond being accessible: the Office list,
// the team filter, What We Do's Pillar tabs and the open roles.
import { test, expect } from '@playwright/test';

test('the contact page lists the UK, Qatar and Saudi Arabia offices with address and phone', async ({ page }) => {
  await page.goto('/contact/');
  const offices = page.locator('[data-office-list]');
  for (const [country, street, phone] of [
    ['UK', '29 Lincoln’s Inn Fields', '+44 203 371 8331'],
    ['Qatar', 'Burj Alfardan', '+974 40078422'],
    ['Saudi Arabia', 'Samama Tower', '+966 011 2432 694'],
  ]) {
    const office = offices.locator(`[data-office="${country}"]`);
    await expect(office.locator('address')).toContainText(street);
    await expect(office.getByRole('link', { name: phone })).toHaveAttribute('href', /^tel:\+\d+$/);
  }
});

test('Our Team lists every Team Member and filters them by team', async ({ page }) => {
  await page.goto('/who-we-are/our-team/');
  const cards = page.locator('[data-teams]');
  await expect(cards).toHaveCount(73);
  await page.getByRole('button', { name: 'Founders' }).click();
  await expect(page.locator('[data-teams]:visible')).toHaveCount(2);
  await expect(page.locator('[data-teams]:visible').getByRole('heading', { name: 'John Cofie' })).toBeVisible();
  await expect(page.locator('[data-team-count]')).toHaveText('2 people');
  await page.getByRole('button', { name: 'All' }).click();
  await expect(page.locator('[data-teams]:visible')).toHaveCount(73);
});

test('What We Do switches between the four Pillars', async ({ page }) => {
  await page.goto('/what-we-do/');
  const tabs = page.getByRole('tab');
  await expect(tabs).toHaveCount(4);
  await expect(page.getByRole('tabpanel')).toHaveCount(1);
  await page.getByRole('tab', { name: 'Hybrid Workforce' }).click();
  await expect(page.getByRole('tabpanel')).toContainText('Talent Hub');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Investment and Impact Transformation' })).toBeFocused();
});

test('Careers links each of the four open roles, and a role links to its application', async ({ page }) => {
  await page.goto('/careers/');
  const roles = page.getByRole('region', { name: 'Current Job Opportunities' }).getByRole('link');
  await expect(roles).toHaveCount(4);
  await page.getByRole('link', { name: 'Account Director' }).click();
  await expect(page).toHaveURL('/careers/account-director/');
  await expect(page.getByRole('link', { name: 'Apply for this role' })).toHaveAttribute('href', /linkedin\.com\/jobs/);
});

test('a Pillar page links its Services and shows its Case Studies', async ({ page }) => {
  await page.goto('/services/hybrid-workforce/');
  await expect(page.getByRole('heading', { level: 1, name: 'Hybrid Workforce' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Talent Hub' })).toHaveAttribute('href', '/services/hybrid-workforce/talent-strategy-organisational-development/');
  await expect(page.getByRole('heading', { name: 'Explore our related case studies' })).toBeVisible();
});
