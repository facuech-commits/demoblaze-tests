import { Page, Locator } from '@playwright/test';

export class homePageLocators {
  readonly page: Page;

  readonly logInLink: Locator;
  readonly productStore: Locator;
  readonly categories: Locator;
  readonly phones: Locator;
  readonly laptops: Locator;
  readonly monitors: Locator;
  readonly home: Locator;
  readonly contact: Locator;
  readonly aboutUs: Locator;
  readonly cart: Locator;
  readonly signUp: Locator;
  readonly cellPhoneArticle: Locator;
  readonly addToCartLink: Locator;
  readonly cartExactLink: Locator;
  readonly placeOrderButton: Locator;
  readonly deleteLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logInLink = page.getByRole('link', { name: 'Log in' });
    this.productStore = page.getByRole('link', { name: 'PRODUCT STORE' });
    this.categories = page.getByRole('link', { name: 'CATEGORIES' });
    this.phones = page.getByRole('link', { name: 'Phones' });
    this.laptops = page.getByRole('link', { name: 'Laptops' });
    this.monitors = page.getByRole('link', { name: 'Monitors' });
    this.home = page.getByRole('link', { name: 'Home (current)' });
    this.contact = page.getByRole('link', { name: 'Contact' });
    this.aboutUs = page.getByRole('link', { name: 'About us' });
    this.cart = page.getByRole('link', { name: 'Cart' });
    this.signUp = page.getByRole('link', { name: 'Sign up' });
    this.cellPhoneArticle = page.getByRole('link', { name: 'Samsung galaxy s6' });
    this.addToCartLink = page.getByRole('link', { name: 'Add to cart' });
    this.cartExactLink = page.getByRole('link', { name: 'Cart', exact: true });
    this.placeOrderButton = page.getByRole('button', { name: 'Place Order' });
    this.deleteLink = page.getByRole('link', { name: 'Delete' });
  }
}
