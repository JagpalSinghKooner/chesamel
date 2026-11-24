import { readdirSync } from 'node:fs';
import { test, expect, type Page } from '@playwright/test';

const caseStudyFiles = readdirSync(new URL('../src/content/case-studies/', import.meta.url)).filter((f) => f.endsWith('.md'));
const total = caseStudyFiles.length;

// Known Case Studies, with their labels in the migrated content.
const biFinance = 'Business Intelligence in Finance'; // BI & Data Analytics, Finance
const hackathons = 'Hackathons for Google Cloud'; // Marketing Engine, Technology, client Google Cloud
const onSiteTeams = 'On-site teams at Google'; // Hybrid Workforce, no Industry
// The three newest Case Studies, all Finance.
const newest = ['Google Financial Services Series', 'Google Partnership Kickstart 2026 @ Wembley', 'Financial Services Community Inaugural Event'];

const OUR_WORK = '/insights/our-work/';
const catalogue = (page: Page) => page.locator('[data-component="case-study-listing"]');
const cards = (page: Page) => catalogue(page).locator('[data-component="case-study-card"]:visible');
const card = (page: Page, title: string) => catalogue(page).getByRole('link', { name: title });
const slider = (page: Page) => page.locator('[data-component="case-study-slider"]');
const sliderTitles = (page: Page) => slider(page).locator('[data-component="case-study-card"] :is(h2, h3, h4)');

test.describe('Our Work', () => {
  test('lists every Case Study, newest first', async ({ page }) => {
    await page.goto(OUR_WORK);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Our Work');
    await expect(cards(page)).toHaveCount(total);
    await expect(page.getByRole('status')).toHaveText(`${total} Case Studies`);
    const titles = await cards(page).locator('h3').allTextContents();
    expect(titles.slice(0, 3)).toEqual(newest);
  });

  test('a card shows the image, the main Pillar, the client when there is one, and the title', async ({ page }) => {
    await page.goto(OUR_WORK);
    const hack = card(page, hackathons);
    await expect(hack).toHaveAttribute('href', '/case-studies/hackathons-for-google-cloud/');
    await expect(hack).toContainText('Marketing Engine');
    await expect(hack).toContainText('/ Google Cloud');
    expect(await hack.locator('img').evaluate((img: HTMLImageElement) => img.getAttribute('src'))).toMatch(/^\/wp-content\/uploads\//);
    await expect(card(page, biFinance)).not.toContainText('/ Google Cloud');
  });

  test('filters by Service and Industry, and a filtered address can be shared', async ({ page }) => {
    await page.goto(OUR_WORK);
    const services = page.getByRole('group', { name: 'Service' });
    await services.getByRole('button', { name: 'BI & Data Analytics' }).click();
    await expect(card(page, biFinance)).toBeVisible();
    await expect(card(page, hackathons)).toBeHidden();
    await expect(page).toHaveURL(/\?pillar=bi-data-analytics$/);

    await page.goto(`${OUR_WORK}?industry=technology`);
    await expect(card(page, hackathons)).toBeVisible();
    await expect(card(page, biFinance)).toBeHidden();
    await expect(card(page, onSiteTeams)).toBeHidden();
    const shown = await cards(page).count();
    await expect(page.getByRole('status')).toHaveText(`${shown} Case Studies`);
  });

  test('shows the newest work in a Case Study slider and links to each Industry', async ({ page }) => {
    await page.goto(OUR_WORK);
    await expect(sliderTitles(page)).toHaveText(newest);
    const industries = page.getByRole('region', { name: 'Our Industries' });
    await expect(industries.getByRole('link', { name: /Finance/ })).toHaveAttribute('href', '/industries/finance/');
  });

  test('works on a phone without sideways scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    for (const address of [OUR_WORK, '/industries/', '/industries/finance/', '/case-studies/business-intelligence-in-finance/']) {
      await page.goto(address);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), address).toBe(0);
    }
  });
});

test.describe('Case Study page', () => {
  test('shows the Case Study at its original address with its Pillar, excerpt, objective and services', async ({ page }) => {
    await page.goto(OUR_WORK);
    await card(page, biFinance).click();

    await expect(page).toHaveURL(/\/case-studies\/business-intelligence-in-finance\/$/);
    await expect(page).toHaveTitle(`${biFinance} | Chesamel`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(biFinance);
    const hero = page.locator('[data-case-study-hero]');
    await expect(hero).toContainText('/ BI & Data Analytics');
    await expect(hero).toContainText('Effectively analysing Business Intelligence (BI) in financial services.');
    await expect(page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Our Work' })).toHaveAttribute('href', OUR_WORK);

    const main = page.getByRole('main');
    await expect(main.locator('time').first()).toHaveText('November 13, 2024');
    await expect(main).toContainText('To consolidate and analyse a financial services company');
    await expect(main.getByRole('link', { name: /BI & Data Analytics/ }).first()).toHaveAttribute('href', '/services/bi-data-analytics/');
    await expect(main.getByRole('heading', { name: 'The Story' })).toBeVisible();
    await expect(main.getByRole('link', { name: 'Back to Case Studies' })).toHaveAttribute('href', OUR_WORK);
  });

  test('its body image, a resized copy, loads', async ({ page }) => {
    await page.goto('/case-studies/business-intelligence-in-finance/');
    const img = page.locator('[data-case-study-body] img').first();
    await img.scrollIntoViewIfNeeded();
    await expect(img).toHaveAttribute('src', /-1024x576\.png$/);
    await expect.poll(() => img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  });

  test('related Case Studies share its Industry and leave it out', async ({ page }) => {
    await page.goto('/case-studies/business-intelligence-in-finance/');
    await expect(slider(page)).toContainText('Our Related Case Studies');
    await expect(sliderTitles(page)).toHaveText(newest);
  });
});

test.describe('Case Study slider', () => {
  test('steps through the Case Studies with its buttons and counter', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 800 });
    await page.goto('/industries/finance/');
    const s = slider(page);
    await s.scrollIntoViewIfNeeded();
    const counter = s.locator('[data-slide-count]');
    await expect(counter).toHaveText('1 / 3');
    await expect(s.getByRole('button', { name: 'Previous' })).toBeDisabled();

    await s.getByRole('button', { name: 'Next' }).click();
    await expect(counter).toHaveText('2 / 3');
    await s.getByRole('button', { name: 'Next' }).click();
    await expect(counter).toHaveText('3 / 3');
    await expect(s.getByRole('button', { name: 'Next' })).toBeDisabled();
    await s.getByRole('button', { name: 'Previous' }).click();
    await expect(counter).toHaveText('2 / 3');
  });
});

test('the Podcast page shows its three chosen customer stories in a Case Study slider', async ({ page }) => {
  await page.goto('/insights/podcasts/');
  await expect(slider(page)).toContainText('Customer stories');
  await expect(sliderTitles(page)).toHaveText(['Elevating Fan Experiences at the BRITs', 'B2B Marketing for eBay', 'Augmenting Cybersecurity with AI']);
});

test.describe('Industries', () => {
  test('the hub links to each Industry in the live order and filters work by Industry only', async ({ page }) => {
    await page.goto('/industries/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Industries');
    const names = await page.locator('[data-component="industry-card"] h3').allTextContents();
    expect(names).toEqual(['Technology', 'Energy', 'Finance', 'Healthcare', 'Hospitality']);
    await expect(page.getByRole('group', { name: 'Service' })).toHaveCount(0);

    await page.getByRole('group', { name: 'Industry' }).getByRole('button', { name: 'Finance' }).click();
    await expect(card(page, biFinance)).toBeVisible();
    await expect(card(page, hackathons)).toBeHidden();
  });

  test('an Industry page shows its copy, its newest Case Studies and its Blog Posts', async ({ page }) => {
    await page.goto('/industries/');
    await page.locator('[data-component="industry-card"]', { hasText: 'Finance' }).click();

    await expect(page).toHaveURL(/\/industries\/finance\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Finance');
    await expect(page.getByRole('main')).toContainText('Providing the right intelligence for business growth.');
    await expect(page.getByRole('heading', { name: 'Data management, made easy' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Business deep dive' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Helping finance grow' })).toBeVisible();
    await expect(sliderTitles(page)).toHaveText(newest);

    const posts = page.getByRole('region', { name: 'Related Posts' }).locator('[data-component="blog-post-card"]');
    await expect(posts).toHaveCount(3);
    await expect(posts.first()).toContainText('Big Business, Small Thinking: Project Everest');
  });
});
