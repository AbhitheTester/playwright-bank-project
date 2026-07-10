import { defineConfig, devices } from '@playwright/test';
import { getAuthFilePath, testConfig } from './support/config';

export default defineConfig({
  globalSetup: require.resolve('./global-setup'),
  timeout: testConfig.timeout,
  expect: { timeout: testConfig.actionTimeout },
  retries: process.env.CI ? 2 : 0,
  workers: testConfig.workers,
  fullyParallel: true,

  use: {
    baseURL: testConfig.baseURL,
    storageState: getAuthFilePath(),
    headless: testConfig.headless,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
    actionTimeout: testConfig.actionTimeout,
    navigationTimeout: testConfig.navigationTimeout,
    locale: testConfig.locale,
    timezoneId: testConfig.timezoneId,
    viewport: testConfig.viewport,
  },

  projects: [
    {
      name: `${testConfig.envName}-${testConfig.browserName}-ui`,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: testConfig.baseURL,
        storageState: getAuthFilePath(),
      },
    },
    {
      name: `${testConfig.envName}-api`,
      use: {
        baseURL: testConfig.apiBaseURL,
        storageState: undefined,
      },
    },
  ],

  reporter: [
    ['html', { outputFolder: 'reports/playwright-html', open: 'never' }],
    ['junit', { outputFile: 'reports/junit-playwright.xml' }],
    ['json', { outputFile: 'reports/playwright-results.json' }],
    ['allure-playwright', { outputFolder: 'reports/allure-results' }],
    ['list'],
  ],
});
