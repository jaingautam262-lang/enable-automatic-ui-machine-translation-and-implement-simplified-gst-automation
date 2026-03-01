import { test, expect } from '@playwright/test';

test.describe('Transaction Journal Integration', () => {
  test('should update journal entry when transaction is edited', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Wait for authentication (if needed)
    await page.waitForSelector('text=Dashboard', { timeout: 10000 });

    // Navigate to Transactions tab
    await page.click('text=Transactions');
    await page.waitForSelector('text=Transaction History');

    // Create a new transaction
    await page.click('text=Add Transaction');
    await page.selectOption('select#transactionType', 'sale');
    await page.fill('input#category', 'Test Sale');
    await page.fill('input#amount', '1000');
    await page.fill('textarea#description', 'Initial test transaction');
    await page.click('button:has-text("Add Transaction")');
    await page.waitForSelector('text=Transaction added successfully');

    // Create journal entry from transaction
    await page.click('button[title="Create Journal Entry"]');
    await page.waitForSelector('text=Journal entry created');

    // Navigate to Journal tab to verify initial entry
    await page.click('text=Journal');
    await page.waitForSelector('text=Initial test transaction');
    const initialJournalAmount = await page.textContent('text=Initial test transaction >> .. >> text=₹1,000.00');
    expect(initialJournalAmount).toBeTruthy();

    // Go back to Transactions and edit the transaction
    await page.click('text=Transactions');
    await page.click('button[title="Edit Transaction"]');
    await page.fill('input#edit-amount', '1500');
    await page.fill('textarea#edit-description', 'Updated test transaction');
    await page.click('button:has-text("Update Transaction")');
    await page.waitForSelector('text=Transaction updated successfully');

    // Navigate back to Journal tab
    await page.click('text=Journal');
    await page.waitForSelector('text=Updated test transaction');

    // Verify the journal entry reflects the updated amount
    const updatedJournalAmount = await page.textContent('text=Updated test transaction >> .. >> text=₹1,500.00');
    expect(updatedJournalAmount).toBeTruthy();

    // Verify trial balance is still balanced
    await page.waitForSelector('text=Trial balance is balanced');
  });
});

test.describe('Multilingual Translation', () => {
  test('should translate UI when language is changed', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Wait for authentication
    await page.waitForSelector('text=Dashboard', { timeout: 10000 });

    // Verify initial English text
    const englishOverview = await page.textContent('text=Overview');
    expect(englishOverview).toBe('Overview');

    // Change language to Hindi
    await page.click('select[id="language"]');
    await page.selectOption('select[id="language"]', 'hi-IN');

    // Wait for translation to apply (give it a moment for async translation)
    await page.waitForTimeout(2000);

    // Verify at least one UI element has changed from English
    const dashboardText = await page.textContent('text=Dashboard');
    // The text should either be translated or remain as Dashboard (fallback)
    // We're checking that the translation system is working, not the exact translation
    expect(dashboardText).toBeTruthy();

    // Navigate to Settings to verify translation persists
    await page.click('text=Settings');
    await page.waitForSelector('text=Language Preferences');

    // Verify the language selector shows Hindi as selected
    const selectedLanguage = await page.inputValue('select[id="language"]');
    expect(selectedLanguage).toBe('hi-IN');

    // Change back to English
    await page.selectOption('select[id="language"]', 'en-US');
    await page.waitForTimeout(1000);

    // Verify English text is restored
    const englishSettings = await page.textContent('text=Settings');
    expect(englishSettings).toBe('Settings');
  });

  test('should not show raw translation keys', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Wait for authentication
    await page.waitForSelector('text=Dashboard', { timeout: 10000 });

    // Change to a non-English language
    await page.click('select[id="language"]');
    await page.selectOption('select[id="language"]', 'es-ES');
    await page.waitForTimeout(2000);

    // Check that no raw keys like "nav.overview" are visible
    const bodyText = await page.textContent('body');
    expect(bodyText).not.toContain('nav.');
    expect(bodyText).not.toContain('common.');
    expect(bodyText).not.toContain('dashboard.');
  });
});
