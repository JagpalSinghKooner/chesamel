import { defineConfig, devices } from '@playwright/test';

// PORT lets tests run while `astro dev` holds the default port.
const PORT = Number(process.env.PORT ?? 4321);

// Set BASE_URL to test a deployed site (a Preview) instead of a local build.
const BASE_URL = process.env.BASE_URL;

export default defineConfig({
  testDir: './tests',
  forbidOnly: !!process.env.CI,
  retries: 0,
  // GitHub's standard runner for a private repo has 2 vCPUs; Playwright's default of half the cores gives 1.
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL ?? `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Tests run against a fresh production build, not the dev server, served
  // with Cloudflare Pages' rules (_redirects, /x to /x/, 404.html) so they see
  // what a Preview will serve. Never reuse a server already on the port: it may
  // be a stale build or the dev server.
  webServer: BASE_URL
    ? undefined
    : {
        command: `npm run build && npm run serve -- ${PORT}`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: false,
        timeout: 120_000,
      },
});
