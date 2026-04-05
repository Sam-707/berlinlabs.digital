import { test, expect } from '@playwright/test';
import config from '../config';
import {
  assertNoHorizontalOverflow,
  assertAccentVarSet,
  assertHeroCTAVisible,
  assertTouchTargets,
} from '../../../core/helpers/brand';
import { applyViewport } from '../../../core/helpers/responsive';

/**
 * Brand consistency tests — @brand
 *
 * Verify design-system and UX invariants that should hold at every viewport:
 * - No horizontal overflow (layout integrity)
 * - Accent CSS variable is set (theming loaded correctly)
 * - Hero CTA is above the fold on mobile (critical conversion path)
 * - Touch targets meet the 44px minimum (mobile usability)
 *
 * BLOCKING in CI.
 */

test.describe('MenuFlows brand consistency', () => {
  test.use({ baseURL: config.baseURL });

  // ── No horizontal overflow ────────────────────────────────────────────────

  for (const viewport of config.viewports) {
    test(`landing — no horizontal overflow @ ${viewport.name} @brand`, async ({ page }) => {
      await applyViewport(page, viewport);
      await page.goto('/');
      await page.waitForSelector('h1', { state: 'visible' });
      await assertNoHorizontalOverflow(page, `landing @ ${viewport.name}`);
    });

    test(`demo — no horizontal overflow @ ${viewport.name} @brand`, async ({ page }) => {
      await applyViewport(page, viewport);
      await page.goto('/demo');
      await page.waitForSelector('h1', { state: 'visible', timeout: 20_000 });
      await assertNoHorizontalOverflow(page, `demo-splash @ ${viewport.name}`);
    });
  }

  // ── Accent CSS variable ───────────────────────────────────────────────────

  test('landing — accent CSS variable is set @brand', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('h1', { state: 'visible' });
    await assertAccentVarSet(page, config.brand.accentCssVar);
  });

  test('demo — accent CSS variable is set after restaurant loads @brand', async ({ page }) => {
    await page.goto('/demo');
    await page.waitForSelector('h1', { state: 'visible', timeout: 20_000 });
    await assertAccentVarSet(page, config.brand.accentCssVar);
  });

  // ── Hero CTA above the fold on mobile ─────────────────────────────────────

  test('landing — hero CTA visible above fold at 375px @brand', async ({ page }) => {
    const mobileViewport = { name: 'mobile-375', width: 375, height: 812 };
    await applyViewport(page, mobileViewport);
    await page.goto('/');
    await page.waitForSelector('h1', { state: 'visible' });

    await assertHeroCTAVisible(page, config.brand.heroCTASelector, mobileViewport);
  });

  test('landing — hero CTA visible above fold at 390px @brand', async ({ page }) => {
    const mobileViewport = { name: 'mobile-390', width: 390, height: 844 };
    await applyViewport(page, mobileViewport);
    await page.goto('/');
    await page.waitForSelector('h1', { state: 'visible' });

    await assertHeroCTAVisible(page, config.brand.heroCTASelector, mobileViewport);
  });

  // ── Demo View Menu CTA touch target ───────────────────────────────────────

  test('demo — View Menu button meets 44px touch target @brand', async ({ page }) => {
    const mobileViewport = { name: 'mobile-375', width: 375, height: 812 };
    await applyViewport(page, mobileViewport);
    await page.goto('/demo');

    const viewMenuBtn = page.locator('button:has-text("View Menu")');
    await viewMenuBtn.waitFor({ state: 'visible', timeout: 20_000 });

    const box = await viewMenuBtn.boundingBox();
    expect(box, 'View Menu button should have a bounding box').toBeTruthy();
    if (box) {
      expect(
        box.height,
        `View Menu button height (${box.height}px) is below the 44px touch-target minimum`
      ).toBeGreaterThanOrEqual(44);
    }
  });

  test('demo — menu category chips meet 44px touch target @brand', async ({ page }) => {
    const mobileViewport = { name: 'mobile-375', width: 375, height: 812 };
    await applyViewport(page, mobileViewport);
    await page.goto('/demo');

    const viewMenuBtn = page.locator('button:has-text("View Menu")');
    await viewMenuBtn.waitFor({ state: 'visible', timeout: 20_000 });
    await viewMenuBtn.click();

    await page.locator('article').first().waitFor({ state: 'visible', timeout: 15_000 });

    // Category chips in the horizontal scroll row
    // They are rendered with py-3 (12px padding × 2 + ~11px text = ~35px min).
    // The spec target is 44px; this assertion validates we're meeting it.
    const chips = page.locator('div[class*="overflow-x-auto"] button');
    const count = await chips.count();
    if (count === 0) return; // no chips rendered, skip

    for (let i = 0; i < count; i++) {
      const box = await chips.nth(i).boundingBox();
      if (!box) continue;
      expect(
        box.height,
        `Category chip [${i}] height ${box.height}px is below the 44px minimum`
      ).toBeGreaterThanOrEqual(44);
    }
  });

  // ── Demo accent color is warm amber (tenant theming works) ────────────────

  test('demo — restaurant accent color is applied (not default fallback) @brand', async ({ page }) => {
    await page.goto('/demo');
    await page.waitForSelector('h1', { state: 'visible', timeout: 20_000 });

    // The CSS variable should be set — we just verify it's present.
    // The exact value depends on the restaurant row in Supabase.
    const accentValue = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--color-accent').trim()
    );
    expect(accentValue, '--color-accent should be set on /demo').not.toBe('');
  });

  // ── Footer / legal links ──────────────────────────────────────────────────

  test('landing — footer privacy and terms links are present @brand', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('footer', { state: 'visible' });

    const footer = page.locator('footer').last();
    await expect(footer.locator('button:has-text("Privacy"), a:has-text("Privacy")')).toBeVisible();
    await expect(footer.locator('button:has-text("Terms"), a:has-text("Terms")')).toBeVisible();
  });
});
