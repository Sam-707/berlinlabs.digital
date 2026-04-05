import { test } from '@playwright/test';
import config from '../config';
import { runA11yScan, assertNoA11yViolations } from '../../../core/helpers/a11y';

/**
 * Accessibility tests — @a11y
 *
 * Runs axe-core against key pages using the tags defined in config.a11y.
 * BLOCKING in CI — violations must be resolved before merging.
 *
 * To investigate failures:
 *   npx playwright test --grep @a11y --reporter=html
 *   npx playwright show-report
 */

test.describe('MenuFlows accessibility', () => {
  test.use({ baseURL: config.baseURL });

  test('landing page has no a11y violations @a11y', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1', { state: 'visible' });

    // Allow images to load before scanning
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});

    const result = await runA11yScan(page, config.a11y);
    assertNoA11yViolations(result, 'landing');
  });

  test('demo splash has no a11y violations @a11y', async ({ page }) => {
    await page.goto('/demo');
    await page.waitForSelector('button:has-text("View Menu"), h1', {
      state: 'visible',
      timeout: 20_000,
    });

    const result = await runA11yScan(page, config.a11y);
    assertNoA11yViolations(result, 'demo-splash');
  });

  test('demo menu has no a11y violations @a11y', async ({ page }) => {
    await page.goto('/demo');

    const viewMenuBtn = page.locator('button:has-text("View Menu")');
    await viewMenuBtn.waitFor({ state: 'visible', timeout: 20_000 });
    await viewMenuBtn.click();

    await page.locator('article').first().waitFor({ state: 'visible', timeout: 15_000 });

    const result = await runA11yScan(page, config.a11y);
    assertNoA11yViolations(result, 'demo-menu');
  });
});
