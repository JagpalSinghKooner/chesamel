import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;

// Set BASE_URL to test a deployed site (a Preview) instead of a local build.
const BASE_URL = process.env.BASE_URL;

export default defineConfig({
  testDir: './tests',
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL ?? `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Tests run against a fresh production build, not the dev server, so they
  // see exactly what Cloudflare Pages will serve. Never reuse a server already
  // on the port: it may be a stale build or the dev server.
  webServer: BASE_URL
    ? undefined
    : {
        command: `npm run build && npm run preview -- --port ${PORT} --ignore-lock`,
        url: `http://localhost:${PORT}`,
        reuseExistingServer: false,
        timeout: 120_000,
      },
});
