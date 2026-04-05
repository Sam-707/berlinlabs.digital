import { Page, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { A11yConfig } from '../types';

export interface A11yResult {
  violations: AxeViolation[];
  passes: number;
  incomplete: number;
}

export interface AxeViolation {
  id: string;
  impact: string | null;
  description: string;
  nodes: number;
}

/**
 * Run an axe accessibility scan on the current page state.
 * Returns a structured result — callers decide whether to fail or warn.
 */
export async function runA11yScan(page: Page, config: A11yConfig): Promise<A11yResult> {
  const builder = new AxeBuilder({ page }).withTags(config.tags);

  if (config.disabledRules?.length) {
    builder.disableRules(config.disabledRules);
  }

  const results = await builder.analyze();

  return {
    violations: results.violations.map((v) => ({
      id: v.id,
      impact: v.impact ?? null,
      description: v.description,
      nodes: v.nodes.length,
    })),
    passes: results.passes.length,
    incomplete: results.incomplete.length,
  };
}

/**
 * Assert zero accessibility violations, with a descriptive failure message
 * listing each violation's ID, impact, and node count.
 */
export function assertNoA11yViolations(result: A11yResult, routeName: string): void {
  if (result.violations.length === 0) return;

  const summary = result.violations
    .map((v) => `  [${v.impact ?? 'unknown'}] ${v.id} — ${v.description} (${v.nodes} node${v.nodes !== 1 ? 's' : ''})`)
    .join('\n');

  expect(result.violations, `Accessibility violations on "${routeName}":\n${summary}`).toHaveLength(0);
}
