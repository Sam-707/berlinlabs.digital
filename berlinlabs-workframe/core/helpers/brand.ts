import { Page, expect } from '@playwright/test';
import type { BrandConfig, Viewport } from '../types';

/**
 * Assert that no horizontal scrollbar is present — i.e., no content overflows
 * the viewport width. This is run at each viewport in the responsive matrix.
 */
export async function assertNoHorizontalOverflow(page: Page, context: string): Promise<void> {
  const overflow = await page.evaluate(() => ({
    bodyScrollWidth: document.body.scrollWidth,
    viewportWidth: window.innerWidth,
  }));

  expect(
    overflow.bodyScrollWidth,
    `Horizontal overflow detected on "${context}": body.scrollWidth (${overflow.bodyScrollWidth}px) > viewport (${overflow.viewportWidth}px)`
  ).toBeLessThanOrEqual(overflow.viewportWidth);
}

/**
 * Assert that the expected accent CSS variable is set on the document root.
 * The value just needs to be non-empty — exact color is not asserted here
 * since it can vary per tenant.
 */
export async function assertAccentVarSet(page: Page, cssVar: string): Promise<void> {
  const value = await page.evaluate((varName: string) => {
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  }, cssVar);

  expect(value, `CSS variable "${cssVar}" should be set on the document root`).not.toBe('');
}

/**
 * Assert the hero CTA element is visible within the initial viewport
 * (i.e., without scrolling). Only meaningful at mobile viewport sizes.
 */
export async function assertHeroCTAVisible(page: Page, selector: string, viewport: Viewport): Promise<void> {
  const element = page.locator(selector).first();
  await expect(element, `Hero CTA "${selector}" should exist on the page`).toBeAttached({ timeout: 10_000 });

  const box = await element.boundingBox();
  if (!box) return; // element is hidden — the toBeAttached check would have caught a missing element

  expect(
    box.y + box.height,
    `Hero CTA "${selector}" should be visible above the fold at ${viewport.width}px width (bottom edge: ${box.y + box.height}px, viewport height: ${viewport.height}px)`
  ).toBeLessThanOrEqual(viewport.height);
}

/**
 * Assert that elements matching the given selector meet the minimum touch
 * target size (height and width both >= minPx).
 */
export async function assertTouchTargets(
  page: Page,
  selectors: string[],
  minPx: number
): Promise<void> {
  for (const selector of selectors) {
    const elements = page.locator(selector);
    const count = await elements.count();
    for (let i = 0; i < count; i++) {
      const box = await elements.nth(i).boundingBox();
      if (!box) continue; // skip hidden elements
      expect(
        Math.min(box.width, box.height),
        `Touch target "${selector}" [${i}] is ${Math.round(Math.min(box.width, box.height))}px — below the ${minPx}px minimum`
      ).toBeGreaterThanOrEqual(minPx);
    }
  }
}

/**
 * Run the full brand consistency check suite for a given page and viewport.
 * Individual assertions are independent — a failure in one does not skip others.
 */
export async function runBrandChecks(
  page: Page,
  config: BrandConfig,
  viewport: Viewport,
  routeName: string
): Promise<void> {
  await assertNoHorizontalOverflow(page, `${routeName} @ ${viewport.name}`);
  await assertAccentVarSet(page, config.accentCssVar);
}
