import { chromium, expect, FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { getAuthFilePath, getRoleCredentials, testConfig } from './support/config';

async function globalSetup(config?: FullConfig) {
  const authDir = path.join(__dirname, 'auth');
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

  const credentials = getRoleCredentials();
  const authFile = getAuthFilePath();

  const browser = await chromium.launch({
    headless: testConfig.headless,
    slowMo: testConfig.slowMo,
  });

  console.log(`Logging in ROLE=${testConfig.roleName} ENV=${testConfig.envName} at ${testConfig.loginURL}...`);
  const userCtx = await browser.newContext();
  const userPage = await userCtx.newPage();

  await userPage.goto(testConfig.loginURL, { waitUntil: 'domcontentloaded' });
  await userPage.locator(testConfig.loginUsernameSelector).fill(credentials.username);
  await userPage.locator(testConfig.loginPasswordSelector).fill(credentials.password);
  await userPage.locator(testConfig.loginSubmitSelector).click();
  await userPage.waitForLoadState('domcontentloaded');
  await expect(userPage.locator(testConfig.authReadySelector)).toBeVisible({
    timeout: testConfig.navigationTimeout,
  });

  await userCtx.storageState({ path: authFile });

  const verifyCtx = await browser.newContext({ storageState: authFile });
  const verifyPage = await verifyCtx.newPage();
  await verifyPage.goto(testConfig.postLoginURL, { waitUntil: 'domcontentloaded' });
  await expect(verifyPage.locator(testConfig.authReadySelector)).toBeVisible({
    timeout: testConfig.navigationTimeout,
  });
  await verifyCtx.close();

  await userCtx.close();
  await browser.close();

  console.log(`Session saved to ${path.relative(__dirname, authFile)}`);
}

export default globalSetup;

if (require.main === module) {
  globalSetup().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
