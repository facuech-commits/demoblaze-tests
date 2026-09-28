import { Page, Locator } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly rows: Locator;
  readonly total: Locator;
  readonly placeOrderButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.rows = page.getByRole('row').filter({ has: page.getByRole('link', { name: 'Delete' }) });
    // The total is an unnamed level-3 heading; #totalp is its only stable hook.
    this.total = page.locator('#totalp');
    this.placeOrderButton = page.getByRole('button', { name: 'Place Order' });
  }

  async goto(): Promise<void> {
    await this.page.goto('cart.html');
  }

  row(title: string): Locator {
    return this.rows.filter({ hasText: title });
  }

  deleteLinkIn(row: Locator): Locator {
    return row.getByRole('link', { name: 'Delete' });
  }

  titleCellIn(row: Locator, title: string): Locator {
    return row.getByRole('cell', { name: title, exact: true });
  }

  priceCellIn(row: Locator): Locator {
    return row.getByRole('cell').filter({ hasText: /^\d+$/ });
  }

  /** Call only after a retrying assertion has proved every expected row is rendered. */
  async readRowPrices(): Promise<number[]> {
    const texts = await this.priceCellIn(this.rows).allTextContents();
    return texts.map(Number);
  }

  async readTotal(): Promise<number> {
    return Number(await this.total.textContent());
  }
}
