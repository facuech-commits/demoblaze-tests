import { Page, Locator } from '@playwright/test';
import { NavBar } from './navBar';

export type ProductSource = { title: string; price: number };

export class HomePage {
  readonly page: Page;
  readonly navBar: NavBar;
  readonly phonesCategory: Locator;
  readonly laptopsCategory: Locator;
  readonly monitorsCategory: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navBar = new NavBar(page);
    this.phonesCategory = page.getByRole('link', { name: 'Phones' });
    this.laptopsCategory = page.getByRole('link', { name: 'Laptops' });
    this.monitorsCategory = page.getByRole('link', { name: 'Monitors' });
  }

  /** Loading the home page also sets the `user` cookie that keys a guest cart. */
  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  productLink(title: string): Locator {
    return this.page.getByRole('link', { name: title, exact: true });
  }

  /** Opens a product from the catalog and returns the POST /view payload the detail renders. */
  async openProduct(title: string): Promise<ProductSource> {
    const view = this.page.waitForResponse(
      (response) => response.url().endsWith('/view') && response.request().method() === 'POST'
    );
    await this.productLink(title).click();
    const body = await (await view).json();
    return { title: body.title, price: body.price };
  }
}
