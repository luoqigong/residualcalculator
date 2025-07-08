/**
 * Homepage End-to-End Tests
 * Tests complete user workflows on the homepage
 */

const { test, expect } = require('@playwright/test');

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Residual Calculator/);
    
    // Check main heading
    const heading = page.locator('h1');
    await expect(heading).toHaveText('How to Calculate Residual');
    
    // Check quick calculator is visible
    const calculator = page.locator('.quick-calculator');
    await expect(calculator).toBeVisible();
  });

  test('should have working navigation menu', async ({ page }) => {
    // Test desktop navigation
    await page.setViewportSize({ width: 1200, height: 800 });
    
    const navLinks = page.locator('.nav__link');
    await expect(navLinks).toHaveCount(5);
    
    // Test each navigation link
    const links = [
      { text: 'Home', href: '/' },
      { text: 'Definition', href: '/definition/' },
      { text: 'Formulas', href: '/formulas/' },
      { text: 'Calculator', href: '/calculator/' },
      { text: 'Examples', href: '/examples/' }
    ];
    
    for (const link of links) {
      const navLink = page.locator('.nav__link', { hasText: link.text });
      await expect(navLink).toBeVisible();
      await expect(navLink).toHaveAttribute('href', link.href);
    }
  });

  test('should have working mobile navigation', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Mobile menu should be hidden initially
    const navMenu = page.locator('.nav__menu');
    await expect(navMenu).not.toHaveClass(/nav__menu--open/);
    
    // Click hamburger menu
    const navToggle = page.locator('.nav__toggle');
    await navToggle.click();
    
    // Menu should be open
    await expect(navMenu).toHaveClass(/nav__menu--open/);
    
    // Click a nav link
    const homeLink = page.locator('.nav__link', { hasText: 'Home' });
    await homeLink.click();
    
    // Menu should close
    await expect(navMenu).not.toHaveClass(/nav__menu--open/);
  });

  test('should calculate residual correctly', async ({ page }) => {
    // Fill in the quick calculator
    const observedInput = page.locator('#observed');
    const predictedInput = page.locator('#predicted');
    const calculateButton = page.locator('#quick-calc button[type="submit"]');
    
    await observedInput.fill('10');
    await predictedInput.fill('8');
    await calculateButton.click();
    
    // Wait for result to appear
    const resultDiv = page.locator('#quick-result');
    await expect(resultDiv).toBeVisible();
    
    // Check calculation result
    const resultValue = page.locator('#result-value');
    await expect(resultValue).toContainText('2');
    
    // Check formula display
    const resultCalculation = page.locator('#result-calculation');
    await expect(resultCalculation).toContainText('10 - 8 = 2');
  });

  test('should validate form inputs', async ({ page }) => {
    const calculateButton = page.locator('#quick-calc button[type="submit"]');
    
    // Try to submit empty form
    await calculateButton.click();
    
    // Form should not submit (browser validation)
    const observedInput = page.locator('#observed');
    const isInvalid = await observedInput.evaluate(el => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });

  test('should handle different number formats', async ({ page }) => {
    const testCases = [
      { observed: '10.5', predicted: '8.3', expected: '2.2' },
      { observed: '-5', predicted: '3', expected: '-8' },
      { observed: '0', predicted: '0', expected: '0' },
      { observed: '1000000', predicted: '999999', expected: '1' }
    ];
    
    for (const testCase of testCases) {
      // Clear previous inputs
      await page.locator('#observed').fill('');
      await page.locator('#predicted').fill('');
      
      // Fill new values
      await page.locator('#observed').fill(testCase.observed);
      await page.locator('#predicted').fill(testCase.predicted);
      await page.locator('#quick-calc button[type="submit"]').click();
      
      // Wait for result
      await page.waitForSelector('#quick-result', { state: 'visible' });
      
      // Check result
      const resultValue = page.locator('#result-value');
      await expect(resultValue).toContainText(testCase.expected);
    }
  });

  test('should display feature cards correctly', async ({ page }) => {
    const featureCards = page.locator('.feature-card');
    await expect(featureCards).toHaveCount(4);
    
    const expectedFeatures = [
      'Basic Residuals',
      'Standardized Residuals',
      'Studentized Residuals',
      'Batch Processing'
    ];
    
    for (let i = 0; i < expectedFeatures.length; i++) {
      const card = featureCards.nth(i);
      await expect(card.locator('h4')).toContainText(expectedFeatures[i]);
    }
  });

  test('should have working quick links', async ({ page }) => {
    const linkCards = page.locator('.link-card');
    await expect(linkCards).toHaveCount(4);
    
    const expectedLinks = [
      { text: 'Detailed Definition', href: '/definition/' },
      { text: 'Mathematical Formulas', href: '/formulas/' },
      { text: 'Advanced Calculator', href: '/calculator/' },
      { text: 'Practical Examples', href: '/examples/' }
    ];
    
    for (let i = 0; i < expectedLinks.length; i++) {
      const card = linkCards.nth(i);
      await expect(card).toHaveAttribute('href', expectedLinks[i].href);
      await expect(card.locator('.link-card__title')).toContainText(expectedLinks[i].text);
    }
  });

  test('should render mathematical formulas', async ({ page }) => {
    // Wait for MathJax to load
    await page.waitForFunction(() => window.MathJax !== undefined);
    
    // Check if formulas are present
    const formulaBox = page.locator('.formula-box');
    await expect(formulaBox).toBeVisible();
    
    const formulas = page.locator('.formula');
    await expect(formulas).toHaveCount.greaterThan(0);
  });

  test('should be responsive on different screen sizes', async ({ page }) => {
    // Test desktop
    await page.setViewportSize({ width: 1200, height: 800 });
    const desktopNav = page.locator('.nav__menu');
    await expect(desktopNav).toBeVisible();
    
    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    const container = page.locator('.container');
    await expect(container).toBeVisible();
    
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileToggle = page.locator('.nav__toggle');
    await expect(mobileToggle).toBeVisible();
  });

  test('should have proper SEO meta tags', async ({ page }) => {
    // Check meta description
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute('content', /residual calculator/i);
    
    // Check meta keywords
    const metaKeywords = page.locator('meta[name="keywords"]');
    await expect(metaKeywords).toHaveAttribute('content', /residual calculator/i);
    
    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]');
    await expect(ogTitle).toHaveAttribute('content', /Residual Calculator/i);
    
    const ogUrl = page.locator('meta[property="og:url"]');
    await expect(ogUrl).toHaveAttribute('content', /residualcalculator\.org/);
  });

  test('should handle form submission errors gracefully', async ({ page }) => {
    // Override console.error to capture errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Try invalid inputs
    await page.locator('#observed').fill('invalid');
    await page.locator('#predicted').fill('8');
    await page.locator('#quick-calc button[type="submit"]').click();
    
    // Should not cause JavaScript errors
    expect(errors.length).toBe(0);
  });

  test('should maintain accessibility standards', async ({ page }) => {
    // Check for alt attributes on images (if any)
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      await expect(img).toHaveAttribute('alt');
    }
    
    // Check for proper heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    
    // Check for form labels
    const inputs = page.locator('input[type="number"]');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toBeVisible();
      }
    }
  });

  test('should load quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;
    
    // Should load in reasonable time (adjust threshold as needed)
    expect(loadTime).toBeLessThan(3000);
  });

  test('should not have console errors', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Filter out known acceptable errors (like favicon.ico not found)
    const significantErrors = errors.filter(error => 
      !error.includes('favicon.ico') && 
      !error.includes('404')
    );
    
    expect(significantErrors).toHaveLength(0);
  });
}); 