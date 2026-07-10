const fs = require('fs');
const path = require('path');

function resetReportsDirectory(reportsDir) {
  if (fs.existsSync(reportsDir)) {
    fs.rmSync(reportsDir, { recursive: true, force: true });
  }

  fs.mkdirSync(reportsDir, { recursive: true });
  fs.mkdirSync(path.join(reportsDir, 'allure-results'), { recursive: true });
  fs.mkdirSync(path.join(reportsDir, 'json'), { recursive: true });
}

module.exports = { resetReportsDirectory };
