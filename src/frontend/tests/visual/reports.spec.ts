import { test, expect } from '@playwright/test';

test.describe('Visual Regression - Reports', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });
  });

  test('trading account report screenshot', async ({ page }) => {
    await page.click('text=Reports');
    await page.waitForSelector('text=Trading Account');
    
    // Take screenshot of trading account section
    const tradingSection = page.locator('text=Trading Account').locator('..');
    await expect(tradingSection).toHaveScreenshot('trading-account.png', {
      maxDiffPixels: 100,
    });
  });

  test('profit and loss report screenshot', async ({ page }) => {
    await page.click('text=Reports');
    await page.waitForSelector('text=Profit & Loss');
    
    const plSection = page.locator('text=Profit & Loss').locator('..');
    await expect(plSection).toHaveScreenshot('profit-loss.png', {
      maxDiffPixels: 100,
    });
  });

  test('balance sheet report screenshot', async ({ page }) => {
    await page.click('text=Reports');
    await page.waitForSelector('text=Balance Sheet');
    
    const bsSection = page.locator('text=Balance Sheet').locator('..');
    await expect(bsSection).toHaveScreenshot('balance-sheet.png', {
      maxDiffPixels: 100,
    });
  });

  test('dashboard overview screenshot', async ({ page }) => {
    await page.waitForSelector('[data-testid="dashboard"]');
    
    await expect(page).toHaveScreenshot('dashboard-overview.png', {
      fullPage: true,
      maxDiffPixels: 200,
    });
  });
});

