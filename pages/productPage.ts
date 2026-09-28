import { Page, Locator } from '@playwright/test';

export class ProductPage {
  readonly page: Page;
  readonly addToCartLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addToCartLink = page.getByRole('link', { name: 'Add to cart' });
  }

  /**
   * Clicks "Add to cart", accepts the alert and returns its message:
   * 'Product added' as a guest, 'Product added.' when logged in.
   */
  async addToCart(): Promise<string> {
    const dialogPromise = this.page.waitForEvent('dialog');
    await this.addToCartLink.click();
    const dialog = await dialogPromise;
    const message = dialog.message();
    await dialog.accept();
    return message;
  }
}
