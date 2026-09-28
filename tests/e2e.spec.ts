import { test, expect } from '@playwright/test';
import { demoAccount } from '../constants/testData';
import { CartPage } from '../pages/cartPage';
import { HomePage } from '../pages/homePage';
import { LoginModal } from '../pages/loginModal';
import { PlaceOrderModal } from '../pages/placeOrderModal';
import { ProductPage } from '../pages/productPage';
import { signUpViaApi, uniqueUser } from '../utils/dataFactory';

// End-to-end journeys: each test walks a full user flow across several screens.
// The focused specs (auth, cart, purchase, api) check each behavior in isolation.
const PRODUCT = 'Samsung galaxy s6';

test.describe('E2E — user journeys', { tag: '@e2e' }, () => {
  test.beforeEach(async ({ page }) => {
    await new HomePage(page).goto();
  });

  test('should log in with the demo account and greet the user', async ({ page }) => {
    const home = new HomePage(page);
    const loginModal = new LoginModal(page);

    await loginModal.open();
    await expect.soft(loginModal.usernameLabel).toBeVisible();
    await expect.soft(loginModal.passwordLabel).toBeVisible();
    await expect.soft(loginModal.usernameInput).toBeEditable();
    await expect.soft(loginModal.passwordInput).toBeEditable();
    await expect.soft(loginModal.closeButton).toBeVisible();
    await expect(loginModal.loginButton).toBeEnabled();

    await loginModal.fill(demoAccount.username, demoAccount.password);
    await loginModal.loginButton.click();

    await expect(home.navBar.welcomeLink(demoAccount.username)).toBeVisible();
  });

  test('should let a registered user buy a product from the catalog', async ({ page, request }) => {
    const home = new HomePage(page);
    const product = new ProductPage(page);
    const cart = new CartPage(page);
    const order = new PlaceOrderModal(page);
    // A fresh user owns an empty cart; the demo account's cart is shared with everyone.
    const user = uniqueUser('e2e');
    await signUpViaApi(request, user);

    await test.step('log in', async () => {
      await new LoginModal(page).login(user.username, user.password);
      await expect(home.navBar.welcomeLink(user.username)).toBeVisible();
    });

    const source = await test.step('add the product to the cart', async () => {
      const source = await home.openProduct(PRODUCT);
      expect(await product.addToCart()).toBe('Product added.');
      return source;
    });

    await test.step('review the cart', async () => {
      await home.navBar.cartLink.click();
      await expect(cart.row(source.title)).toHaveCount(1);
      await expect(cart.total).toHaveText(String(source.price));
    });

    const details = await test.step('place the order', async () => {
      await cart.placeOrderButton.click();
      await expect(order.dialog).toBeVisible();
      const details = await order.fillWithRandomData();
      await order.purchaseButton.click();
      return details;
    });

    await test.step('check the confirmation', async () => {
      await expect(order.confirmationHeading).toBeVisible();
      await expect(order.confirmationDetails).toHaveText(
        new RegExp(
          `Amount: ${source.price} USD\\s*Card Number: ${details.card}\\s*Name: ${details.name}\\s*Date:`
        )
      );
      await expect(order.confirmationOkButton).toBeEnabled();
    });
  });

  test('should let a guest add a product to the cart and remove it', async ({ page }) => {
    const home = new HomePage(page);
    const product = new ProductPage(page);
    const cart = new CartPage(page);

    await home.openProduct(PRODUCT);
    expect(await product.addToCart()).toBe('Product added');
    await home.navBar.cartLink.click();
    const row = cart.row(PRODUCT);
    await expect(row).toHaveCount(1);

    // Deleting calls /deleteitem and then reloads the page; the locators re-resolve after it.
    await cart.deleteLinkIn(row).click();

    await expect(row).toHaveCount(0);
    await expect(cart.rows).toHaveCount(0);
  });
});
