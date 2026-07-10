const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { resetReportsDirectory } = require('./report-utils');

test('resetReportsDirectory removes previous report artifacts and recreates fresh folders', () => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'report-utils-'));
  const reportsDir = path.join(tempRoot, 'reports');

  fs.mkdirSync(path.join(reportsDir, 'allure-results'), { recursive: true });
  fs.mkdirSync(path.join(reportsDir, 'json'), { recursive: true });
  fs.writeFileSync(path.join(reportsDir, 'old-report.json'), 'stale');
  fs.writeFileSync(path.join(reportsDir, 'allure-results', 'stale-result.json'), 'stale');
  fs.writeFileSync(path.join(reportsDir, 'json', 'stale.json'), 'stale');

  resetReportsDirectory(reportsDir);

  assert.equal(fs.existsSync(reportsDir), true);
  assert.equal(fs.existsSync(path.join(reportsDir, 'allure-results')), true);
  assert.equal(fs.existsSync(path.join(reportsDir, 'json')), true);
  assert.equal(fs.existsSync(path.join(reportsDir, 'old-report.json')), false);
  assert.equal(fs.existsSync(path.join(reportsDir, 'allure-results', 'stale-result.json')), false);
  assert.equal(fs.existsSync(path.join(reportsDir, 'json', 'stale.json')), false);
});
