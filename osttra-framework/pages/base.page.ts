import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  constructor(protected page: Page) {}

  // ── Reusable actions ────────────────────────────────────
  async navigateTo(path: string) {
    await this.page.goto(path);
  }

  async clickByText(text: string) {
    await this.page.locator(`text=${text}`).click();
  }

  async fillField(selector: string, value: string) {
    await this.page.locator(selector).clear();
    await this.page.locator(selector).fill(value);
  }

  async selectDropdown(selector: string, value: string) {
    await this.page.locator(selector).selectOption({ label: value });
  }

  // ── Table utilities ─────────────────────────────────────
  async getTableRowCount(tableSelector: string): Promise<number> {
    return this.page.locator(`${tableSelector} tbody tr`).count();
  }

  async getTableCellValue(row: number, col: number, tableSelector = 'table'): Promise<string> {
    const cell = this.page.locator(`${tableSelector} tbody tr:nth-child(${row}) td:nth-child(${col})`);
    return (await cell.textContent())?.trim() ?? '';
  }

  async assertTableHasColumns(headers: string[]) {
    for (const header of headers) {
      await expect(this.page.locator(`th:has-text("${header}")`)).toBeVisible();
    }
  }

  // ── Wait utilities ──────────────────────────────────────
  async waitForSpinnerToDisappear() {
    await this.page.locator('.loading, .spinner').waitFor({ state: 'hidden', timeout: 15000 })
      .catch(() => {});  // ignore if spinner not present
  }

  async waitForToast(message: string) {
    await expect(this.page.locator(`.toast, .notification, .message`))
      .toContainText(message, { timeout: 10000 });
  }
}