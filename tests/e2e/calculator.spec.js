/**
 * Calculator Page End-to-End Tests
 * Tests all calculator functionalities and interactions
 */

const { test, expect } = require('@playwright/test');

test.describe('Calculator Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/calculator/');
  });

  test('should load calculator page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Calculator.*Residual Calculator/);
    
    const calculatorTitle = page.locator('.calculator-title');
    await expect(calculatorTitle).toBeVisible();
    
    // Check if tabs are present
    const tabs = page.locator('.tab-btn');
    await expect(tabs).toHaveCount(4);
  });

  test('should switch between calculator tabs', async ({ page }) => {
    const basicTab = page.locator('[data-tab="basic"]');
    const standardizedTab = page.locator('[data-tab="standardized"]');
    const studentizedTab = page.locator('[data-tab="studentized"]');
    const batchTab = page.locator('[data-tab="batch"]');

    // Initially basic should be active
    await expect(basicTab).toHaveClass(/tab-btn--active/);

    // Switch to standardized tab
    await standardizedTab.click();
    await expect(standardizedTab).toHaveClass(/tab-btn--active/);
    await expect(basicTab).not.toHaveClass(/tab-btn--active/);

    // Switch to studentized tab
    await studentizedTab.click();
    await expect(studentizedTab).toHaveClass(/tab-btn--active/);
    await expect(standardizedTab).not.toHaveClass(/tab-btn--active/);

    // Switch to batch tab
    await batchTab.click();
    await expect(batchTab).toHaveClass(/tab-btn--active/);
    await expect(studentizedTab).not.toHaveClass(/tab-btn--active/);
  });

  test('should calculate basic residuals correctly', async ({ page }) => {
    const basicTab = page.locator('[data-tab="basic"]');
    await basicTab.click();

    const observedInput = page.locator('#basic-observed');
    const predictedInput = page.locator('#basic-predicted');
    const calculateButton = page.locator('#basic-calc button[type="submit"]');

    await observedInput.fill('15');
    await predictedInput.fill('12');
    await calculateButton.click();

    // Wait for result
    const resultContainer = page.locator('#basic-result');
    await expect(resultContainer).toBeVisible();

    // Check calculation result
    const residualValue = page.locator('#basic-residual-value');
    await expect(residualValue).toContainText('3');
  });

  test('should calculate standardized residuals correctly', async ({ page }) => {
    const standardizedTab = page.locator('[data-tab="standardized"]');
    await standardizedTab.click();

    await page.locator('#std-observed').fill('10');
    await page.locator('#std-predicted').fill('8');
    await page.locator('#std-error').fill('1.5');
    
    const calculateButton = page.locator('#standardized-calc button[type="submit"]');
    await calculateButton.click();

    const resultContainer = page.locator('#standardized-result');
    await expect(resultContainer).toBeVisible();

    // Check that standardized residual is calculated (2/1.5 ≈ 1.33)
    const standardizedValue = page.locator('#standardized-residual-value');
    await expect(standardizedValue).toContainText('1.33');
  });

  test('should calculate studentized residuals correctly', async ({ page }) => {
    const studentizedTab = page.locator('[data-tab="studentized"]');
    await studentizedTab.click();

    await page.locator('#stud-observed').fill('12');
    await page.locator('#stud-predicted').fill('10');
    await page.locator('#stud-leverage').fill('0.1');
    await page.locator('#stud-mse').fill('2');
    await page.locator('#stud-n').fill('100');
    await page.locator('#stud-p').fill('5');

    const calculateButton = page.locator('#studentized-calc button[type="submit"]');
    await calculateButton.click();

    const resultContainer = page.locator('#studentized-result');
    await expect(resultContainer).toBeVisible();

    const studentizedValue = page.locator('#studentized-residual-value');
    await expect(studentizedValue).toBeVisible();
  });

  test('should handle batch calculations', async ({ page }) => {
    const batchTab = page.locator('[data-tab="batch"]');
    await batchTab.click();

    // Add additional rows
    const addRowButton = page.locator('.btn-add-row');
    await addRowButton.click();
    await addRowButton.click();

    // Fill in data for multiple rows
    const observedInputs = page.locator('.observed-input');
    const predictedInputs = page.locator('.predicted-input');

    await observedInputs.nth(0).fill('10');
    await predictedInputs.nth(0).fill('8');
    
    await observedInputs.nth(1).fill('15');
    await predictedInputs.nth(1).fill('12');
    
    await observedInputs.nth(2).fill('20');
    await predictedInputs.nth(2).fill('18');

    const calculateButton = page.locator('#batch-calc button[type="submit"]');
    await calculateButton.click();

    // Wait for results
    const resultsTable = page.locator('.results-table');
    await expect(resultsTable).toBeVisible();

    // Check that all rows are calculated
    const resultRows = page.locator('.results-table tbody tr');
    await expect(resultRows).toHaveCount(3);
  });

  test('should remove batch calculator rows', async ({ page }) => {
    const batchTab = page.locator('[data-tab="batch"]');
    await batchTab.click();

    // Add some rows first
    const addRowButton = page.locator('.btn-add-row');
    await addRowButton.click();
    await addRowButton.click();

    let dataRows = page.locator('.data-row');
    await expect(dataRows).toHaveCount(3);

    // Remove a row (but not the last one)
    const removeButton = page.locator('.btn-remove').first();
    await removeButton.click();

    dataRows = page.locator('.data-row');
    await expect(dataRows).toHaveCount(2);
  });

  test('should export batch results as CSV', async ({ page }) => {
    const batchTab = page.locator('[data-tab="batch"]');
    await batchTab.click();

    // Fill in some data
    await page.locator('.observed-input').first().fill('10');
    await page.locator('.predicted-input').first().fill('8');

    // Calculate
    const calculateButton = page.locator('#batch-calc button[type="submit"]');
    await calculateButton.click();

    // Wait for results
    await page.waitForSelector('.results-table', { state: 'visible' });

    // Check if export button exists
    const exportCsvButton = page.locator('.btn-export-csv');
    await expect(exportCsvButton).toBeVisible();

    // Test export functionality (check if download is triggered)
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      exportCsvButton.click()
    ]);

    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('should validate input fields', async ({ page }) => {
    const basicTab = page.locator('[data-tab="basic"]');
    await basicTab.click();

    // Try to submit with empty fields
    const calculateButton = page.locator('#basic-calc button[type="submit"]');
    await calculateButton.click();

    // Check validation
    const observedInput = page.locator('#basic-observed');
    const isInvalid = await observedInput.evaluate(el => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });

  test('should handle error cases gracefully', async ({ page }) => {
    const standardizedTab = page.locator('[data-tab="standardized"]');
    await standardizedTab.click();

    // Test division by zero
    await page.locator('#std-observed').fill('10');
    await page.locator('#std-predicted').fill('8');
    await page.locator('#std-error').fill('0');

    const calculateButton = page.locator('#standardized-calc button[type="submit"]');
    await calculateButton.click();

    // Should show error message
    const errorMessage = page.locator('.calculation-error');
    await expect(errorMessage).toBeVisible();
  });

  test('should provide calculation interpretations', async ({ page }) => {
    const basicTab = page.locator('[data-tab="basic"]');
    await basicTab.click();

    await page.locator('#basic-observed').fill('25');
    await page.locator('#basic-predicted').fill('20');
    
    const calculateButton = page.locator('#basic-calc button[type="submit"]');
    await calculateButton.click();

    // Check for interpretation section
    const interpretation = page.locator('.result-interpretation');
    await expect(interpretation).toBeVisible();
    await expect(interpretation).toContainText('positive');
  });

  test('should clear results when clear button is clicked', async ({ page }) => {
    const basicTab = page.locator('[data-tab="basic"]');
    await basicTab.click();

    // Calculate something first
    await page.locator('#basic-observed').fill('10');
    await page.locator('#basic-predicted').fill('8');
    
    const calculateButton = page.locator('#basic-calc button[type="submit"]');
    await calculateButton.click();

    // Wait for result
    const resultContainer = page.locator('#basic-result');
    await expect(resultContainer).toBeVisible();

    // Clear results
    const clearButton = page.locator('.btn-clear');
    await clearButton.click();

    // Result should be hidden
    await expect(resultContainer).not.toBeVisible();
  });

  test('should copy results to clipboard', async ({ page }) => {
    // Grant clipboard permissions
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);

    const basicTab = page.locator('[data-tab="basic"]');
    await basicTab.click();

    await page.locator('#basic-observed').fill('10');
    await page.locator('#basic-predicted').fill('8');
    
    const calculateButton = page.locator('#basic-calc button[type="submit"]');
    await calculateButton.click();

    // Wait for result
    await page.waitForSelector('#basic-result', { state: 'visible' });

    // Copy result
    const copyButton = page.locator('.btn-copy-result');
    await copyButton.click();

    // Check clipboard content
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toContain('2');
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Check mobile layout
    const tabNav = page.locator('.tab-nav');
    await expect(tabNav).toBeVisible();

    // Tabs should be scrollable on mobile
    const tabContainer = page.locator('.tab-nav');
    const scrollWidth = await tabContainer.evaluate(el => el.scrollWidth);
    const clientWidth = await tabContainer.evaluate(el => el.clientWidth);
    
    // If tabs don't fit, should be scrollable
    if (scrollWidth > clientWidth) {
      expect(scrollWidth).toBeGreaterThan(clientWidth);
    }

    // Test form layout on mobile
    const basicTab = page.locator('[data-tab="basic"]');
    await basicTab.click();

    const formGrid = page.locator('.form-grid');
    await expect(formGrid).toBeVisible();
  });

  test('should handle batch calculation with large datasets', async ({ page }) => {
    const batchTab = page.locator('[data-tab="batch"]');
    await batchTab.click();

    // Add many rows
    const addRowButton = page.locator('.btn-add-row');
    for (let i = 0; i < 20; i++) {
      await addRowButton.click();
    }

    // Fill in data for all rows
    const observedInputs = page.locator('.observed-input');
    const predictedInputs = page.locator('.predicted-input');

    for (let i = 0; i < 21; i++) {
      await observedInputs.nth(i).fill((10 + i).toString());
      await predictedInputs.nth(i).fill((8 + i).toString());
    }

    const calculateButton = page.locator('#batch-calc button[type="submit"]');
    await calculateButton.click();

    // Wait for results (might take longer with large dataset)
    const resultsTable = page.locator('.results-table');
    await expect(resultsTable).toBeVisible({ timeout: 10000 });

    // Check summary statistics
    const summaryStats = page.locator('.summary-stats');
    await expect(summaryStats).toBeVisible();
  });

  test('should maintain precision with decimal calculations', async ({ page }) => {
    const basicTab = page.locator('[data-tab="basic"]');
    await basicTab.click();

    // Test with decimal values
    await page.locator('#basic-observed').fill('10.123456');
    await page.locator('#basic-predicted').fill('8.987654');
    
    const calculateButton = page.locator('#basic-calc button[type="submit"]');
    await calculateButton.click();

    const resultValue = page.locator('#basic-residual-value');
    await expect(resultValue).toContainText('1.1358');
  });

  test('should show help information', async ({ page }) => {
    // Check if help sections are present
    const helpSections = page.locator('.help-section');
    await expect(helpSections).toHaveCount.greaterThan(0);

    // Check help cards
    const helpCards = page.locator('.help-card');
    await expect(helpCards).toHaveCount.greaterThan(0);

    // Each help card should have title and content
    const helpCardCount = await helpCards.count();
    for (let i = 0; i < helpCardCount; i++) {
      const card = helpCards.nth(i);
      await expect(card.locator('h3')).toBeVisible();
      await expect(card.locator('p')).toBeVisible();
    }
  });

  test('should handle keyboard navigation', async ({ page }) => {
    const basicTab = page.locator('[data-tab="basic"]');
    await basicTab.click();

    const observedInput = page.locator('#basic-observed');
    const predictedInput = page.locator('#basic-predicted');
    const calculateButton = page.locator('#basic-calc button[type="submit"]');

    // Tab through elements
    await observedInput.focus();
    await page.keyboard.press('Tab');
    await expect(predictedInput).toBeFocused();

    await page.keyboard.press('Tab');
    await expect(calculateButton).toBeFocused();

    // Test Enter key on button
    await observedInput.fill('10');
    await predictedInput.fill('8');
    await calculateButton.focus();
    await page.keyboard.press('Enter');

    const resultContainer = page.locator('#basic-result');
    await expect(resultContainer).toBeVisible();
  });
}); 