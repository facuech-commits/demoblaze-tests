import { Page, Locator } from '@playwright/test';

export class ProductLocators {
  readonly page: Page;
  readonly productRow: Locator;
  readonly productImage: Locator;
  readonly productNameCell: Locator;
  readonly productPriceCell: Locator;
  

  constructor(page: Page) {
    this.page = page;
    this.productRow = page.getByRole('row', { name: 'Samsung galaxy s6 360 Delete' });
    this.productImage = page.locator('img[src="imgs/galaxy_s6.jpg"]');
    this.productNameCell = page.getByRole('cell', { name: 'Samsung galaxy s6' });
    this.productPriceCell = page.getByRole('cell', { name: '360' });
    
  }
}
