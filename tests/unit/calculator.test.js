/**
 * Calculator Unit Tests
 * Tests all residual calculation methods for accuracy
 */

// Mock DOM environment
document.body.innerHTML = `
  <div id="quick-calc">
    <input id="observed" type="number" />
    <input id="predicted" type="number" />
    <button type="submit">Calculate</button>
  </div>
  <div id="quick-result" style="display: none;">
    <div id="result-calculation"></div>
    <div id="result-value"></div>
  </div>
`;

// Load calculator module
const ResidualCalculator = require('../../assets/js/calculator.js');

describe('ResidualCalculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new ResidualCalculator();
  });

  describe('Basic Residual Calculations', () => {
    test('should calculate basic residual correctly', () => {
      // Test case 1: Positive residual
      expect(calculator.calculateBasicResidual(10, 8)).toBe(2);
      
      // Test case 2: Negative residual
      expect(calculator.calculateBasicResidual(5, 7)).toBe(-2);
      
      // Test case 3: Zero residual
      expect(calculator.calculateBasicResidual(5, 5)).toBe(0);
      
      // Test case 4: Decimal values
      expect(calculator.calculateBasicResidual(10.5, 8.3)).toBeCloseTo(2.2, 1);
      
      // Test case 5: Large numbers
      expect(calculator.calculateBasicResidual(1000000, 999998)).toBe(2);
    });

    test('should handle edge cases for basic residual', () => {
      // Test very small numbers
      expect(calculator.calculateBasicResidual(0.001, 0.0005)).toBeCloseTo(0.0005, 4);
      
      // Test negative numbers
      expect(calculator.calculateBasicResidual(-5, -3)).toBe(-2);
      expect(calculator.calculateBasicResidual(-5, 3)).toBe(-8);
      
      // Test zero cases
      expect(calculator.calculateBasicResidual(0, 0)).toBe(0);
      expect(calculator.calculateBasicResidual(5, 0)).toBe(5);
      expect(calculator.calculateBasicResidual(0, 5)).toBe(-5);
    });
  });

  describe('Standardized Residual Calculations', () => {
    test('should calculate standardized residual correctly', () => {
      // Test case 1: Standard case
      expect(calculator.calculateStandardizedResidual(2, 1)).toBe(2);
      
      // Test case 2: Decimal values
      expect(calculator.calculateStandardizedResidual(3.5, 1.4)).toBeCloseTo(2.5, 1);
      
      // Test case 3: Negative residual
      expect(calculator.calculateStandardizedResidual(-4, 2)).toBe(-2);
      
      // Test case 4: Small standard error
      expect(calculator.calculateStandardizedResidual(1, 0.5)).toBe(2);
    });

    test('should handle edge cases for standardized residual', () => {
      // Test zero residual
      expect(calculator.calculateStandardizedResidual(0, 1)).toBe(0);
      
      // Test should throw error for zero standard error
      expect(() => {
        calculator.calculateStandardizedResidual(5, 0);
      }).toThrow('Standard error cannot be zero');
      
      // Test very small standard error
      expect(calculator.calculateStandardizedResidual(1, 0.001)).toBeCloseTo(1000, 0);
    });
  });

  describe('Studentized Residual Calculations', () => {
    test('should calculate studentized residual correctly', () => {
      // Test case 1: Standard case
      const result1 = calculator.calculateStudentizedResidual(2, 0.1, 1, 100, 5);
      expect(result1).toBeCloseTo(2.11, 1);
      
      // Test case 2: Higher leverage
      const result2 = calculator.calculateStudentizedResidual(2, 0.5, 1, 100, 5);
      expect(result2).toBeCloseTo(2.83, 1);
      
      // Test case 3: Different MSE
      const result3 = calculator.calculateStudentizedResidual(3, 0.2, 2, 50, 3);
      expect(result3).toBeCloseTo(2.37, 1);
    });

    test('should handle edge cases for studentized residual', () => {
      // Test leverage near 1 (should throw error)
      expect(() => {
        calculator.calculateStudentizedResidual(2, 0.99, 1, 100, 5);
      }).toThrow('Leverage must be less than 1');
      
      // Test leverage equal to 1 (should throw error)
      expect(() => {
        calculator.calculateStudentizedResidual(2, 1, 1, 100, 5);
      }).toThrow('Leverage must be less than 1');
      
      // Test zero leverage
      const result = calculator.calculateStudentizedResidual(2, 0, 1, 100, 5);
      expect(result).toBe(2);
      
      // Test zero residual
      expect(calculator.calculateStudentizedResidual(0, 0.1, 1, 100, 5)).toBe(0);
    });
  });

  describe('Statistical Measures', () => {
    test('should calculate residual sum of squares correctly', () => {
      const residuals = [1, -2, 3, -1, 2];
      const rss = calculator.calculateResidualSumOfSquares(residuals);
      expect(rss).toBe(19); // 1² + 4 + 9 + 1 + 4 = 19
    });

    test('should calculate mean squared error correctly', () => {
      const residuals = [2, -4, 6, -2, 4];
      const mse = calculator.calculateMeanSquaredError(residuals, 3);
      expect(mse).toBeCloseTo(23.33, 1); // RSS=68, df=3, MSE=68/3≈22.67
    });

    test('should handle empty residuals array', () => {
      expect(calculator.calculateResidualSumOfSquares([])).toBe(0);
      expect(calculator.calculateMeanSquaredError([], 1)).toBe(0);
    });
  });

  describe('Advanced Calculations', () => {
    test('should handle complex calculation scenarios', () => {
      // Test multiple residuals with different parameters
      const testData = [
        { observed: 10, predicted: 8, expected: 2 },
        { observed: 15, predicted: 12, expected: 3 },
        { observed: 7, predicted: 9, expected: -2 },
        { observed: 20, predicted: 18, expected: 2 },
        { observed: 5, predicted: 6, expected: -1 }
      ];

      testData.forEach((data, index) => {
        const result = calculator.calculateBasicResidual(data.observed, data.predicted);
        expect(result).toBe(data.expected);
      });
    });

    test('should maintain precision with floating point numbers', () => {
      // Test precision issues
      const result1 = calculator.calculateBasicResidual(0.1 + 0.2, 0.3);
      expect(result1).toBeCloseTo(0, 10);
      
      const result2 = calculator.calculateBasicResidual(1.1 + 1.2, 2.3);
      expect(result2).toBeCloseTo(0, 10);
    });

    test('should handle very large numbers', () => {
      const largeNum1 = 1e10;
      const largeNum2 = 1e10 - 1;
      const result = calculator.calculateBasicResidual(largeNum1, largeNum2);
      expect(result).toBe(1);
    });

    test('should handle very small numbers', () => {
      const smallNum1 = 1e-10;
      const smallNum2 = 2e-10;
      const result = calculator.calculateBasicResidual(smallNum1, smallNum2);
      expect(result).toBeCloseTo(-1e-10, 15);
    });
  });

  describe('Summary Statistics', () => {
    test('should calculate correct summary statistics', () => {
      const residuals = [1, -2, 3, 0, -1, 2];
      const stats = calculator.calculateSummaryStatistics(residuals);
      
      expect(stats.count).toBe(6);
      expect(stats.mean).toBeCloseTo(0.5, 1);
      expect(stats.min).toBe(-2);
      expect(stats.max).toBe(3);
      expect(stats.sum).toBe(3);
      expect(stats.sumOfSquares).toBe(19);
      expect(stats.standardDeviation).toBeGreaterThan(0);
    });

    test('should handle single value array', () => {
      const residuals = [5];
      const stats = calculator.calculateSummaryStatistics(residuals);
      
      expect(stats.count).toBe(1);
      expect(stats.mean).toBe(5);
      expect(stats.min).toBe(5);
      expect(stats.max).toBe(5);
      expect(stats.standardDeviation).toBe(0);
    });
  });

  describe('Input Validation', () => {
    test('should handle invalid inputs gracefully', () => {
      // Test NaN inputs
      expect(calculator.calculateBasicResidual(NaN, 5)).toBeNaN();
      expect(calculator.calculateBasicResidual(5, NaN)).toBeNaN();
      
      // Test Infinity inputs
      expect(calculator.calculateBasicResidual(Infinity, 5)).toBe(Infinity);
      expect(calculator.calculateBasicResidual(5, Infinity)).toBe(-Infinity);
    });

    test('should validate parameters correctly', () => {
      // Test negative MSE (should work)
      expect(() => {
        calculator.calculateStudentizedResidual(2, 0.1, -1, 100, 5);
      }).not.toThrow();
      
      // Test negative sample size (edge case)
      expect(() => {
        calculator.calculateStudentizedResidual(2, 0.1, 1, -100, 5);
      }).not.toThrow();
    });
  });

  describe('Performance Tests', () => {
    test('should handle large datasets efficiently', () => {
      const largeArray = Array.from({ length: 10000 }, (_, i) => Math.sin(i));
      
      const startTime = performance.now();
      const rss = calculator.calculateResidualSumOfSquares(largeArray);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should complete in < 100ms
      expect(rss).toBeGreaterThan(0);
    });

    test('should maintain accuracy with repeated calculations', () => {
      // Test calculation stability
      for (let i = 0; i < 1000; i++) {
        const result = calculator.calculateBasicResidual(10, 7);
        expect(result).toBe(3);
      }
    });
  });
}); 