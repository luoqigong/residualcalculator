/**
 * Performance Tests
 * Tests website loading speed, calculation performance, and resource usage
 */

const { test, expect } = require('@playwright/test');

test.describe('Performance Tests', () => {
  test('should load homepage within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    const domContentLoadedTime = Date.now() - startTime;
    
    // Wait for all resources to load
    await page.waitForLoadState('load');
    const fullLoadTime = Date.now() - startTime;
    
    // Performance thresholds
    expect(domContentLoadedTime).toBeLessThan(2000); // 2 seconds for DOMContentLoaded
    expect(fullLoadTime).toBeLessThan(4000); // 4 seconds for full load
    
    console.log(`Homepage load times - DOMContentLoaded: ${domContentLoadedTime}ms, Full load: ${fullLoadTime}ms`);
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Measure Core Web Vitals
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals = {};
          
          entries.forEach((entry) => {
            if (entry.entryType === 'paint') {
              if (entry.name === 'first-contentful-paint') {
                vitals.fcp = entry.startTime;
              }
            }
            if (entry.entryType === 'largest-contentful-paint') {
              vitals.lcp = entry.startTime;
            }
            if (entry.entryType === 'layout-shift') {
              vitals.cls = (vitals.cls || 0) + entry.value;
            }
          });
          
          setTimeout(() => resolve(vitals), 3000);
        });
        
        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift'] });
      });
    });
    
    // Core Web Vitals thresholds
    if (vitals.fcp) expect(vitals.fcp).toBeLessThan(1800); // FCP < 1.8s
    if (vitals.lcp) expect(vitals.lcp).toBeLessThan(2500); // LCP < 2.5s
    if (vitals.cls) expect(vitals.cls).toBeLessThan(0.1);  // CLS < 0.1
    
    console.log('Core Web Vitals:', vitals);
  });

  test('should calculate residuals quickly', async ({ page }) => {
    await page.goto('/');
    
    const observedInput = page.locator('#observed');
    const predictedInput = page.locator('#predicted');
    const calculateButton = page.locator('#quick-calc button[type="submit"]');
    
    // Measure calculation time
    await observedInput.fill('10');
    await predictedInput.fill('8');
    
    const startTime = Date.now();
    await calculateButton.click();
    
    // Wait for result to appear
    await page.waitForSelector('#quick-result', { state: 'visible' });
    const calculationTime = Date.now() - startTime;
    
    // Calculation should be nearly instantaneous
    expect(calculationTime).toBeLessThan(500); // 500ms including UI updates
    
    console.log(`Calculation time: ${calculationTime}ms`);
  });

  test('should handle batch calculations efficiently', async ({ page }) => {
    await page.goto('/calculator/');
    
    // Switch to batch tab
    const batchTab = page.locator('[data-tab="batch"]');
    await batchTab.click();
    
    // Add multiple rows
    const addRowButton = page.locator('.btn-add-row');
    for (let i = 0; i < 50; i++) {
      await addRowButton.click();
    }
    
    // Fill data for all rows
    const observedInputs = page.locator('.observed-input');
    const predictedInputs = page.locator('.predicted-input');
    
    for (let i = 0; i < 51; i++) {
      await observedInputs.nth(i).fill((Math.random() * 100).toFixed(2));
      await predictedInputs.nth(i).fill((Math.random() * 100).toFixed(2));
    }
    
    // Measure batch calculation time
    const startTime = Date.now();
    const calculateButton = page.locator('#batch-calc button[type="submit"]');
    await calculateButton.click();
    
    // Wait for results
    await page.waitForSelector('.results-table', { state: 'visible', timeout: 10000 });
    const batchCalculationTime = Date.now() - startTime;
    
    // Batch calculation should complete within reasonable time
    expect(batchCalculationTime).toBeLessThan(5000); // 5 seconds for 50 calculations
    
    console.log(`Batch calculation time for 51 rows: ${batchCalculationTime}ms`);
  });

  test('should have minimal resource usage', async ({ page }) => {
    await page.goto('/');
    
    // Measure memory usage
    const memoryUsage = await page.evaluate(() => {
      if ('memory' in performance) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        };
      }
      return null;
    });
    
    if (memoryUsage) {
      // Memory usage should be reasonable
      expect(memoryUsage.usedJSHeapSize).toBeLessThan(50 * 1024 * 1024); // 50MB
      console.log('Memory usage:', memoryUsage);
    }
    
    // Check number of DOM nodes
    const domNodeCount = await page.evaluate(() => {
      return document.querySelectorAll('*').length;
    });
    
    // DOM should not be overly complex
    expect(domNodeCount).toBeLessThan(2000);
    console.log(`DOM nodes: ${domNodeCount}`);
  });

  test('should load CSS and JS resources efficiently', async ({ page }) => {
    const resourceSizes = [];
    
    page.on('response', (response) => {
      const url = response.url();
      const contentType = response.headers()['content-type'] || '';
      
      if (contentType.includes('text/css') || contentType.includes('javascript')) {
        response.body().then(buffer => {
          resourceSizes.push({
            url: url.split('/').pop(),
            type: contentType.includes('css') ? 'CSS' : 'JS',
            size: buffer.length
          });
        }).catch(() => {});
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for response handlers to complete
    await page.waitForTimeout(1000);
    
    console.log('Resource sizes:', resourceSizes);
    
    // Check that CSS files are not too large
    const cssFiles = resourceSizes.filter(r => r.type === 'CSS');
    cssFiles.forEach(file => {
      expect(file.size).toBeLessThan(100 * 1024); // 100KB per CSS file
    });
    
    // Check that JS files are not too large
    const jsFiles = resourceSizes.filter(r => r.type === 'JS');
    jsFiles.forEach(file => {
      expect(file.size).toBeLessThan(200 * 1024); // 200KB per JS file
    });
  });

  test('should handle rapid user interactions smoothly', async ({ page }) => {
    await page.goto('/calculator/');
    
    const tabs = page.locator('.tab-btn');
    const tabCount = await tabs.count();
    
    // Rapidly switch between tabs
    const startTime = Date.now();
    for (let i = 0; i < 20; i++) {
      const tabIndex = i % tabCount;
      await tabs.nth(tabIndex).click();
    }
    const rapidClickTime = Date.now() - startTime;
    
    // Should handle rapid clicks without significant delay
    expect(rapidClickTime).toBeLessThan(2000);
    console.log(`Rapid tab switching time: ${rapidClickTime}ms`);
    
    // Test rapid form interactions
    const basicTab = page.locator('[data-tab="basic"]');
    await basicTab.click();
    
    const observedInput = page.locator('#basic-observed');
    const predictedInput = page.locator('#basic-predicted');
    
    // Rapid input changes
    const inputStartTime = Date.now();
    for (let i = 0; i < 10; i++) {
      await observedInput.fill(i.toString());
      await predictedInput.fill((i + 1).toString());
    }
    const rapidInputTime = Date.now() - inputStartTime;
    
    expect(rapidInputTime).toBeLessThan(1000);
    console.log(`Rapid input changes time: ${rapidInputTime}ms`);
  });

  test('should maintain performance with complex calculations', async ({ page }) => {
    await page.goto('/calculator/');
    
    // Test studentized residual calculation (most complex)
    const studentizedTab = page.locator('[data-tab="studentized"]');
    await studentizedTab.click();
    
    // Fill complex calculation parameters
    await page.locator('#stud-observed').fill('1000.123456789');
    await page.locator('#stud-predicted').fill('999.987654321');
    await page.locator('#stud-leverage').fill('0.456789');
    await page.locator('#stud-mse').fill('123.456789');
    await page.locator('#stud-n').fill('10000');
    await page.locator('#stud-p').fill('25');
    
    const startTime = Date.now();
    const calculateButton = page.locator('#studentized-calc button[type="submit"]');
    await calculateButton.click();
    
    await page.waitForSelector('#studentized-result', { state: 'visible' });
    const complexCalculationTime = Date.now() - startTime;
    
    // Complex calculation should still be fast
    expect(complexCalculationTime).toBeLessThan(1000);
    console.log(`Complex calculation time: ${complexCalculationTime}ms`);
  });

  test('should have reasonable script execution time', async ({ page }) => {
    await page.goto('/');
    
    // Measure script execution time
    const scriptExecutionTime = await page.evaluate(() => {
      const startTime = performance.now();
      
      // Simulate some complex operations
      for (let i = 0; i < 1000; i++) {
        const observed = Math.random() * 1000;
        const predicted = Math.random() * 1000;
        const residual = observed - predicted;
      }
      
      return performance.now() - startTime;
    });
    
    // Script execution should be efficient
    expect(scriptExecutionTime).toBeLessThan(50); // 50ms for 1000 calculations
    console.log(`Script execution time: ${scriptExecutionTime}ms`);
  });

  test('should handle large datasets without crashing', async ({ page }) => {
    await page.goto('/calculator/');
    
    const batchTab = page.locator('[data-tab="batch"]');
    await batchTab.click();
    
    // Add many rows (stress test)
    const addRowButton = page.locator('.btn-add-row');
    for (let i = 0; i < 100; i++) {
      await addRowButton.click();
    }
    
    // Check that page is still responsive
    const observedInputs = page.locator('.observed-input');
    const inputCount = await observedInputs.count();
    expect(inputCount).toBe(101); // 1 initial + 100 added
    
    // Fill some data
    for (let i = 0; i < Math.min(inputCount, 20); i++) {
      await observedInputs.nth(i).fill((i + 1).toString());
    }
    
    // Page should still be responsive
    const tabButton = page.locator('[data-tab="basic"]');
    await tabButton.click();
    await expect(tabButton).toHaveClass(/tab-btn--active/);
  });

  test('should maintain smooth scrolling performance', async ({ page }) => {
    await page.goto('/definition/');
    
    // Measure scroll performance
    const scrollStartTime = Date.now();
    
    // Perform scrolling
    for (let i = 0; i < 10; i++) {
      await page.evaluate(() => window.scrollBy(0, 200));
      await page.waitForTimeout(50);
    }
    
    const scrollTime = Date.now() - scrollStartTime;
    
    // Scrolling should be smooth (this is a rough check)
    expect(scrollTime).toBeLessThan(2000);
    console.log(`Scrolling performance: ${scrollTime}ms`);
  });

  test('should have minimal layout thrashing', async ({ page }) => {
    await page.goto('/calculator/');
    
    // Monitor layout shifts during interactions
    let layoutShifts = 0;
    
    await page.evaluate(() => {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
            window.layoutShifts = (window.layoutShifts || 0) + entry.value;
          }
        }
      });
      observer.observe({ entryTypes: ['layout-shift'] });
      window.layoutShifts = 0;
    });
    
    // Perform various interactions
    const tabs = page.locator('.tab-btn');
    const tabCount = await tabs.count();
    
    for (let i = 0; i < tabCount; i++) {
      await tabs.nth(i).click();
      await page.waitForTimeout(100);
    }
    
    // Get final layout shift score
    const finalLayoutShifts = await page.evaluate(() => window.layoutShifts || 0);
    
    // Layout shifts should be minimal
    expect(finalLayoutShifts).toBeLessThan(0.1);
    console.log(`Layout shift score: ${finalLayoutShifts}`);
  });
}); 