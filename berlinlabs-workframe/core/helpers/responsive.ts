import { Page } from '@playwright/test';
import type { Viewport } from '../types';

/**
 * Apply a viewport to a Playwright page.
 * Wraps setViewportSize with a short stabilisation pause.
 */
export async function applyViewport(page: Page, viewport: Viewport): Promise<void> {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  // Allow any CSS media-query transitions to settle
  await page.waitForTimeout(150);
}

/**
 * Generate a deterministic snapshot filename for a given app, route, and viewport.
 * Example: "menuflows--landing--mobile-375"
 */
export function snapshotName(appName: string, routeName: string, viewportName: string): string {
  return `${appName}--${routeName}--${viewportName}`;
}

/**
 * Wait for a route to be fully ready before asserting or screenshotting.
 * Uses the route's waitFor selector if provided, otherwise waits for networkidle.
 */
export async function waitForRoute(page: Page, waitForSelector?: string): Promise<void> {
  if (waitForSelector) {
    await page.waitForSelector(waitForSelector, { state: 'visible', timeout: 20_000 });
  } else {
    await page.waitForLoadState('networkidle', { timeout: 20_000 });
  }
}
