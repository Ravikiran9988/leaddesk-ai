// @ts-check
import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5174',
    trace: 'on',
    screenshot: 'on',
    video: 'on',
    headless: process.env.HEADLESS === 'false' ? false : true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'cd client && npx vite --host 127.0.0.1 --strictPort --port 5174',
    url: 'http://127.0.0.1:5174',
    reuseExistingServer: !isCI,
    timeout: 120 * 1000,
  },
});
