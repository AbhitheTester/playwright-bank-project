const fs = require('fs');
const path = require('path');
const reporter = require('multiple-cucumber-html-reporter');

const rootDir = path.resolve(__dirname, '..');
const reportsDir = path.join(rootDir, 'osttra-framework', 'reports');
const jsonDir = path.join(reportsDir, 'json');
const outputDir = path.join(reportsDir, 'cucumber-html');

if (!fs.existsSync(jsonDir)) {
  throw new Error(`Missing Cucumber JSON directory: ${jsonDir}. Run tests before generating the report.`);
}

const jsonFiles = fs.readdirSync(jsonDir).filter((file) => file.endsWith('.json'));
if (jsonFiles.length === 0) {
  throw new Error(`No Cucumber JSON files found in ${jsonDir}. Run tests before generating the report.`);
}

reporter.generate({
  jsonDir,
  reportPath: outputDir,
  displayDuration: true,
  displayReportTime: true,
  pageTitle: 'Automation Test Report',
  reportName: 'Playwright BDD Automation Report',
  metadata: {
    browser: {
      name: process.env.BROWSER || 'chromium',
    },
    device: 'Local/CI machine',
    platform: {
      name: process.platform,
    },
  },
  customData: {
    title: 'Run Info',
    data: [
      { label: 'Environment', value: process.env.ENV || 'sit' },
      { label: 'Role', value: process.env.ROLE || 'user' },
      { label: 'CI', value: process.env.CI || 'false' },
      { label: 'Generated', value: new Date().toISOString() },
    ],
  },
});

console.log(`Cucumber HTML report generated: ${outputDir}`);
