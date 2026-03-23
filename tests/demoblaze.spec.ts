import { OrderFormHelper } from '../pages/orderFormHelper';
import { test, expect } from '@playwright/test';
import { homePageLocators } from '../pages/homePageLocators';
import { LoginPage } from '../pages/login';
import { credentials } from '../constants/testData';
import { ProductLocators } from '../pages/productInformation';

test.describe('Demoblaze Tests', () => {
  test('login_flow', async ({ page }) => {
    
    const loginPage = new LoginPage(page);
    await loginPage.performLogin(credentials.username, credentials.password);
    await expect(page.getByRole('link', { name: `Welcome ${credentials.username}` })).toBeVisible();
  });

  test('purchase_flow', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new homePageLocators(page);
    const orderForm = new OrderFormHelper(page);
    const dialogPromise = page.waitForEvent('dialog');
    await loginPage.performLogin(credentials.username, credentials.password);
    await homePage.cellPhoneArticle.click();
    await homePage.addToCartLink.click();
    const dialog = await dialogPromise;
    expect(dialog.message()).toBe('Product added.');
    await dialog.accept();
    await homePage.cartExactLink.click();
    await homePage.placeOrderButton.click();
    await orderForm.fillWithRandomData();
    await orderForm.purchaseButton.click();
    await expect(orderForm.confirmationImage).toBeVisible();
    await expect(orderForm.confirmationHeading).toBeVisible();
    await expect(orderForm.confirmationOkButton).toBeEnabled();
    await orderForm.confirmationOkButton.click();
  });

  test('delete_a_product', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new homePageLocators(page);
    const dialogPromise = page.waitForEvent('dialog');
    const productLocators = new ProductLocators(page);
    const orderForm = new OrderFormHelper(page);
    await loginPage.performLogin(credentials.username, credentials.password);
    await homePage.cellPhoneArticle.click();
    await homePage.addToCartLink.click();
    const dialog = await dialogPromise;
    expect(dialog.message()).toBe('Product added.');
    await dialog.accept();
    await homePage.cartExactLink.click();
    await homePage.deleteLink.click();
    await orderForm.deleteAllSamsungGalaxyS6FromCart();
    await expect(productLocators.productImage).not.toBeVisible();
    await expect(productLocators.productNameCell).not.toBeVisible();
    await expect(productLocators.productPriceCell).not.toBeVisible();
  });
});
