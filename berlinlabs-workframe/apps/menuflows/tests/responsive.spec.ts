import { test, expect } from '@playwright/test';
import config from '../config';
import { applyViewport, snapshotName, waitForRoute } from '../../../core/helpers/responsive';

/**
 * Responsive screenshot tests — @responsive
 *
 * Captures full-page screenshots at the viewport matrix defined in config.
 * On the first run, snapshots are created as baselines.
 * On subsequent runs, new screenshots are diff'd against baselines.
 *
 * ADVISORY in CI (non-blocking by default) — visual drift is flagged in the
 * artifact report but does not block the merge. Promote to blocking once
 * baselines are stabilised.
 *
 * Update baselines:
 *   npm run update-snapshots   (from berlinlabs-workframe/)
 *   # or:
 *   npx playwright test apps/menuflows/tests/responsive.spec.ts --update-snapshots
 */

test.describe('MenuFlows responsive screenshots', () => {
  test.use({ baseURL: config.baseURL });

  // ── Landing page ──────────────────────────────────────────────────────────

  for (const viewport of config.viewports) {
    test(`landing — visual snapshot @ ${viewport.name} @responsive`, async ({ page }) => {
      await applyViewport(page, viewport);
      await page.goto('/');
      await waitForRoute(page, 'h1');

      // Mask dynamic elements that change between runs
      await expect(page).toHaveScreenshot(
        `${snapshotName(config.appName, 'landing', viewport.name)}.png`,
        {
          fullPage: true,
          // Mask dynamic copyright year and any animated elements
          mask: [page.locator('footer span:has-text("2025"), footer span:has-text("2026")')],
          animations: 'disabled',
        }
      );
    });
  }

  // ── Demo splash ───────────────────────────────────────────────────────────

  for (const viewport of config.viewports) {
    test(`demo-splash — visual snapshot @ ${viewport.name} @responsive`, async ({ page }) => {
      await applyViewport(page, viewport);
      await page.goto('/demo');

      // Wait for splash content — the restaurant name h1 or View Menu button
      await waitForRoute(page, 'button:has-text("View Menu"), h1');

      // Mask the "Powered by" text and any animated elements that vary
      await expect(page).toHaveScreenshot(
        `${snapshotName(config.appName, 'demo-splash', viewport.name)}.png`,
        {
          fullPage: true,
          animations: 'disabled',
        }
      );
    });
  }

  // ── Demo menu ─────────────────────────────────────────────────────────────

  for (const viewport of config.viewports) {
    test(`demo-menu — visual snapshot @ ${viewport.name} @responsive`, async ({ page }) => {
      await applyViewport(page, viewport);
      await page.goto('/demo');

      const viewMenuBtn = page.locator('button:has-text("View Menu")');
      await viewMenuBtn.waitFor({ state: 'visible', timeout: 20_000 });
      await viewMenuBtn.click();

      // Wait for at least one menu item
      await page.locator('article').first().waitFor({ state: 'visible', timeout: 15_000 });

      await expect(page).toHaveScreenshot(
        `${snapshotName(config.appName, 'demo-menu', viewport.name)}.png`,
        {
          fullPage: true,
          animations: 'disabled',
        }
      );
    });
  }
});
