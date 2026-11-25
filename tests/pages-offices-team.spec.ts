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

test('Our Team starts on Founders, filters by team and pages 8 at a time', async ({ page }) => {
  await page.goto('/who-we-are/our-team/');
  const cards = page.locator('[data-teams]');
  const shown = page.locator('[data-teams]:visible');
  const filter = page.getByRole('group', { name: 'Filter by team' });
  const pager = page.getByRole('navigation', { name: 'Team pages' });
  await expect(cards).toHaveCount(73);
  await expect(filter.getByRole('button')).toHaveText([
    'Founders', 'Executive Leadership', 'Advisors', 'Growth', 'Marketing Transformation', 'Digital Transformation',
    'Workforce Transformation', 'Content and Experiences', 'GCC', 'All',
  ]);
  await expect(filter.getByRole('button', { name: 'Founders' })).toHaveAttribute('aria-pressed', 'true');
  await expect(shown).toHaveCount(2);
  await expect(shown.getByRole('heading', { name: 'John Cofie' })).toBeVisible();
  await expect(page.locator('[data-team-count]')).toHaveText('2 people');
  await expect(pager).toBeHidden();

  await filter.getByRole('button', { name: 'All' }).click();
  await expect(page.locator('[data-team-count]')).toHaveText('73 people');
  await expect(shown).toHaveCount(8);
  await expect(pager.getByRole('button', { name: /^Page \d+$/ }).filter({ visible: true })).toHaveText(['1', '2', '3']);
  const firstPage = await shown.locator('h3').allTextContents();
  await pager.getByRole('button', { name: 'Page 2' }).click();
  await expect(pager.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
  await expect(shown).toHaveCount(8);
  expect(await shown.locator('h3').allTextContents()).not.toEqual(firstPage);
  await pager.getByRole('button', { name: 'Last page' }).click();
  await expect(shown).toHaveCount(73 - 9 * 8);
  await expect(pager.getByRole('button', { name: 'Next page' })).toBeHidden();
});

test('a Team Member card links LinkedIn and email from icon buttons and opens the full bio', async ({ page }) => {
  await page.goto('/who-we-are/our-team/');
  const john = page.locator('[data-teams]:visible').filter({ has: page.getByRole('heading', { name: 'John Cofie' }) });
  await expect(john.getByRole('link', { name: 'LinkedIn profile of John Cofie (opens in a new tab)' })).toHaveAttribute('href', /linkedin\.com/);
  await expect(john.getByRole('link', { name: 'Email John Cofie' })).toHaveAttribute('href', /^mailto:/);
  await page.getByRole('group', { name: 'Filter by team' }).getByRole('button', { name: 'Advisors' }).click();
  const dilshan = page.locator('[data-teams]:visible').filter({ has: page.getByRole('heading', { name: 'Dilshan Swaris' }) });
  await dilshan.getByText('read full bio').click();
  await expect(dilshan.locator('details')).toHaveAttribute('open', '');
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

test('Careers links each of the four open roles, newest first, and a role links to its application', async ({ page }) => {
  await page.goto('/careers/');
  const roles = page.getByRole('region', { name: 'Current Job Opportunities' }).getByRole('link');
  await expect(roles).toHaveCount(4);
  await expect(roles.locator('h3')).toHaveText([
    'Account Based Marketing Manager (ABM)',
    'Client Services & Social Media Programme Manager',
    'Social Media Project Manager- EMEA',
    'Account Director',
  ]);
  const first = roles.first();
  await expect(first).toHaveAttribute('href', '/careers/account-based-marketing-manager-abm/');
  await expect(first).toContainText('Chesamel Group');
  await expect(first).toContainText('Apply Now');
  await expect(first.locator('time')).toHaveText('19th Oct 2026');
  await expect(first.locator('a')).toHaveCount(0);
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
