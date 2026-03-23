import { Page, Locator, expect } from '@playwright/test';


export class OrderFormHelper {

  /**
   * Deletes all 'Samsung galaxy s6' items from the cart by clicking their delete links until none remain.
   */
  async deleteAllSamsungGalaxyS6FromCart() {
    while (true) {
      // Find the row containing 'Samsung galaxy s6'
      const row = this.page.locator('tr', { hasText: 'Samsung galaxy s6' });
      const count = await row.count();
      if (count === 0) break;
      // Find the delete button in that row and click it
      await row.first().locator('a:has-text("Delete")').click();
      // Wait for the table to update
      await this.page.waitForTimeout(500);
    }
  }

  readonly nameInput: Locator;
  readonly countryInput: Locator;
  readonly cityInput: Locator;
  readonly cardInput: Locator;
  readonly monthInput: Locator;
  readonly yearInput: Locator;
  readonly page: Page;
  readonly purchaseButton: Locator;
  readonly confirmationImage: Locator;
  readonly confirmationHeading: Locator;
  readonly confirmationOkButton: Locator;
  
  
  
  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.locator('#name');
    this.countryInput = page.getByRole('textbox', { name: 'Country:' });
    this.cityInput = page.getByRole('textbox', { name: 'City:' });
    this.cardInput = page.getByRole('textbox', { name: 'Credit card:' });
    this.monthInput = page.getByRole('textbox', { name: 'Month:' });
    this.yearInput = page.getByRole('textbox', { name: 'Year:' });
    this.purchaseButton = page.getByRole('button', { name: 'Purchase' });
    this.confirmationImage = page.locator('.sa-placeholder');
    this.confirmationHeading = page.getByRole('heading', { name: 'Thank you for your purchase!' });
    this.confirmationOkButton = page.getByRole('button', { name: 'OK' });
    this.confirmationHeading = page.getByRole('heading', { name: 'Thank you for your purchase!' });
    this.confirmationOkButton = page.getByRole('button', { name: 'OK' });
  }

  static randomSuffix(length = 6) {
    return Math.random().toString(36).substring(2, 2 + length);
  }

  async fillWithRandomData() {
    const suffix = OrderFormHelper.randomSuffix();
    await this.nameInput.fill('Name' + suffix);
    await this.countryInput.fill('Country' + suffix);
    await this.cityInput.fill('City' + suffix);
    await this.cardInput.fill('Card' + suffix);
    await this.monthInput.fill('12' + suffix);
    await this.yearInput.fill('2026' + suffix);
  }
}
