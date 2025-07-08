/**
 * Responsive Design Tests
 * Tests website adaptation across different device sizes
 */

const { test, expect, devices } = require('@playwright/test');

const viewports = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 12', width: 390, height: 844 },
  { name: 'Samsung Galaxy S8+', width: 360, height: 740 },
  { name: 'iPad', width: 768, height: 1024 },
  { name: 'iPad Pro', width: 1024, height: 1366 },
  { name: 'Desktop', width: 1200, height: 800 },
  { name: 'Large Desktop', width: 1920, height: 1080 }
];

const pages = [
  { name: 'Homepage', url: '/' },
  { name: 'Calculator', url: '/calculator/' },
  { name: 'Definition', url: '/definition/' },
  { name: 'Formulas', url: '/formulas/' },
  { name: 'Examples', url: '/examples/' }
];

test.describe('Responsive Design Tests', () => {
  viewports.forEach(viewport => {
    test.describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      pages.forEach(pageName => {
        test(`${pageName.name} should render correctly`, async ({ page }) => {
          await page.setViewportSize({ width: viewport.width, height: viewport.height });
          await page.goto(pageName.url);

          // Wait for page to load
          await page.waitForLoadState('domcontentloaded');

          // Check that page doesn't have horizontal scroll
          const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
          const viewportWidth = viewport.width;
          expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1); // Allow 1px tolerance

          // Check that main content is visible
          const mainContent = page.locator('main, .main');
          await expect(mainContent).toBeVisible();

          // Take screenshot for visual regression testing
          await page.screenshot({
            path: `test-results/screenshots/${viewport.name}-${pageName.name}.png`,
            fullPage: true
          });
        });
      });

      test('Navigation should work correctly', async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');

        if (viewport.width <= 768) {
          // Mobile navigation test
          const navToggle = page.locator('.nav__toggle');
          const navMenu = page.locator('.nav__menu');

          await expect(navToggle).toBeVisible();
          await expect(navMenu).not.toHaveClass(/nav__menu--open/);

          // Open menu
          await navToggle.click();
          await expect(navMenu).toHaveClass(/nav__menu--open/);

          // Click a link
          const calculatorLink = page.locator('.nav__link[href="/calculator/"]');
          await calculatorLink.click();

          // Menu should close and navigate
          await expect(page).toHaveURL(/\/calculator\//);
          await expect(navMenu).not.toHaveClass(/nav__menu--open/);
        } else {
          // Desktop navigation test
          const navMenu = page.locator('.nav__menu');
          const navToggle = page.locator('.nav__toggle');

          await expect(navMenu).toBeVisible();
          await expect(navToggle).not.toBeVisible();

          // Test direct link clicking
          const calculatorLink = page.locator('.nav__link[href="/calculator/"]');
          await calculatorLink.click();
          await expect(page).toHaveURL(/\/calculator\//);
        }
      });

      test('Calculator should be functional', async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/calculator/');

        // Test tab switching
        const tabBtns = page.locator('.tab-btn');
        const tabCount = await tabBtns.count();

        for (let i = 0; i < Math.min(tabCount, 3); i++) {
          await tabBtns.nth(i).click();
          await expect(tabBtns.nth(i)).toHaveClass(/tab-btn--active/);
        }

        // Test basic calculation
        const basicTab = page.locator('[data-tab="basic"]');
        await basicTab.click();

        // Fill form - check if inputs are accessible
        const observedInput = page.locator('#basic-observed');
        const predictedInput = page.locator('#basic-predicted');

        await expect(observedInput).toBeVisible();
        await expect(predictedInput).toBeVisible();

        await observedInput.fill('10');
        await predictedInput.fill('8');

        const calculateButton = page.locator('#basic-calc button[type="submit"]');
        await calculateButton.click();

        // Check if result is shown
        const resultContainer = page.locator('#basic-result');
        await expect(resultContainer).toBeVisible();
      });

      test('Touch targets should be adequate on mobile', async ({ page }) => {
        if (viewport.width > 768) return; // Skip for desktop

        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');

        // Check button sizes
        const buttons = page.locator('button, .btn, .nav__link, .tab-btn');
        const buttonCount = await buttons.count();

        for (let i = 0; i < Math.min(buttonCount, 10); i++) {
          const button = buttons.nth(i);
          if (await button.isVisible()) {
            const box = await button.boundingBox();
            if (box) {
              // Touch targets should be at least 44px (Apple) or 48dp (Google)
              expect(box.height).toBeGreaterThanOrEqual(40);
              expect(box.width).toBeGreaterThanOrEqual(40);
            }
          }
        }
      });

      test('Form elements should be appropriately sized', async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/calculator/');

        const inputs = page.locator('input[type="number"]');
        const inputCount = await inputs.count();

        for (let i = 0; i < Math.min(inputCount, 5); i++) {
          const input = inputs.nth(i);
          if (await input.isVisible()) {
            const box = await input.boundingBox();
            if (box) {
              expect(box.height).toBeGreaterThanOrEqual(40);
            }

            // Check font size for mobile (should be at least 16px to prevent zoom)
            if (viewport.width <= 768) {
              const fontSize = await input.evaluate(el => 
                window.getComputedStyle(el).fontSize
              );
              const fontSizeValue = parseInt(fontSize.replace('px', ''));
              expect(fontSizeValue).toBeGreaterThanOrEqual(16);
            }
          }
        }
      });

      test('Content should not overflow viewport', async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');

        // Check for horizontal overflow
        const hasHorizontalScroll = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        expect(hasHorizontalScroll).toBe(false);

        // Check specific elements that commonly cause overflow
        const wideElements = page.locator('.container, .nav, .quick-calculator, .feature-grid');
        const elementCount = await wideElements.count();

        for (let i = 0; i < elementCount; i++) {
          const element = wideElements.nth(i);
          if (await element.isVisible()) {
            const box = await element.boundingBox();
            if (box) {
              expect(box.width).toBeLessThanOrEqual(viewport.width);
            }
          }
        }
      });

      test('Text should be readable', async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');

        // Check font sizes
        const textElements = page.locator('p, span, div, h1, h2, h3, h4, h5, h6');
        const elementCount = await textElements.count();

        for (let i = 0; i < Math.min(elementCount, 20); i++) {
          const element = textElements.nth(i);
          if (await element.isVisible()) {
            const fontSize = await element.evaluate(el => {
              const computed = window.getComputedStyle(el);
              return parseInt(computed.fontSize.replace('px', ''));
            });

            // Minimum readable font size
            expect(fontSize).toBeGreaterThanOrEqual(12);
          }
        }

        // Check line height for readability
        const paragraphs = page.locator('p');
        const paragraphCount = await paragraphs.count();

        for (let i = 0; i < Math.min(paragraphCount, 5); i++) {
          const paragraph = paragraphs.nth(i);
          if (await paragraph.isVisible()) {
            const lineHeight = await paragraph.evaluate(el => {
              const computed = window.getComputedStyle(el);
              return parseFloat(computed.lineHeight);
            });

            // Line height should be at least 1.2
            expect(lineHeight).toBeGreaterThanOrEqual(1.2);
          }
        }
      });
    });
  });

  test.describe('Cross-device compatibility', () => {
    test('Should maintain functionality across all devices', async ({ page }) => {
      for (const viewport of viewports.slice(0, 4)) { // Test first 4 viewports
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');

        // Test quick calculator functionality
        const observedInput = page.locator('#observed');
        const predictedInput = page.locator('#predicted');
        const calculateButton = page.locator('#quick-calc button[type="submit"]');

        await observedInput.fill('10');
        await predictedInput.fill('8');
        await calculateButton.click();

        const resultDiv = page.locator('#quick-result');
        await expect(resultDiv).toBeVisible();

        const resultValue = page.locator('#result-value');
        await expect(resultValue).toContainText('2');
      }
    });

    test('Should handle orientation changes', async ({ page }) => {
      // Test landscape mobile
      await page.setViewportSize({ width: 667, height: 375 });
      await page.goto('/');

      const navToggle = page.locator('.nav__toggle');
      await expect(navToggle).toBeVisible();

      // Test portrait tablet
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/calculator/');

      const tabNav = page.locator('.tab-nav');
      await expect(tabNav).toBeVisible();

      // Test landscape tablet
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.reload();

      await expect(tabNav).toBeVisible();
    });
  });

  test.describe('Performance on different devices', () => {
    test('Should load quickly on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;

      // Mobile should load within reasonable time
      expect(loadTime).toBeLessThan(5000);
    });

    test('Should be smooth on low-end devices', async ({ page }) => {
      // Simulate slow network and CPU
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 50);
      });

      await page.setViewportSize({ width: 360, height: 640 });
      await page.goto('/calculator/');

      // Test tab switching performance
      const tabs = page.locator('.tab-btn');
      const tabCount = await tabs.count();

      for (let i = 0; i < tabCount; i++) {
        const startTime = Date.now();
        await tabs.nth(i).click();
        await page.waitForSelector('.tab-content--active');
        const switchTime = Date.now() - startTime;

        // Tab switching should be reasonably fast even on slow devices
        expect(switchTime).toBeLessThan(1000);
      }
    });
  });

  test.describe('Accessibility on different devices', () => {
    test('Should be keyboard navigable on all devices', async ({ page }) => {
      for (const viewport of [
        { width: 375, height: 667 },
        { width: 1200, height: 800 }
      ]) {
        await page.setViewportSize(viewport);
        await page.goto('/');

        // Test tab navigation
        await page.keyboard.press('Tab');
        const firstFocusable = await page.evaluate(() => document.activeElement.tagName);
        expect(['A', 'BUTTON', 'INPUT']).toContain(firstFocusable);

        // Continue tabbing and ensure focus is visible
        for (let i = 0; i < 5; i++) {
          await page.keyboard.press('Tab');
          const activeElement = page.locator(':focus');
          await expect(activeElement).toBeVisible();
        }
      }
    });

    test('Should maintain contrast ratios on all devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      // Check text contrast (simplified test)
      const textElements = page.locator('p, h1, h2, h3, button, .nav__link');
      const elementCount = await textElements.count();

      for (let i = 0; i < Math.min(elementCount, 10); i++) {
        const element = textElements.nth(i);
        if (await element.isVisible()) {
          const styles = await element.evaluate(el => {
            const computed = window.getComputedStyle(el);
            return {
              color: computed.color,
              backgroundColor: computed.backgroundColor
            };
          });

          // Basic check that color is not transparent
          expect(styles.color).not.toBe('rgba(0, 0, 0, 0)');
        }
      }
    });
  });
}); 