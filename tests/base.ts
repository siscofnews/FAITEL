import { test as base, expect } from '@playwright/test';

export const test = base;
export { expect };

test.afterEach(async ({ page }, testInfo) => {
  try {
    const name = testInfo.titlePath().join('__').replace(/[^a-zA-Z0-9_-]/g, '_');
    await page.screenshot({ path: `test-artifacts/${name}.png`, fullPage: true });
  } catch {}
});

