import {
  Before,
  After,
  BeforeAll,
  AfterAll,
  setWorldConstructor,
  setDefaultTimeout,
} from '@cucumber/cucumber';
import { Browser, chromium, firefox, request as playwrightRequest, webkit } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { getAuthFilePath, getReportsDir, testConfig } from './config';
import { ICustomWorld, CustomWorld } from './world';

setWorldConstructor(CustomWorld);
setDefaultTimeout(testConfig.timeout);

let sharedBrowser: Browser;
const userStorageState = getAuthFilePath();
const reportsDir = getReportsDir();

function browserType() {
  if (testConfig.browserName === 'firefox') return firefox;
  if (testConfig.browserName === 'webkit') return webkit;
  return chromium;
}

function safeFileName(value: string) {
  return value.replace(/[^a-z0-9-]+/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').toLowerCase();
}

BeforeAll(async function() {
  fs.mkdirSync(path.join(reportsDir, 'videos'), { recursive: true });
  fs.mkdirSync(path.join(reportsDir, 'traces'), { recursive: true });
  fs.mkdirSync(path.join(reportsDir, 'screenshots'), { recursive: true });

  sharedBrowser = await browserType().launch({
    headless: testConfig.headless,
    slowMo: testConfig.slowMo,
  });

  console.log(`\nBrowser ready: ${testConfig.browserName} | ENV=${testConfig.envName} | ROLE=${testConfig.roleName}\n`);
});

Before({ tags: '@ui or @smoke' }, async function(this: ICustomWorld) {
  if (!fs.existsSync(userStorageState)) {
    throw new Error(`Missing auth session file: ${userStorageState}. Run npm run auth:setup or let run-cucumber.js create it.`);
  }

  this.context = await sharedBrowser.newContext({
    storageState: userStorageState,
    viewport: testConfig.viewport,
    locale: testConfig.locale,
    timezoneId: testConfig.timezoneId,
    recordVideo: { dir: path.join(reportsDir, 'videos') },
  });

  await this.context.tracing.start({
    screenshots: true,
    snapshots: true,
    sources: true,
  });

  this.page = await this.context.newPage();
  this.page.setDefaultTimeout(testConfig.actionTimeout);
  this.page.setDefaultNavigationTimeout(testConfig.navigationTimeout);

  this.page.on('response', (res) => {
    if (res.status() >= 400) {
      console.warn(`HTTP ${res.status()}: ${res.url()}`);
    }
  });
});

Before({ tags: '@api' }, async function(this: ICustomWorld) {
  this.apiContext = await playwrightRequest.newContext({
    baseURL: testConfig.apiBaseURL,
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      'x-api-key': testConfig.apiToken,
    },
  });
});

After(async function(this: ICustomWorld, scenario) {
  const scenarioName = safeFileName(scenario.pickle.name || 'scenario');
  const failed = scenario.result?.status === 'FAILED';

  if (failed && this.page) {
    const screenshot = await this.page.screenshot({ fullPage: true });
    const screenshotPath = path.join(reportsDir, 'screenshots', `${scenarioName}.png`);
    fs.writeFileSync(screenshotPath, screenshot);
    await this.attach(screenshot, 'image/png');
    await this.attach(`URL: ${this.page.url()}`, 'text/plain');
    await this.attach(`Screenshot: ${screenshotPath}`, 'text/plain');
  }

  if (failed && this.apiResponse) {
    await this.attach(JSON.stringify(this.apiResponse.body, null, 2), 'application/json');
  }

  if (this.context) {
    const tracePath = path.join(reportsDir, 'traces', `${scenarioName}.zip`);
    await this.context.tracing.stop({ path: failed ? tracePath : undefined });
    if (failed) {
      await this.attach(`Trace: ${tracePath}`, 'text/plain');
    }
    await this.context.close();
  }

  if (this.apiContext) {
    await this.apiContext.dispose();
  }
});

AfterAll(async function() {
  if (sharedBrowser) {
    await sharedBrowser.close();
  }
  console.log('\nAll done\n');
});
