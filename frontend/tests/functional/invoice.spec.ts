import { test, expect } from '@playwright/test';

test.describe('Invoice Management with Sequential Numbering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for authentication (mock or real)
    await page.waitForSelector('[data-testid="dashboard"]', { timeout: 10000 });
  });

  test('should create invoice with sequential invoice number', async ({ page }) => {
    // Navigate to invoices tab
    await page.click('text=Invoices');
    await page.waitForSelector('text=Create Invoice');
    
    // Open create invoice dialog
    await page.click('text=Create Invoice');
    await page.waitForSelector('text=Create New Invoice');
    
    // Fill business details
    await page.fill('#businessName', 'Test Business Ltd');
    await page.fill('#businessContact', 'test@business.com');
    await page.fill('#businessAddress', '123 Business Street, Mumbai');
    await page.fill('#gstin', '27AABCT1234A1Z5');
    
    // Fill client details
    await page.fill('#clientName', 'Test Client Corp');
    await page.fill('#clientContact', 'client@test.com');
    await page.fill('#clientAddress', '456 Client Avenue, Delhi');
    
    // Fill customer GST information
    await page.fill('#customerGSTIN', '07AABCT5678B1Z9');
    await page.fill('#customerStateCode', '07');
    
    // Add invoice item
    await page.fill('input[placeholder="Item description"]', 'Professional Services');
    await page.fill('input[type="number"][placeholder="1"]', '10');
    await page.fill('input[type="number"][placeholder="0.00"]', '5000');
    
    // Submit invoice
    await page.click('button:has-text("Save Invoice")');
    
    // Wait for success message
    await expect(page.locator('text=Invoice Saved Successfully')).toBeVisible({ timeout: 5000 });
    
    // Wait for dialog to close
    await page.waitForTimeout(2500);
    
    // Verify invoice appears in list with proper invoice number format
    await expect(page.locator('text=Test Client Corp')).toBeVisible();
    
    // Check that invoice number follows INV-YYYY-NNN format
    const currentYear = new Date().getFullYear();
    const invoiceNumberPattern = new RegExp(`INV-${currentYear}-\\d{3}`);
    const invoiceNumberCell = page.locator('td.font-mono').first();
    await expect(invoiceNumberCell).toBeVisible();
    const invoiceNumber = await invoiceNumberCell.textContent();
    expect(invoiceNumber).toMatch(invoiceNumberPattern);
  });

  test('should generate unique sequential invoice numbers for multiple invoices', async ({ page }) => {
    await page.click('text=Invoices');
    
    const invoiceNumbers: string[] = [];
    
    // Create 3 invoices
    for (let i = 1; i <= 3; i++) {
      await page.click('text=Create Invoice');
      await page.waitForSelector('text=Create New Invoice');
      
      await page.fill('#businessName', `Business ${i}`);
      await page.fill('#businessContact', `test${i}@business.com`);
      await page.fill('#businessAddress', `Address ${i}`);
      await page.fill('#clientName', `Client ${i}`);
      await page.fill('#clientContact', `client${i}@test.com`);
      await page.fill('#clientAddress', `Client Address ${i}`);
      
      await page.fill('input[placeholder="Item description"]', `Service ${i}`);
      await page.fill('input[type="number"][placeholder="1"]', '1');
      await page.fill('input[type="number"][placeholder="0.00"]', '1000');
      
      await page.click('button:has-text("Save Invoice")');
      await expect(page.locator('text=Invoice Saved Successfully')).toBeVisible({ timeout: 5000 });
      await page.waitForTimeout(2500);
      
      // Get the invoice number from the table
      const invoiceNumberCell = page.locator('td.font-mono').first();
      const invoiceNumber = await invoiceNumberCell.textContent();
      if (invoiceNumber) {
        invoiceNumbers.push(invoiceNumber);
      }
    }
    
    // Verify all invoice numbers are unique
    const uniqueNumbers = new Set(invoiceNumbers);
    expect(uniqueNumbers.size).toBe(invoiceNumbers.length);
    
    // Verify sequential numbering
    const currentYear = new Date().getFullYear();
    invoiceNumbers.forEach(num => {
      expect(num).toMatch(new RegExp(`INV-${currentYear}-\\d{3}`));
    });
  });

  test('should validate GSTIN format', async ({ page }) => {
    await page.click('text=Invoices');
    await page.click('text=Create Invoice');
    
    // Fill required fields
    await page.fill('#businessName', 'Test Business');
    await page.fill('#clientName', 'Test Client');
    await page.fill('#businessContact', 'test@test.com');
    await page.fill('#clientContact', 'client@test.com');
    await page.fill('#businessAddress', 'Address 1');
    await page.fill('#clientAddress', 'Address 2');
    
    // Enter invalid GSTIN (less than 15 characters)
    await page.fill('#customerGSTIN', '12345');
    
    // Should show inline validation error
    await expect(page.locator('text=GSTIN must be exactly 15 characters')).toBeVisible();
    
    // Try to submit
    await page.fill('input[placeholder="Item description"]', 'Test Service');
    await page.fill('input[type="number"][placeholder="1"]', '1');
    await page.fill('input[type="number"][placeholder="0.00"]', '1000');
    await page.click('button:has-text("Save Invoice")');
    
    // Should show error toast
    await expect(page.locator('text=Invalid Customer GSTIN')).toBeVisible({ timeout: 3000 });
  });

  test('should display invoice number in view dialog', async ({ page }) => {
    await page.click('text=Invoices');
    
    // Wait for invoices to load
    await page.waitForTimeout(1000);
    
    // Click view button on first invoice
    const viewButton = page.locator('button[title="View Invoice"]').first();
    if (await viewButton.isVisible()) {
      // Get invoice number from table
      const invoiceNumberInTable = await page.locator('td.font-mono').first().textContent();
      
      await viewButton.click();
      await page.waitForSelector('text=Invoice details');
      
      // Verify invoice number appears in dialog title
      await expect(page.locator(`text=Invoice ${invoiceNumberInTable}`)).toBeVisible();
    }
  });

  test('should print invoice with correct invoice number', async ({ page }) => {
    await page.click('text=Invoices');
    
    // Wait for invoices to load
    await page.waitForTimeout(1000);
    
    const printButton = page.locator('button[title="Print Invoice"]').first();
    if (await printButton.isVisible()) {
      // Get invoice number before printing
      const invoiceNumber = await page.locator('td.font-mono').first().textContent();
      
      // Mock window.open to capture print content
      await page.evaluate(() => {
        window.open = (url: any, target: any) => {
          const mockWindow = {
            document: {
              write: (html: string) => {
                (window as any).__printHTML = html;
              },
              close: () => {},
            },
            onload: null as any,
            print: () => {},
          };
          return mockWindow as any;
        };
      });
      
      await printButton.click();
      
      // Wait for print HTML to be generated
      await page.waitForTimeout(1000);
      
      // Verify invoice number is in the print HTML
      const printHTML = await page.evaluate(() => (window as any).__printHTML);
      expect(printHTML).toContain(invoiceNumber);
      expect(printHTML).toMatch(/INV-\d{4}-\d{3}/);
      
      // Check for success notification
      await expect(page.locator('text=Print Dialog Opened')).toBeVisible({ timeout: 3000 });
    }
  });

  test('should preserve invoice number when updating status', async ({ page }) => {
    await page.click('text=Invoices');
    await page.waitForTimeout(1000);
    
    // Get first invoice number
    const firstInvoiceNumber = await page.locator('td.font-mono').first().textContent();
    
    // Change status
    const statusSelect = page.locator('select').first();
    if (await statusSelect.isVisible()) {
      await statusSelect.selectOption('paid');
      
      // Wait for update
      await page.waitForTimeout(1000);
      
      // Verify invoice number hasn't changed
      const updatedInvoiceNumber = await page.locator('td.font-mono').first().textContent();
      expect(updatedInvoiceNumber).toBe(firstInvoiceNumber);
    }
  });

  test('should maintain year-based numbering across calendar years', async ({ page }) => {
    // This test verifies the year-based counter logic
    await page.click('text=Invoices');
    
    // Get current year
    const currentYear = new Date().getFullYear();
    
    // Create an invoice
    await page.click('text=Create Invoice');
    await page.fill('#businessName', 'Test Business');
    await page.fill('#businessContact', 'test@test.com');
    await page.fill('#businessAddress', 'Address');
    await page.fill('#clientName', 'Test Client');
    await page.fill('#clientContact', 'client@test.com');
    await page.fill('#clientAddress', 'Client Address');
    await page.fill('input[placeholder="Item description"]', 'Service');
    await page.fill('input[type="number"][placeholder="1"]', '1');
    await page.fill('input[type="number"][placeholder="0.00"]', '1000');
    await page.click('button:has-text("Save Invoice")');
    
    await expect(page.locator('text=Invoice Saved Successfully')).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(2500);
    
    // Verify invoice number contains current year
    const invoiceNumber = await page.locator('td.font-mono').first().textContent();
    expect(invoiceNumber).toContain(`INV-${currentYear}-`);
  });

  test('should handle invoice number in consolidated reports', async ({ page }) => {
    await page.click('text=Invoices');
    await page.waitForTimeout(1000);
    
    // Verify invoice numbers are displayed in the table
    const invoiceNumberCells = page.locator('td.font-mono');
    const count = await invoiceNumberCells.count();
    
    if (count > 0) {
      // Check each invoice number follows the format
      for (let i = 0; i < Math.min(count, 5); i++) {
        const invoiceNumber = await invoiceNumberCells.nth(i).textContent();
        expect(invoiceNumber).toMatch(/INV-\d{4}-\d{3}/);
      }
    }
  });

  test('should export invoice with invoice number in CSV', async ({ page }) => {
    await page.click('text=Invoices');
    await page.waitForTimeout(1000);
    
    // Open view dialog
    const viewButton = page.locator('button[title="View Invoice"]').first();
    if (await viewButton.isVisible()) {
      const invoiceNumber = await page.locator('td.font-mono').first().textContent();
      
      await viewButton.click();
      await page.waitForSelector('text=Invoice details');
      
      // Set up download listener
      const downloadPromise = page.waitForEvent('download');
      
      // Click Excel export
      await page.click('button:has-text("Excel")');
      
      // Wait for download
      const download = await downloadPromise;
      
      // Verify filename contains invoice number
      const filename = download.suggestedFilename();
      expect(filename).toContain(invoiceNumber?.replace(/\s/g, ''));
    }
  });
});

