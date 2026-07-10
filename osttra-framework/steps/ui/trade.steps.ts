import { Given, When, Then } from '@cucumber/cucumber';
import { expect, Page } from '@playwright/test';
import { ICustomWorld } from '../../support/world';

function pageOf(world: ICustomWorld): Page {
  if (!world.page) {
    throw new Error('Playwright page was not initialized. Check the @ui tag and hooks.');
  }
  return world.page;
}

async function selectOptionByIndex(page: Page, selector: string, index: number) {
  await page.waitForFunction((target) => {
    const select = document.querySelector(target) as HTMLSelectElement | null;
    return !!select && select.options.length > 0;
  }, selector, { timeout: 30_000 });

  const optionCount = await page.locator(`${selector} option`).count();
  if (!optionCount) {
    throw new Error(`No options found for ${selector}`);
  }

  const safeIndex = Math.min(index, optionCount - 1);
  await page.locator(selector).selectOption({ index: safeIndex });


}

// Given("user is on the Account Overview page",async function(this:ICustomWorld){
//   const page =pageOf(this)
//   const baseURL=process.env.BASE_URL||'https://parabank.parasoft.com/parabank/index.htm?ConnType=JDBC'
//   await page?.goto(baseURL,{waitUntil:'domcontentloaded'})
//   const overviewlink=page.getByRole('link',{name:'Accounts Overview'})
//   if(await expect(overviewlink).toBeVisible().catch(()=>false)){
//     await overviewlink.click()
//   }


// await expect(page.locator('[id="accountTable"]')).toBeVisible({timeout:30_000}  )
// });

// Then("user should see account list table", async function(this:ICustomWorld){
//   await expect(pageOf(this).locator('[id="accountTable"]')).toBeVisible()
// }
// );

// Then('table should have columns {string}, {string}, {string}', async function(this: ICustomWorld, col1: string, col2: string, col3: string) {
//   const headers = await pageOf(this).locator("table[id='accountTable'] thead th").allTextContents();
//   expect(headers[0]).toContain(col1);
//   expect(headers[1]).toContain(col2);
//   expect(headers[2]).toContain(col3);
// });


// Then('at least {int} account should be visible',async function(this:ICustomWorld, Count: number){
//   const size=await pageOf(this).locator('table[id="accountTable"] tr').count()
// await expect(size).toBeGreaterThanOrEqual(Count)
// });

Given('user is on the Account Overview page', async function(this: ICustomWorld) {
  const page = pageOf(this);
  const baseURL = process.env.BASE_URL || 'https://parabank.parasoft.com/parabank/index.htm?ConnType=JDBC';

  await page.goto(baseURL, { waitUntil: 'domcontentloaded' });

  const overviewLink = page.getByRole('link', { name: 'Accounts Overview' });
  if (await overviewLink.isVisible().catch(() => false)) {
    await overviewLink.click();
  }

  await expect(page.locator('#accountTable')).toBeVisible({ timeout: 30_000 });
});

Then('user should see account list table', async function(this: ICustomWorld) {
  await expect(pageOf(this).locator('#accountTable')).toBeVisible();
});

Then('table should have columns {string}, {string}, {string}', async function(
  this: ICustomWorld, col1: string, col2: string, col3: string
) {
  const table = pageOf(this).locator('#accountTable');
  await expect(table).toContainText(col1);
  await expect(table).toContainText(col2);
  await expect(table).toContainText(col3);
});

Then('at least {int} account should be visible', async function(this: ICustomWorld, count: number) {
  const rows = pageOf(this).locator('#accountTable tbody a');
  await expect.poll(async () => rows.count(), { timeout: 30_000 }).toBeGreaterThanOrEqual(count);
});

When('user navigates to {string}', async function(this: ICustomWorld, linkName: string) {
  await pageOf(this).getByRole('link', { name: linkName }).click();
});

When('user enters amount {string}', async function(this: ICustomWorld, amount: string) {
  await pageOf(this).locator('#amount').fill(amount);
});

When('user selects {string} account from dropdown', async function(this: ICustomWorld, direction: string) {
  const page = pageOf(this);
  const selector = direction.toLowerCase() === 'to' ? '#toAccountId' : '#fromAccountId';
  await selectOptionByIndex(page, selector, direction.toLowerCase() === 'to' ? 1 : 0);
});

When('user clicks {string} button', async function(this: ICustomWorld, buttonName: string) {
  const page = pageOf(this);
  const button = page.getByRole('button', { name: buttonName });

  if (await button.isVisible().catch(() => false)) {
    await button.click();
    return;
  }

  await page.locator(`input[value="${buttonName}"]`).click();
});

Then('success message {string} should appear', async function(this: ICustomWorld, message: string) {
  await expect(pageOf(this).getByText(message)).toBeVisible({ timeout: 30_000 });
});

When('user clicks on first account in the table', async function(this: ICustomWorld) {
  await pageOf(this).locator('#accountTable tbody a').first().click();
});

Then('account activity page should open', async function(this: ICustomWorld) {
  await expect(pageOf(this).getByText('Account Details')).toBeVisible({ timeout: 30_000 });
});

Then('account number should be visible', async function(this: ICustomWorld) {
  await expect(pageOf(this).locator('#accountId')).toBeVisible();
});

Then('transaction history table should be displayed', async function(this: ICustomWorld) {
  await expect(pageOf(this).locator('#transactionTable')).toBeVisible({ timeout: 30_000 });
});

When('user enters date range from {string} to {string}', async function(
  this: ICustomWorld, fromDate: string, toDate: string
) {
  const page = pageOf(this);
  await page.locator('#fromDate').fill(fromDate);
  await page.locator('#toDate').fill(toDate);
});

Then('transaction table should load', async function(this: ICustomWorld) {
  await expect(pageOf(this).locator('#transactionTable')).toBeVisible({ timeout: 30_000 });
});

Then('each row should have {string}, {string}, {string}, {string} columns', async function(
  this: ICustomWorld, col1: string, col2: string, col3: string, col4: string
) {
  const table = pageOf(this).locator('#transactionTable');
  await expect(table).toContainText(col1);
  await expect(table).toContainText(col2);
  await expect(table).toContainText(col3);
  await expect(table).toContainText(col4);
});

When('user selects account type {string}', async function(this: ICustomWorld, accountType: string) {
  await pageOf(this).locator('#type').selectOption({ label: accountType });
});

Then('new account confirmation should display', async function(this: ICustomWorld) {
  await expect(pageOf(this).getByText('Account Opened!')).toBeVisible({ timeout: 30_000 });
});