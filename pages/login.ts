import { Page, Locator, expect } from '@playwright/test';
import { homePageLocators } from './homePageLocators';

export class LoginPage extends homePageLocators {
  readonly loginHeading: Locator;
  readonly usernameLabel: Locator;
  readonly passwordLabel: Locator;
  readonly closeButton: Locator;
  readonly loginButton: Locator;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly logIn: Locator;

  constructor(page: Page) {
    super(page);
    this.logIn = page.getByRole('link', { name: 'Log in' });
    this.loginHeading = page.getByRole('heading', { name: 'Log in' });
    this.usernameLabel = page
      .getByLabel('Log in')
      .getByText('Username:');
    this.passwordLabel = page
      .getByLabel('Log in')
      .getByText('Password:');
    this.closeButton = page.getByLabel('Log in').getByText('Close');
    this.loginButton = page.getByRole('button', { name: 'Log in' });
    this.usernameInput = page.locator('#loginusername');
    this.passwordInput = page.locator('#loginpassword');
  }

  async performLogin(username: string, password: string): Promise<void> {
    await this.page.goto('https://www.demoblaze.com');
    await this.logIn.click();
    await expect.soft(this.loginHeading).toBeVisible();
    await expect.soft(this.usernameLabel).toBeVisible();
    await expect.soft(this.passwordLabel).toBeVisible();
    await expect.soft(this.closeButton).toBeVisible();
    await expect.soft(this.loginButton).toBeVisible();
    await expect.soft(this.usernameInput).toBeVisible();
    await expect.soft(this.passwordInput).toBeVisible();
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
