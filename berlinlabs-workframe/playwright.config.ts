import { defineConfig, devices } from '@playwright/test';

/**
 * BerlinLabs Workframe — base Playwright config.
 *
 * Apps set their base URL via the WORKFRAME_BASE_URL environment variable,
 * or fall back to the per-app default defined in their config.ts.
 *
 * To run against a local dev server:
 *   WORKFRAME_BASE_URL=http://localhost:5173 npx playwright test
 */
export default defineConfig({
  testDir: './apps',

  // Fail-fast in CI to surface issues quickly
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  // Shared test settings — apps can override per-test
  use: {
    // Navigation timeout for production sites
    navigationTimeout: 30_000,
    actionTimeout: 10_000,

    // Capture on failure
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'off',
  },

  // Visual snapshot comparison settings
  // Snapshots land in: apps/<app>/tests/snapshots/<snapshot-name>-chromium.png
  snapshotPathTemplate: '{testDir}/{testFileDir}/snapshots/{arg}-{projectName}{ext}',
  expect: {
    toHaveScreenshot: {
      // Allow small pixel drift between CI and local renders
      maxDiffPixelRatio: 0.02,
      threshold: 0.2,
    },
  },

  // Output directories
  outputDir: 'test-results',

  // Browser projects — use Chromium by default.
  // Expand to webkit/firefox when broader coverage is needed.
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
