import { test, expect } from '@playwright/test';
import { CartPage } from '../pages/cartPage';
import { HomePage } from '../pages/homePage';
import { ProductPage } from '../pages/productPage';

// Guest carts are tied to the `user` cookie set on the home page, so each test owns its cart.
// Prices are never hardcoded: they come from the POST /view response of each product.
const FIRST_PRODUCT = 'Samsung galaxy s6';
const SECOND_PRODUCT = 'Nokia lumia 1520';

test.describe('Cart — item management', () => {
  test.beforeEach(async ({ page }) => {
    await new HomePage(page).goto();
  });

  test('should show the added product with its catalog title and price as a guest', async ({
    page,
  }) => {
    const home = new HomePage(page);
    const product = new ProductPage(page);
    const cart = new CartPage(page);

    const source = await home.openProduct(FIRST_PRODUCT);
    expect(await product.addToCart()).toBe('Product added');
    await home.navBar.cartLink.click();

    const row = cart.row(source.title);
    await expect(row).toHaveCount(1);
    await expect(cart.titleCellIn(row, source.title)).toBeVisible();
    await expect(cart.priceCellIn(row)).toHaveText(String(source.price));
  });

  test('should show a cart total equal to the sum of the row prices as a guest', async ({
    page,
  }) => {
    const home = new HomePage(page);
    const product = new ProductPage(page);
    const cart = new CartPage(page);

    const first = await home.openProduct(FIRST_PRODUCT);
    expect(await product.addToCart()).toBe('Product added');
    await home.goto();
    const second = await home.openProduct(SECOND_PRODUCT);
    expect(await product.addToCart()).toBe('Product added');
    await home.navBar.cartLink.click();
    await expect(cart.rows).toHaveCount(2);

    const rowPrices = await cart.readRowPrices();
    const byValue = (a: number, b: number) => a - b;
    expect([...rowPrices].sort(byValue)).toEqual([first.price, second.price].sort(byValue));
    const sum = rowPrices.reduce((acc, price) => acc + price, 0);
    await expect(cart.total).toHaveText(String(sum));
  });

  test('should keep the other product and total only its price after deleting one of two products as a guest', async ({
    page,
  }) => {
    const home = new HomePage(page);
    const product = new ProductPage(page);
    const cart = new CartPage(page);

    const deleted = await home.openProduct(FIRST_PRODUCT);
    expect(await product.addToCart()).toBe('Product added');
    await home.goto();
    const kept = await home.openProduct(SECOND_PRODUCT);
    expect(await product.addToCart()).toBe('Product added');
    await home.navBar.cartLink.click();
    await expect(cart.rows).toHaveCount(2);

    // Deleting calls /deleteitem and then reloads the page; the locators re-resolve after it.
    await cart.deleteLinkIn(cart.row(deleted.title)).click();

    await expect(cart.row(deleted.title)).toHaveCount(0);
    await expect(cart.row(kept.title)).toHaveCount(1);
    await expect(cart.rows).toHaveCount(1);
    await expect(cart.total).toHaveText(String(kept.price));
  });
});
