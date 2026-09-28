import { test, expect } from '@playwright/test';
import { CartPage } from '../pages/cartPage';
import { HomePage } from '../pages/homePage';
import { PlaceOrderModal } from '../pages/placeOrderModal';
import { ProductPage } from '../pages/productPage';
import { randomSuffix } from '../utils/dataFactory';

// Runs as a guest: the cart belongs to this browser context only (cookie set on the home page).
// The confirmation date is not asserted: the site renders a 0-based month.
const PRODUCT = 'Samsung galaxy s6';

test.describe('Purchase — place order', () => {
  test.beforeEach(async ({ page }) => {
    const home = new HomePage(page);
    const cart = new CartPage(page);

    await home.goto();
    await home.openProduct(PRODUCT);
    expect(await new ProductPage(page).addToCart()).toBe('Product added');
    await home.navBar.cartLink.click();
    await expect(cart.row(PRODUCT)).toHaveCount(1);
    await expect(cart.total).toHaveText(/^\d+$/);
  });

  test('should show the cart total as the amount in the order form and the purchase confirmation', async ({
    page,
  }) => {
    const cart = new CartPage(page);
    const order = new PlaceOrderModal(page);
    const cartTotal = await cart.readTotal();

    await cart.placeOrderButton.click();
    await expect(order.dialog).toBeVisible();
    await expect(order.total).toHaveText(`Total: ${cartTotal}`);

    const suffix = randomSuffix();
    await order.fillNameAndCard(`Name${suffix}`, `Card${suffix}`);
    await order.purchaseButton.click();

    await expect(order.confirmationHeading).toBeVisible();
    await expect(order.confirmationDetails).toHaveText(
      new RegExp(`Amount: ${cartTotal} USD\\s*Card Number:`)
    );
  });

  test('should echo the typed name and card number in the purchase confirmation', async ({
    page,
  }) => {
    const cart = new CartPage(page);
    const order = new PlaceOrderModal(page);
    const suffix = randomSuffix();
    const name = `Name${suffix}`;
    const card = `Card${suffix}`;

    await cart.placeOrderButton.click();
    await expect(order.dialog).toBeVisible();
    await order.fillNameAndCard(name, card);
    await order.purchaseButton.click();

    await expect(order.confirmationHeading).toBeVisible();
    await expect(order.confirmationDetails).toHaveText(
      new RegExp(`Card Number: ${card}\\s*Name: ${name}\\s*Date:`)
    );
  });

  test('should leave the cart empty after confirming the purchase', async ({ page }) => {
    const cart = new CartPage(page);
    const order = new PlaceOrderModal(page);
    const suffix = randomSuffix();

    await cart.placeOrderButton.click();
    await expect(order.dialog).toBeVisible();
    await order.fillNameAndCard(`Name${suffix}`, `Card${suffix}`);
    // Purchasing empties the guest cart server-side through POST /deletecart.
    const deleteCart = page.waitForResponse('**/deletecart');
    await order.purchaseButton.click();
    await deleteCart;
    await expect(order.confirmationHeading).toBeVisible();
    await order.confirmationOkButton.click();

    // OK is meant to redirect to index.html, but the redirect does not always happen (the alert
    // closes and the page stays on cart.html), so the cart is reopened by URL.
    const viewCart = page.waitForResponse('**/viewcart');
    await cart.goto();
    const { Items } = await (await viewCart).json();
    expect(Items).toEqual([]);
    await expect(cart.rows).toHaveCount(0);
    await expect(cart.total).toBeEmpty();
  });

  test('should keep the order form open with a required-fields alert when the form is empty', async ({
    page,
  }) => {
    const cart = new CartPage(page);
    const order = new PlaceOrderModal(page);

    await cart.placeOrderButton.click();
    await expect(order.dialog).toBeVisible();

    expect(await order.submitExpectingAlert()).toBe('Please fill out Name and Creditcard.');
    await expect(order.confirmationHeading).toBeHidden();
    await expect(order.dialog).toBeVisible();
  });

  test('should keep the order form open with a required-fields alert when only Name is filled', async ({
    page,
  }) => {
    const cart = new CartPage(page);
    const order = new PlaceOrderModal(page);

    await cart.placeOrderButton.click();
    await expect(order.dialog).toBeVisible();
    await order.nameInput.fill(`Name${randomSuffix()}`);

    expect(await order.submitExpectingAlert()).toBe('Please fill out Name and Creditcard.');
    await expect(order.confirmationHeading).toBeHidden();
    await expect(order.dialog).toBeVisible();
  });
});
