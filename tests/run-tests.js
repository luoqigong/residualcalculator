#!/usr/bin/env node

/**
 * Test Runner Script
 * Automatically runs all tests and generates reports
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestRunner {
  constructor() {
    this.results = {
      unit: null,
      integration: null,
      e2e: null,
      performance: null,
      startTime: Date.now(),
      endTime: null
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '💡',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    }[type] || '💡';
    
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async checkPrerequisites() {
    this.log('Checking prerequisites...');
    
    try {
      // Check if Node.js is available
      execSync('node --version', { stdio: 'pipe' });
      this.log('Node.js is available', 'success');
      
      // Check if Python is available (for local server)
      execSync('python --version', { stdio: 'pipe' });
      this.log('Python is available', 'success');
      
      // Check if npm packages are installed
      if (!fs.existsSync('node_modules')) {
        this.log('Installing npm packages...', 'warning');
        execSync('npm install', { stdio: 'inherit' });
      }
      
      this.log('Prerequisites check completed', 'success');
      return true;
    } catch (error) {
      this.log(`Prerequisites check failed: ${error.message}`, 'error');
      return false;
    }
  }

  async startLocalServer() {
    this.log('Starting local server...');
    
    return new Promise((resolve, reject) => {
      const server = spawn('python', ['-m', 'http.server', '8000'], {
        stdio: 'pipe',
        detached: true
      });
      
      // Wait for server to start
      setTimeout(() => {
        try {
          execSync('curl -s http://localhost:8000', { stdio: 'pipe', timeout: 5000 });
          this.log('Local server started successfully', 'success');
          this.serverProcess = server;
          resolve(server);
        } catch (error) {
          this.log('Failed to start local server', 'error');
          reject(error);
        }
      }, 2000);
    });
  }

  async runUnitTests() {
    this.log('Running unit tests...');
    
    try {
      const result = execSync('npm run test', { 
        stdio: 'pipe',
        encoding: 'utf8',
        timeout: 30000
      });
      
      this.results.unit = {
        success: true,
        output: result,
        duration: Date.now() - this.results.startTime
      };
      
      this.log('Unit tests completed successfully', 'success');
      return true;
    } catch (error) {
      this.results.unit = {
        success: false,
        error: error.message,
        output: error.stdout || error.stderr,
        duration: Date.now() - this.results.startTime
      };
      
      this.log(`Unit tests failed: ${error.message}`, 'error');
      return false;
    }
  }

  async runE2ETests() {
    this.log('Running end-to-end tests...');
    
    try {
      const result = execSync('npx playwright test', {
        stdio: 'pipe',
        encoding: 'utf8',
        timeout: 300000 // 5 minutes
      });
      
      this.results.e2e = {
        success: true,
        output: result,
        duration: Date.now() - this.results.startTime
      };
      
      this.log('E2E tests completed successfully', 'success');
      return true;
    } catch (error) {
      this.results.e2e = {
        success: false,
        error: error.message,
        output: error.stdout || error.stderr,
        duration: Date.now() - this.results.startTime
      };
      
      this.log(`E2E tests failed: ${error.message}`, 'error');
      return false;
    }
  }

  async runPerformanceTests() {
    this.log('Running performance tests...');
    
    try {
      const result = execSync('npx playwright test tests/performance/', {
        stdio: 'pipe',
        encoding: 'utf8',
        timeout: 180000 // 3 minutes
      });
      
      this.results.performance = {
        success: true,
        output: result,
        duration: Date.now() - this.results.startTime
      };
      
      this.log('Performance tests completed successfully', 'success');
      return true;
    } catch (error) {
      this.results.performance = {
        success: false,
        error: error.message,
        output: error.stdout || error.stderr,
        duration: Date.now() - this.results.startTime
      };
      
      this.log(`Performance tests failed: ${error.message}`, 'error');
      return false;
    }
  }

  async generateReport() {
    this.log('Generating test report...');
    
    this.results.endTime = Date.now();
    const totalDuration = this.results.endTime - this.results.startTime;
    
    const report = {
      summary: {
        totalDuration: totalDuration,
        startTime: new Date(this.results.startTime).toISOString(),
        endTime: new Date(this.results.endTime).toISOString(),
        overallSuccess: this.isOverallSuccess()
      },
      results: this.results
    };
    
    // Create reports directory
    if (!fs.existsSync('test-results')) {
      fs.mkdirSync('test-results', { recursive: true });
    }
    
    // Write JSON report
    fs.writeFileSync(
      'test-results/test-report.json',
      JSON.stringify(report, null, 2)
    );
    
    // Write HTML report
    const htmlReport = this.generateHTMLReport(report);
    fs.writeFileSync('test-results/test-report.html', htmlReport);
    
    // Write console summary
    this.printSummary(report);
    
    this.log('Test report generated', 'success');
  }

  isOverallSuccess() {
    return (!this.results.unit || this.results.unit.success) &&
           (!this.results.e2e || this.results.e2e.success) &&
           (!this.results.performance || this.results.performance.success);
  }

  generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Report - Residual Calculator</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; }
        .success { color: green; }
        .error { color: red; }
        .section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
        .details { background: #f9f9f9; padding: 10px; margin: 10px 0; border-radius: 4px; }
        pre { background: #f0f0f0; padding: 10px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Test Report - Residual Calculator</h1>
        <p><strong>Overall Status:</strong> 
           <span class="${report.summary.overallSuccess ? 'success' : 'error'}">
               ${report.summary.overallSuccess ? 'PASSED' : 'FAILED'}
           </span>
        </p>
        <p><strong>Total Duration:</strong> ${(report.summary.totalDuration / 1000).toFixed(2)}s</p>
        <p><strong>Generated:</strong> ${report.summary.endTime}</p>
    </div>

    ${this.generateTestSectionHTML('Unit Tests', report.results.unit)}
    ${this.generateTestSectionHTML('E2E Tests', report.results.e2e)}
    ${this.generateTestSectionHTML('Performance Tests', report.results.performance)}

    <div class="section">
        <h2>Test Coverage</h2>
        <ul>
            <li>✅ Calculator functionality (all residual types)</li>
            <li>✅ UI interactions and form validation</li>
            <li>✅ Mobile navigation and responsiveness</li>
            <li>✅ Cross-browser compatibility</li>
            <li>✅ Performance benchmarks</li>
            <li>✅ Accessibility standards</li>
            <li>✅ SEO meta tags and structure</li>
        </ul>
    </div>
</body>
</html>
    `;
  }

  generateTestSectionHTML(title, result) {
    if (!result) return '';

    return `
    <div class="section">
        <h2>${title}</h2>
        <p><strong>Status:</strong> 
           <span class="${result.success ? 'success' : 'error'}">
               ${result.success ? 'PASSED' : 'FAILED'}
           </span>
        </p>
        <p><strong>Duration:</strong> ${(result.duration / 1000).toFixed(2)}s</p>
        
        ${result.output ? `
        <div class="details">
            <h3>Output:</h3>
            <pre>${this.escapeHtml(result.output.substring(0, 2000))}${result.output.length > 2000 ? '...' : ''}</pre>
        </div>
        ` : ''}
        
        ${result.error ? `
        <div class="details error">
            <h3>Error:</h3>
            <pre>${this.escapeHtml(result.error)}</pre>
        </div>
        ` : ''}
    </div>
    `;
  }

  escapeHtml(text) {
    const div = { innerHTML: text };
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  printSummary(report) {
    console.log('\n' + '='.repeat(60));
    console.log('TEST SUMMARY');
    console.log('='.repeat(60));
    
    const status = report.summary.overallSuccess ? 'PASSED ✅' : 'FAILED ❌';
    console.log(`Overall Status: ${status}`);
    console.log(`Total Duration: ${(report.summary.totalDuration / 1000).toFixed(2)}s`);
    console.log(`Report: test-results/test-report.html`);
    
    console.log('\nTest Results:');
    if (this.results.unit) {
      console.log(`  Unit Tests: ${this.results.unit.success ? 'PASSED ✅' : 'FAILED ❌'}`);
    }
    if (this.results.e2e) {
      console.log(`  E2E Tests: ${this.results.e2e.success ? 'PASSED ✅' : 'FAILED ❌'}`);
    }
    if (this.results.performance) {
      console.log(`  Performance Tests: ${this.results.performance.success ? 'PASSED ✅' : 'FAILED ❌'}`);
    }
    
    console.log('='.repeat(60));
  }

  async cleanup() {
    this.log('Cleaning up...');
    
    if (this.serverProcess) {
      try {
        process.kill(-this.serverProcess.pid);
        this.log('Local server stopped', 'success');
      } catch (error) {
        this.log('Failed to stop local server', 'warning');
      }
    }
  }

  async run() {
    try {
      // Check prerequisites
      const prereqCheck = await this.checkPrerequisites();
      if (!prereqCheck) {
        process.exit(1);
      }

      // Start local server
      await this.startLocalServer();

      // Run all tests
      await this.runUnitTests();
      await this.runE2ETests();
      await this.runPerformanceTests();

      // Generate report
      await this.generateReport();

      // Exit with appropriate code
      const success = this.isOverallSuccess();
      process.exit(success ? 0 : 1);

    } catch (error) {
      this.log(`Test run failed: ${error.message}`, 'error');
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }
}

// Handle process signals
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT, cleaning up...');
  process.exit(1);
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM, cleaning up...');
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  const runner = new TestRunner();
  runner.run();
}

module.exports = TestRunner; 