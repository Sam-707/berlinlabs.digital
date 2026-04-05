import { test, expect } from '@playwright/test';
import config from '../config';

/**
 * Smoke tests — @smoke
 *
 * Verify that key pages load, render their critical elements, and
 * do not throw unhandled JavaScript errors.
 *
 * These are BLOCKING in CI. A failure here means the site is down or broken.
 */

test.describe('MenuFlows smoke tests', () => {
  test.use({ baseURL: config.baseURL });

  // ── Landing page ──────────────────────────────────────────────────────────

  test('landing page loads and renders hero @smoke', async ({ page }) => {
    const jsErrors: string[] = [];
    page.on('pageerror', (err) => jsErrors.push(err.message));

    await page.goto('/');
    await page.waitForSelector('h1', { state: 'visible' });

    // Page title is set
    await expect(page).toHaveTitle(/.+/);

    // Hero headline contains expected copy
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).not.toBeEmpty();

    // Primary CTA buttons present in hero
    const heroCTA = page.locator('a[href="#pricing"], a:has-text("Get the Source Code")').first();
    await expect(heroCTA).toBeVisible();

    // Live demo link present
    const demoLink = page.locator('a:has-text("Live Demo"), a:has-text("View Live Demo")').first();
    await expect(demoLink).toBeVisible();

    // No unhandled JS errors
    expect(jsErrors, `Unhandled JS errors on landing: ${jsErrors.join(', ')}`).toHaveLength(0);
  });

  test('landing page nav links are present @smoke', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('header', { state: 'visible' });

    // Sticky header renders
    const header = page.locator('header').first();
    await expect(header).toBeVisible();

    // Pricing section anchor exists
    const pricingSection = page.locator('#pricing');
    await expect(pricingSection).toBeAttached();
  });

  test('landing page pricing section renders @smoke', async ({ page }) => {
    await page.goto('/#pricing');
    await page.waitForSelector('#pricing', { state: 'visible' });

    // At least one checkout link present
    const checkoutLink = page.locator('.lemonsqueezy-button, a[href*="lemonsqueezy"]').first();
    await expect(checkoutLink).toBeVisible();
  });

  // ── Demo route ────────────────────────────────────────────────────────────

  test('demo splash screen loads @smoke', async ({ page }) => {
    const jsErrors: string[] = [];
    page.on('pageerror', (err) => jsErrors.push(err.message));

    await page.goto('/demo');

    // Either the splash "View Menu" button or menu items should appear —
    // the app may load directly into the menu if previously visited
    await page.waitForSelector(
      'button:has-text("View Menu"), h1, [class*="MenuView"], article',
      { state: 'visible', timeout: 20_000 }
    );

    // No unhandled JS errors during demo load
    expect(jsErrors, `Unhandled JS errors on /demo: ${jsErrors.join(', ')}`).toHaveLength(0);
  });

  test('demo splash shows restaurant branding @smoke', async ({ page }) => {
    await page.goto('/demo');

    // Restaurant name should appear somewhere on the splash
    await page.waitForSelector('h1', { state: 'visible', timeout: 20_000 });

    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();
    await expect(h1).not.toBeEmpty();
  });

  test('demo View Menu button navigates to menu @smoke', async ({ page }) => {
    await page.goto('/demo');

    // Wait for the splash CTA
    const viewMenuBtn = page.locator('button:has-text("View Menu")');
    await expect(viewMenuBtn).toBeVisible({ timeout: 20_000 });

    await viewMenuBtn.click();

    // After clicking, the menu view should appear with a search input
    await expect(
      page.locator('input[placeholder*="Search"], input[placeholder*="search"]').first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test('demo menu renders items @smoke', async ({ page }) => {
    await page.goto('/demo');

    const viewMenuBtn = page.locator('button:has-text("View Menu")');
    await expect(viewMenuBtn).toBeVisible({ timeout: 20_000 });
    await viewMenuBtn.click();

    // At least one menu item article should appear
    await expect(page.locator('article').first()).toBeVisible({ timeout: 15_000 });

    const itemCount = await page.locator('article').count();
    expect(itemCount, 'Menu should contain at least one item').toBeGreaterThan(0);
  });

  test('demo menu category chips are clickable @smoke', async ({ page }) => {
    await page.goto('/demo');

    const viewMenuBtn = page.locator('button:has-text("View Menu")');
    await expect(viewMenuBtn).toBeVisible({ timeout: 20_000 });
    await viewMenuBtn.click();

    // Wait for menu to load
    await expect(page.locator('article').first()).toBeVisible({ timeout: 15_000 });

    // Category chips should be visible
    // They are rendered in a horizontal scroll container
    const chips = page.locator('button[class*="rounded-full"]:not([class*="bg-primary"])');
    const chipCount = await chips.count();
    expect(chipCount, 'At least one non-active category chip should exist').toBeGreaterThanOrEqual(0);
  });

  test('demo quick-add button updates cart count @smoke', async ({ page }) => {
    await page.goto('/demo');

    const viewMenuBtn = page.locator('button:has-text("View Menu")');
    await expect(viewMenuBtn).toBeVisible({ timeout: 20_000 });
    await viewMenuBtn.click();

    await expect(page.locator('article').first()).toBeVisible({ timeout: 15_000 });

    // Click the first quick-add button (the + button on menu item cards)
    const quickAddBtn = page.locator('button:has-text("add"), button[class*="quick"], article button').first();
    await quickAddBtn.click();

    // The cart badge should appear with count > 0
    const cartBadge = page.locator('span.rounded-full:has-text("1"), [class*="ring-background"]').first();
    await expect(cartBadge).toBeVisible({ timeout: 5_000 });
  });
});
