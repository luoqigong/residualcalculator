// Residual Calculator JavaScript
class ResidualCalculator {
    constructor() {
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.initializeCalculators();
    }
    
    /**
     * Bind event listeners
     */
    bindEvents() {
        // Quick calculator form on homepage
        const quickCalcForm = document.getElementById('quick-calc');
        if (quickCalcForm) {
            quickCalcForm.addEventListener('submit', this.handleQuickCalculation.bind(this));
        }
        
        // Advanced calculator forms
        const advancedForms = document.querySelectorAll('.advanced-calculator-form');
        advancedForms.forEach(form => {
            form.addEventListener('submit', this.handleAdvancedCalculation.bind(this));
        });
        
        // Batch calculator
        const batchForm = document.getElementById('batch-calc');
        if (batchForm) {
            batchForm.addEventListener('submit', this.handleBatchCalculation.bind(this));
        }
        
        // Clear buttons
        const clearButtons = document.querySelectorAll('.btn-clear');
        clearButtons.forEach(button => {
            button.addEventListener('click', this.clearResults.bind(this));
        });
        
        // Copy result buttons
        const copyButtons = document.querySelectorAll('.btn-copy-result');
        copyButtons.forEach(button => {
            button.addEventListener('click', this.copyResult.bind(this));
        });
    }
    
    /**
     * Initialize calculator features
     */
    initializeCalculators() {
        // Add dynamic rows for batch calculator
        this.initBatchCalculator();
        
        // Initialize calculator type switcher
        this.initCalculatorTypeSwitcher();
    }
    
    /**
     * Handle quick calculation (basic residual)
     */
    handleQuickCalculation(event) {
        event.preventDefault();
        
        const form = event.target;
        const button = form.querySelector('button[type="submit"]');
        const observedInput = document.getElementById('observed');
        const predictedInput = document.getElementById('predicted');
        const resultDiv = document.getElementById('quick-result');
        
        // Get input values
        const observed = parseFloat(observedInput.value);
        const predicted = parseFloat(predictedInput.value);
        
        // Validate inputs
        if (isNaN(observed) || isNaN(predicted)) {
            window.MainUtils.showNotification('Please enter valid numbers for both fields.', 'error');
            return;
        }
        
        // Show loading state
        window.MainUtils.showButtonLoading(button, 'Calculating...');
        
        // Calculate residual
        const residual = this.calculateBasicResidual(observed, predicted);
        
        // Display result
        setTimeout(() => {
            this.displayQuickResult(observed, predicted, residual);
            resultDiv.style.display = 'block';
            resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            window.MainUtils.hideButtonLoading(button);
        }, 500);
    }
    
    /**
     * Handle advanced calculation
     */
    handleAdvancedCalculation(event) {
        event.preventDefault();
        
        const form = event.target;
        const button = form.querySelector('button[type="submit"]');
        const calculationType = form.dataset.calculationType || 'basic';
        
        window.MainUtils.showButtonLoading(button, 'Calculating...');
        
        try {
            const result = this.performAdvancedCalculation(form, calculationType);
            this.displayAdvancedResult(result, calculationType);
            window.MainUtils.showNotification('Calculation completed successfully!', 'success');
        } catch (error) {
            console.error('Calculation error:', error);
            window.MainUtils.showNotification('Error in calculation: ' + error.message, 'error');
        } finally {
            window.MainUtils.hideButtonLoading(button);
        }
    }
    
    /**
     * Handle batch calculation
     */
    handleBatchCalculation(event) {
        event.preventDefault();
        
        const form = event.target;
        const button = form.querySelector('button[type="submit"]');
        const dataRows = form.querySelectorAll('.data-row');
        
        const data = [];
        let hasError = false;
        
        // Collect data from all rows
        dataRows.forEach((row, index) => {
            const observed = parseFloat(row.querySelector('.observed-input').value);
            const predicted = parseFloat(row.querySelector('.predicted-input').value);
            
            if (!isNaN(observed) && !isNaN(predicted)) {
                data.push({ observed, predicted, index: index + 1 });
            } else if (row.querySelector('.observed-input').value || row.querySelector('.predicted-input').value) {
                hasError = true;
                window.MainUtils.showNotification(`Invalid data in row ${index + 1}`, 'error');
            }
        });
        
        if (hasError) return;
        
        if (data.length === 0) {
            window.MainUtils.showNotification('Please enter at least one pair of values.', 'error');
            return;
        }
        
        window.MainUtils.showButtonLoading(button, 'Processing...');
        
        // Perform batch calculation
        setTimeout(() => {
            try {
                const results = this.performBatchCalculation(data);
                this.displayBatchResults(results);
                window.MainUtils.showNotification(`Successfully calculated ${results.length} residuals.`, 'success');
            } catch (error) {
                console.error('Batch calculation error:', error);
                window.MainUtils.showNotification('Error in batch calculation: ' + error.message, 'error');
            } finally {
                window.MainUtils.hideButtonLoading(button);
            }
        }, 800);
    }
    
    /**
     * Calculate basic residual
     */
    calculateBasicResidual(observed, predicted) {
        return observed - predicted;
    }
    
    /**
     * Calculate standardized residual
     */
    calculateStandardizedResidual(residual, standardError) {
        if (standardError === 0) {
            throw new Error('Standard error cannot be zero');
        }
        return residual / standardError;
    }
    
    /**
     * Calculate studentized residual
     */
    calculateStudentizedResidual(residual, leverage, mse, n, p) {
        if (leverage >= 1) {
            throw new Error('Leverage must be less than 1');
        }
        
        const standardError = Math.sqrt(mse * (1 - leverage));
        if (standardError === 0) {
            throw new Error('Standard error cannot be zero');
        }
        
        return residual / standardError;
    }
    
    /**
     * Calculate residual sum of squares
     */
    calculateResidualSumOfSquares(residuals) {
        return residuals.reduce((sum, residual) => sum + (residual * residual), 0);
    }
    
    /**
     * Calculate mean squared error
     */
    calculateMeanSquaredError(residuals, degreesOfFreedom) {
        const rss = this.calculateResidualSumOfSquares(residuals);
        return rss / degreesOfFreedom;
    }
    
    /**
     * Perform advanced calculation based on type
     */
    performAdvancedCalculation(form, type) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        switch (type) {
            case 'basic':
                return this.calculateAdvancedBasic(data);
            case 'standardized':
                return this.calculateAdvancedStandardized(data);
            case 'studentized':
                return this.calculateAdvancedStudentized(data);
            case 'deleted':
                return this.calculateAdvancedDeleted(data);
            default:
                throw new Error('Unknown calculation type');
        }
    }
    
    /**
     * Calculate advanced basic residuals
     */
    calculateAdvancedBasic(data) {
        const observed = parseFloat(data.observed);
        const predicted = parseFloat(data.predicted);
        
        if (isNaN(observed) || isNaN(predicted)) {
            throw new Error('Invalid input values');
        }
        
        const residual = this.calculateBasicResidual(observed, predicted);
        
        return {
            type: 'Basic Residual',
            observed,
            predicted,
            residual,
            formula: 'e = y - ŷ',
            calculation: `${observed} - ${predicted} = ${residual}`,
            interpretation: this.getResidualInterpretation(residual, 'basic')
        };
    }
    
    /**
     * Calculate advanced standardized residuals
     */
    calculateAdvancedStandardized(data) {
        const observed = parseFloat(data.observed);
        const predicted = parseFloat(data.predicted);
        const standardError = parseFloat(data.standardError);
        
        if (isNaN(observed) || isNaN(predicted) || isNaN(standardError)) {
            throw new Error('Invalid input values');
        }
        
        const residual = this.calculateBasicResidual(observed, predicted);
        const standardizedResidual = this.calculateStandardizedResidual(residual, standardError);
        
        return {
            type: 'Standardized Residual',
            observed,
            predicted,
            residual,
            standardError,
            standardizedResidual,
            formula: 'r = e / SE',
            calculation: `${residual} / ${standardError} = ${standardizedResidual}`,
            interpretation: this.getResidualInterpretation(standardizedResidual, 'standardized')
        };
    }
    
    /**
     * Calculate advanced studentized residuals
     */
    calculateAdvancedStudentized(data) {
        const observed = parseFloat(data.observed);
        const predicted = parseFloat(data.predicted);
        const leverage = parseFloat(data.leverage);
        const mse = parseFloat(data.mse);
        const n = parseInt(data.n) || 10;
        const p = parseInt(data.p) || 2;
        
        if (isNaN(observed) || isNaN(predicted) || isNaN(leverage) || isNaN(mse)) {
            throw new Error('Invalid input values');
        }
        
        const residual = this.calculateBasicResidual(observed, predicted);
        const studentizedResidual = this.calculateStudentizedResidual(residual, leverage, mse, n, p);
        
        return {
            type: 'Studentized Residual',
            observed,
            predicted,
            residual,
            leverage,
            mse,
            studentizedResidual,
            formula: 't = e / (s√(1-h))',
            calculation: `${residual} / (√${mse} × √(1-${leverage})) = ${studentizedResidual}`,
            interpretation: this.getResidualInterpretation(studentizedResidual, 'studentized')
        };
    }
    
    /**
     * Perform batch calculation
     */
    performBatchCalculation(data) {
        return data.map(item => {
            const residual = this.calculateBasicResidual(item.observed, item.predicted);
            return {
                ...item,
                residual,
                absoluteResidual: Math.abs(residual),
                squaredResidual: residual * residual
            };
        });
    }
    
    /**
     * Display quick calculation result
     */
    displayQuickResult(observed, predicted, residual) {
        const calculationElement = document.getElementById('result-calculation');
        const valueElement = document.getElementById('result-value');
        
        if (calculationElement) {
            calculationElement.textContent = `${observed} - ${predicted} = ${residual}`;
        }
        
        if (valueElement) {
            valueElement.textContent = `Residual = ${window.MainUtils.formatNumber(residual)}`;
        }
    }
    
    /**
     * Display advanced calculation result
     */
    displayAdvancedResult(result, type) {
        const resultContainer = document.getElementById(`${type}-result`);
        if (!resultContainer) return;
        
        resultContainer.innerHTML = `
            <div class="result">
                <h3 class="result__title">${result.type}</h3>
                <div class="result__content">
                    <div class="result__formula">
                        <strong>Formula:</strong> ${result.formula}
                    </div>
                    <div class="result__calculation">
                        <strong>Calculation:</strong> ${result.calculation}
                    </div>
                    <div class="result__value">
                        <strong>Result:</strong> ${window.MainUtils.formatNumber(result[Object.keys(result).find(key => key.includes('Residual'))])}
                    </div>
                    <div class="result__interpretation">
                        <strong>Interpretation:</strong> ${result.interpretation}
                    </div>
                    <button class="btn btn-copy-result" data-result="${result[Object.keys(result).find(key => key.includes('Residual'))]}">
                        Copy Result
                    </button>
                </div>
            </div>
        `;
        
        resultContainer.style.display = 'block';
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Rebind copy button event
        const copyButton = resultContainer.querySelector('.btn-copy-result');
        if (copyButton) {
            copyButton.addEventListener('click', this.copyResult.bind(this));
        }
    }
    
    /**
     * Display batch calculation results
     */
    displayBatchResults(results) {
        const resultContainer = document.getElementById('batch-results');
        if (!resultContainer) return;
        
        // Calculate summary statistics
        const residuals = results.map(r => r.residual);
        const statistics = this.calculateSummaryStatistics(residuals);
        
        let tableHTML = `
            <div class="result">
                <h3 class="result__title">Batch Calculation Results</h3>
                
                <div class="summary-stats">
                    <h4>Summary Statistics</h4>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <span class="stat-label">Count:</span>
                            <span class="stat-value">${statistics.count}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Mean:</span>
                            <span class="stat-value">${window.MainUtils.formatNumber(statistics.mean)}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Std Dev:</span>
                            <span class="stat-value">${window.MainUtils.formatNumber(statistics.stdDev)}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">RSS:</span>
                            <span class="stat-value">${window.MainUtils.formatNumber(statistics.rss)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="table-container">
                    <table class="results-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Observed</th>
                                <th>Predicted</th>
                                <th>Residual</th>
                                <th>|Residual|</th>
                                <th>Residual²</th>
                            </tr>
                        </thead>
                        <tbody>
        `;
        
        results.forEach(result => {
            tableHTML += `
                <tr>
                    <td>${result.index}</td>
                    <td>${window.MainUtils.formatNumber(result.observed)}</td>
                    <td>${window.MainUtils.formatNumber(result.predicted)}</td>
                    <td>${window.MainUtils.formatNumber(result.residual)}</td>
                    <td>${window.MainUtils.formatNumber(result.absoluteResidual)}</td>
                    <td>${window.MainUtils.formatNumber(result.squaredResidual)}</td>
                </tr>
            `;
        });
        
        tableHTML += `
                        </tbody>
                    </table>
                </div>
                
                <div class="result-actions">
                    <button class="btn btn--primary" onclick="window.ResidualCalc.exportResults('csv')">
                        Export as CSV
                    </button>
                    <button class="btn" onclick="window.ResidualCalc.exportResults('json')">
                        Export as JSON
                    </button>
                </div>
            </div>
        `;
        
        resultContainer.innerHTML = tableHTML;
        resultContainer.style.display = 'block';
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Store results for export
        this.lastBatchResults = results;
        this.lastStatistics = statistics;
    }
    
    /**
     * Calculate summary statistics
     */
    calculateSummaryStatistics(residuals) {
        const count = residuals.length;
        const sum = residuals.reduce((a, b) => a + b, 0);
        const mean = sum / count;
        
        const variance = residuals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / count;
        const stdDev = Math.sqrt(variance);
        
        const rss = this.calculateResidualSumOfSquares(residuals);
        
        return {
            count,
            sum,
            mean,
            variance,
            stdDev,
            rss,
            min: Math.min(...residuals),
            max: Math.max(...residuals)
        };
    }
    
    /**
     * Get residual interpretation
     */
    getResidualInterpretation(residual, type) {
        const absResidual = Math.abs(residual);
        
        switch (type) {
            case 'basic':
                if (absResidual < 1) return 'Small residual - good fit';
                if (absResidual < 2) return 'Moderate residual - acceptable fit';
                return 'Large residual - poor fit or potential outlier';
                
            case 'standardized':
                if (absResidual < 2) return 'Normal residual - within 2 standard deviations';
                if (absResidual < 3) return 'Large residual - requires attention';
                return 'Very large residual - likely outlier';
                
            case 'studentized':
                if (absResidual < 2) return 'Normal residual - acceptable';
                if (absResidual < 3) return 'Large residual - potential outlier';
                return 'Very large residual - significant outlier';
                
            default:
                return 'Residual calculated successfully';
        }
    }
    
    /**
     * Initialize batch calculator
     */
    initBatchCalculator() {
        const addRowButton = document.getElementById('add-row');
        const removeRowButtons = document.querySelectorAll('.remove-row');
        
        if (addRowButton) {
            addRowButton.addEventListener('click', this.addBatchRow.bind(this));
        }
        
        removeRowButtons.forEach(button => {
            button.addEventListener('click', this.removeBatchRow.bind(this));
        });
    }
    
    /**
     * Add row to batch calculator
     */
    addBatchRow() {
        const container = document.getElementById('batch-data-container');
        if (!container) return;
        
        const rowCount = container.children.length + 1;
        const newRow = document.createElement('div');
        newRow.className = 'data-row';
        newRow.innerHTML = `
            <span class="row-number">${rowCount}</span>
            <input type="number" class="form-input observed-input" placeholder="Observed" step="any" required>
            <input type="number" class="form-input predicted-input" placeholder="Predicted" step="any" required>
            <button type="button" class="btn-remove remove-row" aria-label="Remove row">×</button>
        `;
        
        container.appendChild(newRow);
        
        // Bind remove button event
        const removeButton = newRow.querySelector('.remove-row');
        removeButton.addEventListener('click', this.removeBatchRow.bind(this));
        
        this.updateRowNumbers();
    }
    
    /**
     * Remove row from batch calculator
     */
    removeBatchRow(event) {
        const row = event.target.closest('.data-row');
        if (row) {
            row.remove();
            this.updateRowNumbers();
        }
    }
    
    /**
     * Update row numbers
     */
    updateRowNumbers() {
        const rows = document.querySelectorAll('.data-row');
        rows.forEach((row, index) => {
            const numberSpan = row.querySelector('.row-number');
            if (numberSpan) {
                numberSpan.textContent = index + 1;
            }
        });
    }
    
    /**
     * Initialize calculator type switcher
     */
    initCalculatorTypeSwitcher() {
        const typeSwitcher = document.getElementById('calc-type-switcher');
        if (typeSwitcher) {
            typeSwitcher.addEventListener('change', this.switchCalculatorType.bind(this));
        }
    }
    
    /**
     * Switch calculator type
     */
    switchCalculatorType(event) {
        const selectedType = event.target.value;
        const calculatorForms = document.querySelectorAll('.calculator-type-form');
        
        calculatorForms.forEach(form => {
            if (form.dataset.calculationType === selectedType) {
                form.style.display = 'block';
            } else {
                form.style.display = 'none';
            }
        });
    }
    
    /**
     * Clear all results
     */
    clearResults() {
        const resultContainers = document.querySelectorAll('[id$="-result"]');
        resultContainers.forEach(container => {
            container.innerHTML = '';
            container.style.display = 'none';
        });
        
        window.MainUtils.showNotification('Results cleared.', 'info');
    }
    
    /**
     * Copy result to clipboard
     */
    async copyResult(event) {
        const button = event.target;
        const result = button.dataset.result;
        
        if (result) {
            const success = await window.MainUtils.copyToClipboard(result);
            if (success) {
                window.MainUtils.showNotification('Result copied to clipboard!', 'success');
            } else {
                window.MainUtils.showNotification('Failed to copy result.', 'error');
            }
        }
    }
    
    /**
     * Export results
     */
    exportResults(format) {
        if (!this.lastBatchResults) {
            window.MainUtils.showNotification('No results to export.', 'error');
            return;
        }
        
        let content, filename, mimeType;
        
        if (format === 'csv') {
            content = this.generateCSV(this.lastBatchResults);
            filename = 'residual_results.csv';
            mimeType = 'text/csv';
        } else if (format === 'json') {
            content = JSON.stringify({
                results: this.lastBatchResults,
                statistics: this.lastStatistics
            }, null, 2);
            filename = 'residual_results.json';
            mimeType = 'application/json';
        }
        
        this.downloadFile(content, filename, mimeType);
        window.MainUtils.showNotification(`Results exported as ${format.toUpperCase()}!`, 'success');
    }
    
    /**
     * Generate CSV content
     */
    generateCSV(results) {
        const headers = ['Index', 'Observed', 'Predicted', 'Residual', 'Absolute_Residual', 'Squared_Residual'];
        const rows = results.map(r => [
            r.index,
            r.observed,
            r.predicted,
            r.residual,
            r.absoluteResidual,
            r.squaredResidual
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
    
    /**
     * Download file
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.ResidualCalc = new ResidualCalculator();
});

// Export for Node.js testing environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ResidualCalculator;
} 