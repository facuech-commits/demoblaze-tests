import { Page, Locator, expect } from '@playwright/test';
import { NavBar } from './navBar';

export class LoginModal {
  readonly page: Page;
  readonly navBar: NavBar;
  readonly dialog: Locator;
  readonly heading: Locator;
  readonly usernameLabel: Locator;
  readonly passwordLabel: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly closeButton: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navBar = new NavBar(page);
    this.dialog = page.getByRole('dialog', { name: 'Log in' });
    this.heading = this.dialog.getByRole('heading', { name: 'Log in' });
    this.usernameLabel = this.dialog.getByText('Username:');
    this.passwordLabel = this.dialog.getByText('Password:');
    // The Log in textboxes have no accessible name; their ids are the only stable hook.
    this.usernameInput = page.locator('#loginusername');
    this.passwordInput = page.locator('#loginpassword');
    this.closeButton = this.dialog.getByText('Close');
    this.loginButton = this.dialog.getByRole('button', { name: 'Log in' });
  }

  async open(): Promise<void> {
    await this.navBar.logInLink.click();
    // Wait for the Bootstrap fade-in before filling fields (not a behavior check).
    await expect(this.heading).toBeVisible();
  }

  async fill(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
  }

  /** Opens the modal and submits the credentials. Success reloads the page. */
  async login(username: string, password: string): Promise<void> {
    await this.open();
    await this.fill(username, password);
    await this.loginButton.click();
  }
}
