# Demoblaze Playwright Automation

## Project Overview
This project automates key user flows for the Demoblaze web application using Playwright. 

## Selected Test Cases & Justification

### 1. Login Flow
**Why?**
- Authentication is a critical entry point for any application.
- Ensures only valid users can access protected features.

**Validations:**
- Login modal appears when clicking "Log in".
- Username and password fields are visible and enabled.
- Login button is enabled.
- After login, a welcome message with the username is displayed.

### 2. Product Purchase Flow
**Why?**
- Core business functionality: purchasing products.
- Validates the end-to-end shopping experience.

**Validations:**
- User can add a product to the cart.
- Cart displays the correct product and price.
- Purchase form fields are visible and can be filled.
- Confirmation message appears after purchase.

### 3. Delete a Product from Cart
**Why?**
- Removing items from the cart is essential for a good user experience and order accuracy.
- Validates cart management and UI updates after deletion.

**Validations:**
- User can add a product to the cart.
- Product is visible in the cart before deletion.
- After clicking delete, the product is removed from the cart.
- Cart UI updates correctly (product image, name, and price are no longer visible).

## Problems, Errors, or Blockers
I encountered some issues, for example with the confirmation modal when adding an item to the cart, as the modal appeared outside the platform. I used Copilot to help handle this situation.
I also needed help generating random suffixes to fill values in the purchase information modal. Although I have done similar actions before, it can be cumbersome to declare these values manually.
Since some locators on this page are not very robust, certain things became complicated. For example, when adding toBeVisible assertions to verify that an item is in the cart, I could not implement them because if there was another item with the same name, it was not validated correctly.

## AI Usage
GitHub Copilot (GPT-4.1) was used to:
   - Suggest POM best practices for Playwright assertions and test structure.
   - Refactor and aggregate assertions in page object methods.
   - Draft this README and summarize test case justifications.
   - When accessing a page, I provided all the locators I saw at once, so I didn't have to declare them one by one, which saved time.
All code and documentation were reviewed and validated manually with the debug

## How to Run

## Test Environment Notes
- All tests are configured to run serially (not in parallel) for stability and easier debugging.
- Only the Chromium browser is used for test execution (other browsers are disabled in the configuration).
1. Install dependencies:
   ```bash
   npm install
   ```
2. Run tests:
   ```bash
   npx playwright test
   ```
3. View reports:
   ```bash
   npx playwright show-report
   ```

---

For any questions, please contact the repository owner.
