import { Page, Locator, expect } from '@playwright/test';
import { NavBar } from './navBar';

export class SignUpModal {
  readonly page: Page;
  readonly navBar: NavBar;
  readonly dialog: Locator;
  readonly heading: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly signUpButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navBar = new NavBar(page);
    this.dialog = page.getByRole('dialog', { name: 'Sign up' });
    this.heading = this.dialog.getByRole('heading', { name: 'Sign up' });
    this.usernameInput = this.dialog.getByRole('textbox', { name: 'Username:' });
    this.passwordInput = this.dialog.getByRole('textbox', { name: 'Password:' });
    this.signUpButton = this.dialog.getByRole('button', { name: 'Sign up' });
  }

  async open(): Promise<void> {
    await this.navBar.signUpLink.click();
    // Wait for the Bootstrap fade-in before filling fields (not a behavior check).
    await expect(this.heading).toBeVisible();
  }

  async fill(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
  }
}
