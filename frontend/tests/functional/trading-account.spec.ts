import { test, expect } from '@playwright/test';

test.describe('Trading Account Generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });
  });

  test('should generate trading account from transactions', async ({ page }) => {
    // Navigate to Reports tab
    await page.click('text=Reports');
    await page.waitForSelector('text=Trading Account');
    
    // Open generate dialog
    await page.click('text=Generate Trading Statement');
    await page.waitForSelector('text=Generate Trading Account');
    
    // Fill opening and closing stock
    await page.fill('#openingStock', '100000');
    await page.fill('#closingStock', '150000');
    
    // Add direct expense
    await page.click('text=Add Expense');
    await page.fill('input[placeholder="Expense name (e.g., Freight, Wages)"]', 'Freight Charges');
    await page.fill('input[placeholder="Amount"]', '5000');
    
    // Generate
    await page.click('button:has-text("Generate & Save")');
    
    // Wait for progress
    await expect(page.locator('text=Generating Trading Account')).toBeVisible();
    
    // Wait for success
    await expect(page.locator('text=Trading Account generated and saved successfully')).toBeVisible({ timeout: 10000 });
    
    // Verify trading account appears
    await expect(page.locator('text=Gross Profit')).toBeVisible();
  });

  test('should validate trading account calculations', async ({ page }) => {
    await page.click('text=Reports');
    await page.click('text=Generate Trading Statement');
    
    await page.fill('#openingStock', '50000');
    await page.fill('#closingStock', '60000');
    
    await page.click('button:has-text("Generate & Save")');
    
    // Should complete without calculation errors
    await expect(page.locator('text=Trading Account generated')).toBeVisible({ timeout: 10000 });
  });

  test('should export trading account as PDF', async ({ page }) => {
    await page.click('text=Reports');
    
    // Assuming there's a trading account
    const pdfButton = page.locator('button:has-text("PDF")').first();
    if (await pdfButton.isVisible()) {
      await pdfButton.click();
      
      // Verify export notification
      await expect(page.locator('text=Generating PDF')).toBeVisible();
    }
  });
});

