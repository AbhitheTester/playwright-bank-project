const path = require('path');
const { AllureRuntime } = require('allure-js-commons');
const { CucumberJSAllureFormatter } = require('allure-cucumberjs');

class AllureFormatter extends CucumberJSAllureFormatter {
  constructor(options) {
    super(
      options,
      new AllureRuntime({
        resultsDir: process.env.ALLURE_RESULTS_DIR || path.join('reports', 'allure-results'),
      }),
      {
        labels: [],
        links: [],
      }
    );
  }
}

module.exports = AllureFormatter;
