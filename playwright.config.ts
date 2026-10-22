import { defineConfig, devices } from '@playwright/test';

const PORT = 4173;
const ORIGIN = `http://localhost:${PORT.toString()}`;

// End-to-end tests run against the production build, with the API mocked by
// the same real responses as the unit tests (ADR 0009). The smoke project
// talks to the real API and only runs on demand: npm run test:smoke
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  // More browsers at once leave requests to the preview server unanswered
  // now and then, even on big machines: two keep the runs reliable
  workers: 2,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: ORIGIN,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: 'smoke.spec.ts',
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'] },
      testIgnore: 'smoke.spec.ts',
    },
    {
      name: 'smoke',
      use: { ...devices['Desktop Chrome'] },
      testMatch: 'smoke.spec.ts',
    },
  ],
  webServer: {
    command: `npm run build && npx vite preview --port ${PORT.toString()} --strictPort`,
    url: ORIGIN,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
