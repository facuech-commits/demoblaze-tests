import { Page, Locator } from '@playwright/test';
import { randomSuffix } from '../utils/dataFactory';

export type OrderDetails = { name: string; card: string };

/** "Place order" modal on the cart page, plus the purchase confirmation it opens. */
export class PlaceOrderModal {
  readonly page: Page;
  readonly dialog: Locator;
  readonly total: Locator;
  readonly nameInput: Locator;
  readonly countryInput: Locator;
  readonly cityInput: Locator;
  readonly cardInput: Locator;
  readonly monthInput: Locator;
  readonly yearInput: Locator;
  readonly purchaseButton: Locator;
  readonly confirmationHeading: Locator;
  readonly confirmationDetails: Locator;
  readonly confirmationOkButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.getByRole('dialog', { name: 'Place order' });
    // "Total: <n>" is a <label> bound to #name, not exposed with its own role.
    this.total = page.locator('#totalm');
    // The Name textbox's accessible name collides with the total label ("Total: 360 Name:").
    this.nameInput = page.locator('#name');
    this.countryInput = page.getByRole('textbox', { name: 'Country:' });
    this.cityInput = page.getByRole('textbox', { name: 'City:' });
    this.cardInput = page.getByRole('textbox', { name: 'Credit card:' });
    this.monthInput = page.getByRole('textbox', { name: 'Month:' });
    this.yearInput = page.getByRole('textbox', { name: 'Year:' });
    this.purchaseButton = page.getByRole('button', { name: 'Purchase' });
    this.confirmationHeading = page.getByRole('heading', { name: 'Thank you for your purchase!' });
    this.confirmationDetails = page.getByRole('paragraph').filter({ hasText: 'Card Number:' });
    this.confirmationOkButton = page.getByRole('button', { name: 'OK' });
  }

  /** Fills every field with unique values and returns the ones the confirmation echoes. */
  async fillWithRandomData(): Promise<OrderDetails> {
    const suffix = randomSuffix();
    const details = { name: `Name${suffix}`, card: `Card${suffix}` };
    await this.nameInput.fill(details.name);
    await this.countryInput.fill(`Country${suffix}`);
    await this.cityInput.fill(`City${suffix}`);
    await this.cardInput.fill(details.card);
    await this.monthInput.fill('12');
    await this.yearInput.fill('2026');
    return details;
  }

  async fillNameAndCard(name: string, card: string): Promise<void> {
    await this.nameInput.fill(name);
    await this.cardInput.fill(card);
  }

  /** Clicks "Purchase" when a validation alert is expected; accepts it and returns its message. */
  async submitExpectingAlert(): Promise<string> {
    // The alert is raised synchronously inside the click handler, so click() does not resolve
    // until the dialog is handled: accept it from the listener instead of after the click.
    const message = new Promise<string>((resolve) => {
      this.page.once('dialog', async (dialog) => {
        resolve(dialog.message());
        await dialog.accept();
      });
    });
    await this.purchaseButton.click();
    return message;
  }
}
