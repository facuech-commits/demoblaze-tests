import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/homePage';
import { LoginModal } from '../pages/loginModal';
import { NavBar } from '../pages/navBar';
import { SignUpModal } from '../pages/signUpModal';
import { signUpViaApi, uniqueUser } from '../utils/dataFactory';

// Every test owns a fresh user: the demo account in constants/testData.ts is public.
test.beforeEach(async ({ page }) => {
  await new HomePage(page).goto();
});

test.describe('Auth — sign up', () => {
  test('should confirm the sign up and close the Sign up dialog as a new user', async ({
    page,
  }) => {
    const user = uniqueUser('auth');
    const signUp = new SignUpModal(page);
    await signUp.open();
    await signUp.fill(user.username, user.password);

    const dialogPromise = page.waitForEvent('dialog');
    await signUp.signUpButton.click();
    const dialog = await dialogPromise;
    expect(dialog.message()).toBe('Sign up successful.');
    await dialog.accept();

    await expect(signUp.dialog).toBeHidden();
  });
});

test.describe('Auth — logged-in navbar', () => {
  test('should show Welcome and Log out links instead of Log in and Sign up after logging in', async ({
    page,
    request,
  }) => {
    const user = uniqueUser('auth');
    await signUpViaApi(request, user);
    const navBar = new NavBar(page);

    await new LoginModal(page).login(user.username, user.password);

    await expect(navBar.welcomeLink(user.username)).toBeVisible();
    await expect.soft(navBar.logOutLink).toBeVisible();
    await expect.soft(navBar.logInLink).toBeHidden();
    await expect.soft(navBar.signUpLink).toBeHidden();
  });
});

test.describe('Auth — log out', () => {
  test('should show Log in and Sign up links again and hide Log out after logging out', async ({
    page,
    request,
  }) => {
    const user = uniqueUser('auth');
    await signUpViaApi(request, user);
    const navBar = new NavBar(page);
    await new LoginModal(page).login(user.username, user.password);
    // Wait for the post-login reload to settle before logging out (not the behavior under test).
    await expect(navBar.welcomeLink(user.username)).toBeVisible();

    await navBar.logOutLink.click();

    // Guard: the reloaded page's raw HTML already shows Log in and hides Log out, and only a
    // later /check call would flip them if the session survived. Require the token to be gone
    // first so the navbar checks below cannot pass on that transient initial state.
    await expect
      .poll(async () =>
        (await page.context().cookies()).some((c) => c.name === 'tokenp_' && c.value !== '')
      )
      .toBe(false);
    await expect(navBar.logInLink).toBeVisible();
    await expect.soft(navBar.signUpLink).toBeVisible();
    await expect.soft(navBar.logOutLink).toBeHidden();
  });
});
