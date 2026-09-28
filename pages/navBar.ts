import { Page, Locator } from '@playwright/test';

/** Top navigation bar, present on every Demoblaze page. */
export class NavBar {
  readonly page: Page;
  readonly homeLink: Locator;
  readonly contactLink: Locator;
  readonly aboutUsLink: Locator;
  readonly cartLink: Locator;
  readonly logInLink: Locator;
  readonly signUpLink: Locator;
  readonly logOutLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.homeLink = page.getByRole('link', { name: 'Home (current)' });
    this.contactLink = page.getByRole('link', { name: 'Contact' });
    this.aboutUsLink = page.getByRole('link', { name: 'About us' });
    this.cartLink = page.getByRole('link', { name: 'Cart', exact: true });
    this.logInLink = page.getByRole('link', { name: 'Log in' });
    this.signUpLink = page.getByRole('link', { name: 'Sign up' });
    this.logOutLink = page.getByRole('link', { name: 'Log out' });
  }

  welcomeLink(username: string): Locator {
    return this.page.getByRole('link', { name: `Welcome ${username}`, exact: true });
  }
}
