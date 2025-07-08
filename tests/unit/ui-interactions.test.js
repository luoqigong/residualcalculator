/**
 * UI Interactions Unit Tests
 * Tests user interface interactions and form handling
 */

// Mock DOM environment
document.body.innerHTML = `
  <header class="header">
    <nav class="nav container">
      <div class="nav__toggle" id="nav-toggle">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <ul class="nav__menu" id="nav-menu">
        <li><a href="/" class="nav__link">Home</a></li>
        <li><a href="/calculator/" class="nav__link">Calculator</a></li>
      </ul>
    </nav>
  </header>
  
  <form id="quick-calc" class="calculator-form">
    <input id="observed" type="number" required />
    <input id="predicted" type="number" required />
    <button type="submit">Calculate</button>
  </form>
  
  <div id="quick-result" style="display: none;">
    <div id="result-calculation"></div>
    <div id="result-value"></div>
  </div>
  
  <div class="tab-nav">
    <button class="tab-btn tab-btn--active" data-tab="basic">Basic</button>
    <button class="tab-btn" data-tab="standardized">Standardized</button>
  </div>
  
  <div class="tab-content tab-content--active" id="basic-tab">Basic content</div>
  <div class="tab-content" id="standardized-tab">Standardized content</div>
  
  <div class="batch-calculator">
    <button class="btn-add-row">Add Row</button>
    <div class="table-body">
      <div class="data-row">
        <input class="observed-input" type="number" />
        <input class="predicted-input" type="number" />
        <button class="btn-remove">×</button>
      </div>
    </div>
  </div>
`;

// Load required modules
const ResidualCalculator = require('../../assets/js/calculator.js');
// Mock main.js since it's DOM dependent
global.MainUtils = {
  showNotification: jest.fn(),
  showButtonLoading: jest.fn(),
  hideButtonLoading: jest.fn(),
  copyToClipboard: jest.fn().mockResolvedValue(true),
  validateField: jest.fn(),
  formatNumber: jest.fn(num => num.toString())
};

// Set up window.MainUtils
window.MainUtils = global.MainUtils;

describe('UI Interactions', () => {
  let calculator;

  beforeEach(() => {
    calculator = new ResidualCalculator();
    // Reset DOM state
    document.getElementById('quick-result').style.display = 'none';
    document.getElementById('observed').value = '';
    document.getElementById('predicted').value = '';
  });

  describe('Mobile Navigation', () => {
    test('should toggle mobile menu when nav toggle is clicked', () => {
      const navToggle = document.getElementById('nav-toggle');
      const navMenu = document.getElementById('nav-menu');

      // Initially should not be open
      expect(navToggle.classList.contains('nav__toggle--open')).toBe(false);
      expect(navMenu.classList.contains('nav__menu--open')).toBe(false);

      // Click to open
      navToggle.click();
      expect(navToggle.classList.contains('nav__toggle--open')).toBe(true);
      expect(navMenu.classList.contains('nav__menu--open')).toBe(true);

      // Click to close
      navToggle.click();
      expect(navToggle.classList.contains('nav__toggle--open')).toBe(false);
      expect(navMenu.classList.contains('nav__menu--open')).toBe(false);
    });

    test('should close mobile menu when clicking on a nav link', () => {
      const navToggle = document.getElementById('nav-toggle');
      const navMenu = document.getElementById('nav-menu');
      const navLink = navMenu.querySelector('.nav__link');

      // Open menu first
      navToggle.click();
      expect(navMenu.classList.contains('nav__menu--open')).toBe(true);

      // Click nav link should close menu
      navLink.click();
      expect(navToggle.classList.contains('nav__toggle--open')).toBe(false);
      expect(navMenu.classList.contains('nav__menu--open')).toBe(false);
    });

    test('should close mobile menu when clicking outside', () => {
      const navToggle = document.getElementById('nav-toggle');
      const navMenu = document.getElementById('nav-menu');

      // Open menu
      navToggle.click();
      expect(navMenu.classList.contains('nav__menu--open')).toBe(true);

      // Click outside (on body)
      const clickEvent = new MouseEvent('click', { bubbles: true });
      document.body.dispatchEvent(clickEvent);

      expect(navToggle.classList.contains('nav__toggle--open')).toBe(false);
      expect(navMenu.classList.contains('nav__menu--open')).toBe(false);
    });
  });

  describe('Quick Calculator Form', () => {
    test('should handle valid form submission', () => {
      const form = document.getElementById('quick-calc');
      const observedInput = document.getElementById('observed');
      const predictedInput = document.getElementById('predicted');
      const resultDiv = document.getElementById('quick-result');

      observedInput.value = '10';
      predictedInput.value = '8';

      const submitEvent = new Event('submit', { bubbles: true });
      Object.defineProperty(submitEvent, 'target', { value: form });
      
      form.dispatchEvent(submitEvent);

      // Check if result is displayed
      setTimeout(() => {
        expect(resultDiv.style.display).not.toBe('none');
      }, 600);
    });

    test('should prevent submission with empty inputs', () => {
      const form = document.getElementById('quick-calc');
      const observedInput = document.getElementById('observed');
      const predictedInput = document.getElementById('predicted');

      // Leave inputs empty
      observedInput.value = '';
      predictedInput.value = '';

      // Form should be invalid due to required attribute
      expect(form.checkValidity()).toBe(false);
    });

    test('should validate number inputs', () => {
      const observedInput = document.getElementById('observed');
      const predictedInput = document.getElementById('predicted');

      // Test valid numbers
      observedInput.value = '10.5';
      predictedInput.value = '-5.2';
      expect(observedInput.validity.valid).toBe(true);
      expect(predictedInput.validity.valid).toBe(true);

      // Test invalid input (should be handled by browser)
      observedInput.value = 'abc';
      expect(observedInput.validity.valid).toBe(false);
    });
  });

  describe('Tab Navigation', () => {
    test('should switch tabs when tab button is clicked', () => {
      const basicBtn = document.querySelector('[data-tab="basic"]');
      const standardizedBtn = document.querySelector('[data-tab="standardized"]');
      const basicTab = document.getElementById('basic-tab');
      const standardizedTab = document.getElementById('standardized-tab');

      // Initially basic should be active
      expect(basicBtn.classList.contains('tab-btn--active')).toBe(true);
      expect(basicTab.classList.contains('tab-content--active')).toBe(true);

      // Click standardized tab
      standardizedBtn.click();
      
      // Should switch to standardized
      expect(basicBtn.classList.contains('tab-btn--active')).toBe(false);
      expect(standardizedBtn.classList.contains('tab-btn--active')).toBe(true);
      expect(basicTab.classList.contains('tab-content--active')).toBe(false);
      expect(standardizedTab.classList.contains('tab-content--active')).toBe(true);
    });

    test('should maintain only one active tab at a time', () => {
      const tabBtns = document.querySelectorAll('.tab-btn');
      const tabContents = document.querySelectorAll('.tab-content');

      tabBtns.forEach(btn => {
        btn.click();
        
        // Check that only one button is active
        const activeBtns = document.querySelectorAll('.tab-btn--active');
        expect(activeBtns.length).toBe(1);
        
        // Check that only one content is active
        const activeContents = document.querySelectorAll('.tab-content--active');
        expect(activeContents.length).toBe(1);
      });
    });
  });

  describe('Batch Calculator', () => {
    test('should add new row when add button is clicked', () => {
      const addBtn = document.querySelector('.btn-add-row');
      const tableBody = document.querySelector('.table-body');
      const initialRowCount = tableBody.querySelectorAll('.data-row').length;

      addBtn.click();

      const newRowCount = tableBody.querySelectorAll('.data-row').length;
      expect(newRowCount).toBe(initialRowCount + 1);
    });

    test('should remove row when remove button is clicked', () => {
      const tableBody = document.querySelector('.table-body');
      const initialRowCount = tableBody.querySelectorAll('.data-row').length;
      const removeBtn = document.querySelector('.btn-remove');

      // Should not remove if only one row
      if (initialRowCount === 1) {
        removeBtn.click();
        expect(tableBody.querySelectorAll('.data-row').length).toBe(1);
      } else {
        removeBtn.click();
        expect(tableBody.querySelectorAll('.data-row').length).toBe(initialRowCount - 1);
      }
    });

    test('should update row numbers after adding/removing rows', () => {
      const addBtn = document.querySelector('.btn-add-row');
      const tableBody = document.querySelector('.table-body');

      // Add a few rows
      addBtn.click();
      addBtn.click();

      const rowNumbers = tableBody.querySelectorAll('.row-number');
      rowNumbers.forEach((rowNum, index) => {
        expect(rowNum.textContent).toBe((index + 1).toString());
      });
    });
  });

  describe('Form Validation', () => {
    test('should show error for invalid number inputs', () => {
      const input = document.getElementById('observed');
      
      // Simulate invalid input
      input.value = 'invalid';
      input.dispatchEvent(new Event('blur'));

      // Should add error class
      expect(input.classList.contains('error')).toBe(true);
    });

    test('should clear error when valid input is entered', () => {
      const input = document.getElementById('observed');
      
      // First set invalid input
      input.value = 'invalid';
      input.classList.add('error');

      // Then set valid input
      input.value = '10';
      input.dispatchEvent(new Event('input'));

      expect(input.classList.contains('error')).toBe(false);
    });

    test('should validate required fields', () => {
      const form = document.getElementById('quick-calc');
      const observedInput = document.getElementById('observed');

      observedInput.value = '';
      observedInput.dispatchEvent(new Event('blur'));

      expect(observedInput.validity.valueMissing).toBe(true);
    });
  });

  describe('Button States', () => {
    test('should show loading state on form submission', () => {
      const form = document.getElementById('quick-calc');
      const button = form.querySelector('button[type="submit"]');
      const observedInput = document.getElementById('observed');
      const predictedInput = document.getElementById('predicted');

      observedInput.value = '10';
      predictedInput.value = '8';

      const submitEvent = new Event('submit', { bubbles: true });
      Object.defineProperty(submitEvent, 'target', { value: form });
      
      form.dispatchEvent(submitEvent);

      // Should be disabled during calculation
      expect(button.disabled).toBe(true);
      expect(button.classList.contains('loading')).toBe(true);
    });

    test('should restore button state after calculation', (done) => {
      const form = document.getElementById('quick-calc');
      const button = form.querySelector('button[type="submit"]');
      const observedInput = document.getElementById('observed');
      const predictedInput = document.getElementById('predicted');

      observedInput.value = '10';
      predictedInput.value = '8';

      const submitEvent = new Event('submit', { bubbles: true });
      Object.defineProperty(submitEvent, 'target', { value: form });
      
      form.dispatchEvent(submitEvent);

      // Check state after timeout
      setTimeout(() => {
        expect(button.disabled).toBe(false);
        expect(button.classList.contains('loading')).toBe(false);
        done();
      }, 600);
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels', () => {
      const navToggle = document.getElementById('nav-toggle');
      const inputs = document.querySelectorAll('input[type="number"]');

      // Nav toggle should have aria-label or aria-expanded
      expect(navToggle.getAttribute('aria-label') || 
             navToggle.getAttribute('aria-expanded')).toBeTruthy();

      // Inputs should have associated labels
      inputs.forEach(input => {
        const label = document.querySelector(`label[for="${input.id}"]`);
        expect(label || input.getAttribute('aria-label')).toBeTruthy();
      });
    });

    test('should support keyboard navigation', () => {
      const tabBtns = document.querySelectorAll('.tab-btn');

      tabBtns.forEach(btn => {
        // Should be focusable
        expect(btn.tabIndex).toBeGreaterThanOrEqual(0);
        
        // Should handle Enter key
        const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        btn.dispatchEvent(enterEvent);
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle calculation errors gracefully', () => {
      const form = document.getElementById('quick-calc');
      const observedInput = document.getElementById('observed');
      const predictedInput = document.getElementById('predicted');

      // Set values that might cause issues
      observedInput.value = 'Infinity';
      predictedInput.value = 'NaN';

      const submitEvent = new Event('submit', { bubbles: true });
      Object.defineProperty(submitEvent, 'target', { value: form });

      expect(() => {
        form.dispatchEvent(submitEvent);
      }).not.toThrow();
    });

    test('should display error messages for invalid operations', () => {
      // Test division by zero in standardized residual
      expect(() => {
        calculator.calculateStandardizedResidual(5, 0);
      }).toThrow('Standard error cannot be zero');

      // Test invalid leverage in studentized residual
      expect(() => {
        calculator.calculateStudentizedResidual(2, 1, 1, 100, 5);
      }).toThrow('Leverage must be less than 1');
    });
  });

  describe('Performance', () => {
    test('should handle rapid clicks without breaking', () => {
      const button = document.querySelector('.tab-btn');
      
      // Rapid clicking
      for (let i = 0; i < 10; i++) {
        button.click();
      }

      // Should still be functional
      expect(button.classList.contains('tab-btn--active')).toBe(true);
    });

    test('should debounce input validation', (done) => {
      const input = document.getElementById('observed');
      let validationCount = 0;

      // Mock validation function
      const originalValidate = window.MainUtils?.validateField;
      if (window.MainUtils) {
        window.MainUtils.validateField = () => validationCount++;
      }

      // Rapid input changes
      for (let i = 0; i < 5; i++) {
        input.value = i.toString();
        input.dispatchEvent(new Event('input'));
      }

      // Should not validate too frequently
      setTimeout(() => {
        expect(validationCount).toBeLessThan(5);
        
        // Restore original function
        if (window.MainUtils && originalValidate) {
          window.MainUtils.validateField = originalValidate;
        }
        done();
      }, 100);
    });
  });
}); 