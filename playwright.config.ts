import { defineConfig, devices } from '@playwright/test'

// Run against a production build:  pnpm build && pnpm test:e2e
// (first time: pnpm exec playwright install chromium)
// Set E2E_BASE_URL to test an already-running server instead.
const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3000'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: { baseURL, trace: 'retain-on-failure' },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'pnpm start',
        url: baseURL,
        reuseExistingServer: true,
        // Builds both enquiry emails but sends none, so the full flow runs
        // without an SMTP server.
        env: { MAIL_DRIVER: 'json' },
        timeout: 60_000,
      },
})
