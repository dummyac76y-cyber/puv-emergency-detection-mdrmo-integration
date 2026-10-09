import { test, expect } from '@playwright/test';

test.describe('PUV Command Center', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads without errors', async ({ page }) => {
    await expect(page.locator("h1:has-text('PUV COMMAND CENTER')")).toBeVisible();
  });

  test('shows simulation banner', async ({ page }) => {
    await expect(page.locator('text=Simulation Mode')).toBeVisible();
  });

  test('navigation sidebar is present', async ({ page }) => {
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('text=Overview')).toBeVisible();
    await expect(page.locator('text=Live Map')).toBeVisible();
    await expect(page.locator('text=Emergency Incidents')).toBeVisible();
  });

  test('can navigate to Incidents page', async ({ page }) => {
    await page.click('text=Emergency Incidents');
    await expect(page.locator("h1:has-text('Vehicle Accidents & Driver Threats')")).toBeVisible();
  });

  test('can navigate to Vehicles page', async ({ page }) => {
    await page.click('text=Vehicle Registry');
    await expect(page.locator("h1:has-text('Vehicle Registry')")).toBeVisible();
  });
});
