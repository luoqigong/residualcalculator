/**
 * Calculator Core Tests
 * Tests only the core calculation methods without UI dependencies
 */

const ResidualCalculator = require('../../assets/js/calculator.js');

describe('ResidualCalculator Core Functions', () => {
  let calculator;

  beforeEach(() => {
    // Mock DOM and MainUtils to avoid dependencies
    global.document = {
      getElementById: jest.fn(() => null),
      querySelectorAll: jest.fn(() => []),
      addEventListener: jest.fn()
    };
    
    global.window = {
      MainUtils: {
        showNotification: jest.fn(),
        showButtonLoading: jest.fn(),
        hideButtonLoading: jest.fn(),
        formatNumber: jest.fn(num => num.toString())
      }
    };
    
    calculator = new ResidualCalculator();
  });

  describe('Basic Residual Calculations', () => {
    test('should calculate basic residual correctly', () => {
      expect(calculator.calculateBasicResidual(10, 8)).toBe(2);
      expect(calculator.calculateBasicResidual(5, 7)).toBe(-2);
      expect(calculator.calculateBasicResidual(5, 5)).toBe(0);
      expect(calculator.calculateBasicResidual(10.5, 8.3)).toBeCloseTo(2.2, 1);
    });

    test('should handle edge cases', () => {
      expect(calculator.calculateBasicResidual(0, 0)).toBe(0);
      expect(calculator.calculateBasicResidual(-5, -3)).toBe(-2);
      expect(calculator.calculateBasicResidual(1000000, 999998)).toBe(2);
    });

    test('should handle floating point precision', () => {
      const result = calculator.calculateBasicResidual(0.1 + 0.2, 0.3);
      expect(result).toBeCloseTo(0, 10);
    });
  });

  describe('Standardized Residual Calculations', () => {
    test('should calculate standardized residual correctly', () => {
      expect(calculator.calculateStandardizedResidual(2, 1)).toBe(2);
      expect(calculator.calculateStandardizedResidual(3.5, 1.4)).toBeCloseTo(2.5, 1);
      expect(calculator.calculateStandardizedResidual(-4, 2)).toBe(-2);
      expect(calculator.calculateStandardizedResidual(0, 1)).toBe(0);
    });

    test('should throw error for zero standard error', () => {
      expect(() => {
        calculator.calculateStandardizedResidual(5, 0);
      }).toThrow('Standard error cannot be zero');
    });

    test('should handle very small standard error', () => {
      expect(calculator.calculateStandardizedResidual(1, 0.001)).toBeCloseTo(1000, 0);
    });
  });

  describe('Studentized Residual Calculations', () => {
    test('should calculate studentized residual correctly', () => {
      const result1 = calculator.calculateStudentizedResidual(2, 0.1, 1, 100, 5);
      expect(result1).toBeCloseTo(2.11, 1);
      
      const result2 = calculator.calculateStudentizedResidual(2, 0.5, 1, 100, 5);
      expect(result2).toBeCloseTo(2.83, 1);
    });

    test('should throw error for invalid leverage', () => {
      expect(() => {
        calculator.calculateStudentizedResidual(2, 1, 1, 100, 5);
      }).toThrow('Leverage must be less than 1');
      
      expect(() => {
        calculator.calculateStudentizedResidual(2, 1.5, 1, 100, 5);
      }).toThrow('Leverage must be less than 1');
    });

    test('should handle zero leverage', () => {
      const result = calculator.calculateStudentizedResidual(2, 0, 1, 100, 5);
      expect(result).toBe(2);
    });

    test('should handle zero residual', () => {
      expect(calculator.calculateStudentizedResidual(0, 0.1, 1, 100, 5)).toBe(0);
    });
  });

  describe('Statistical Measures', () => {
    test('should calculate residual sum of squares', () => {
      const residuals = [1, -2, 3, -1, 2];
      const rss = calculator.calculateResidualSumOfSquares(residuals);
      expect(rss).toBe(19); // 1² + 4 + 9 + 1 + 4 = 19
    });

    test('should calculate mean squared error', () => {
      const residuals = [2, -4, 6, -2, 4];
      const mse = calculator.calculateMeanSquaredError(residuals, 3);
      // RSS = 4+16+36+4+16 = 76, MSE = 76/3 ≈ 25.33
      expect(mse).toBeCloseTo(25.33, 1);
    });

    test('should handle empty arrays', () => {
      expect(calculator.calculateResidualSumOfSquares([])).toBe(0);
      expect(calculator.calculateMeanSquaredError([], 1)).toBe(0);
    });

    test('should calculate summary statistics', () => {
      const residuals = [1, -2, 3, 0, -1, 2];
      const stats = calculator.calculateSummaryStatistics(residuals);
      
      expect(stats.count).toBe(6);
      expect(stats.mean).toBeCloseTo(0.5, 1);
      expect(stats.min).toBe(-2);
      expect(stats.max).toBe(3);
      expect(stats.sum).toBe(3);
      expect(stats.rss).toBeCloseTo(19, 0);
      expect(stats.stdDev).toBeGreaterThan(0);
    });
  });

  describe('Advanced Scenarios', () => {
    test('should handle multiple calculations consistently', () => {
      for (let i = 0; i < 100; i++) {
        const result = calculator.calculateBasicResidual(10, 7);
        expect(result).toBe(3);
      }
    });

    test('should handle extreme values', () => {
      // Very large numbers
      expect(calculator.calculateBasicResidual(1e10, 1e10 - 1)).toBe(1);
      
      // Very small numbers
      const smallResult = calculator.calculateBasicResidual(1e-10, 2e-10);
      expect(smallResult).toBeCloseTo(-1e-10, 15);
      
      // Mixed large and small
      expect(calculator.calculateBasicResidual(1e6, 1e-6)).toBeCloseTo(1e6, 0);
    });

    test('should handle NaN and Infinity gracefully', () => {
      expect(calculator.calculateBasicResidual(NaN, 5)).toBeNaN();
      expect(calculator.calculateBasicResidual(5, NaN)).toBeNaN();
      expect(calculator.calculateBasicResidual(Infinity, 5)).toBe(Infinity);
      expect(calculator.calculateBasicResidual(5, Infinity)).toBe(-Infinity);
    });
  });

  describe('Batch Operations', () => {
    test('should handle batch calculations', () => {
      const data = [
        { observed: 10, predicted: 8 },
        { observed: 15, predicted: 12 },
        { observed: 7, predicted: 9 },
        { observed: 20, predicted: 18 },
        { observed: 5, predicted: 6 }
      ];

      const results = calculator.performBatchCalculation(data);
      expect(results).toHaveLength(5);
      
      expect(results[0].residual).toBe(2);
      expect(results[1].residual).toBe(3);
      expect(results[2].residual).toBe(-2);
      expect(results[3].residual).toBe(2);
      expect(results[4].residual).toBe(-1);
    });

    test('should calculate correct summary for batch', () => {
      const data = [
        { observed: 10, predicted: 8 },
        { observed: 12, predicted: 10 },
        { observed: 14, predicted: 12 }
      ];

      const results = calculator.performBatchCalculation(data);
      const residuals = results.map(r => r.residual);
      
      expect(residuals).toEqual([2, 2, 2]);
      
      const rss = calculator.calculateResidualSumOfSquares(residuals);
      expect(rss).toBe(12); // 3 * 2² = 12
    });
  });

  describe('Performance', () => {
    test('should handle large datasets efficiently', () => {
      const largeArray = Array.from({ length: 1000 }, (_, i) => i * 0.1);
      
      const startTime = Date.now();
      const rss = calculator.calculateResidualSumOfSquares(largeArray);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should complete quickly
      expect(rss).toBeGreaterThan(0);
    });

    test('should maintain precision in calculations', () => {
      // Test precision with many decimal places
      const observed = 123.456789123456;
      const predicted = 123.456789123455;
      const result = calculator.calculateBasicResidual(observed, predicted);
      
      expect(result).toBeCloseTo(0.000000000001, 12);
    });
  });
}); 