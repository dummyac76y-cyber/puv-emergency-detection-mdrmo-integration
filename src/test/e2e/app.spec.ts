import { test, expect } from '@playwright/test';

test.describe('PUV Command Center', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
    page.on('pageerror', (err) => console.log('BROWSER ERROR:', err.message));
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('loads without errors', async ({ page }) => {
    await expect(page.locator("h1:has-text('PUV COMMAND CENTER')")).toBeVisible({ timeout: 10000 });
  });

  test('shows simulation banner', async ({ page }) => {
    await expect(page.locator('text=Simulation Mode')).toBeVisible({ timeout: 10000 });
  });

  test('navigation sidebar is present', async ({ page }) => {
    await expect(page.locator('nav')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Overview')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Live Map')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Emergency Incidents')).toBeVisible({ timeout: 10000 });
  });

  test('can navigate to Incidents page', async ({ page }) => {
    await page.click('text=Emergency Incidents');
    await expect(page.locator("h1:has-text('Vehicle Accidents & Driver Threats')")).toBeVisible({
      timeout: 10000,
    });
  });

  test('can navigate to Vehicles page', async ({ page }) => {
    await page.click('text=Vehicle Registry');
    await expect(page.locator("h1:has-text('Vehicle Registry')")).toBeVisible({ timeout: 10000 });
  });
});
