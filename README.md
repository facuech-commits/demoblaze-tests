# Demoblaze Playwright Automation

Automated UI, end-to-end and API tests for the [Demoblaze](https://www.demoblaze.com) demo store, written in Playwright + TypeScript with the Page Object Model.

## Project Structure

```
tests/
  e2e.spec.ts        Full user journeys across several screens (tagged @e2e)
  auth.spec.ts       Sign up, log in and log out
  cart.spec.ts       Cart contents, totals and deletion
  purchase.spec.ts   Place order form, confirmation and validation
  api.spec.ts        api.demoblaze.com contracts (cart and catalog)
pages/               One page object per screen or modal
  navBar.ts  homePage.ts  productPage.ts  cartPage.ts
  loginModal.ts  signUpModal.ts  placeOrderModal.ts
utils/dataFactory.ts Unique users, random data, sign up through the API
constants/testData.ts Demo account and API URL
```

## Selected Test Cases & Justification

### 1. End-to-End User Journeys (`e2e.spec.ts`)
**Why?**
- Proves the main flows work from start to finish, the way a real user goes through them.

**Validations:**
- Log in with the demo account: the modal shows its fields, and after login a welcome message with the username is displayed.
- A registered user adds a product, reviews the cart, places the order and gets a confirmation. The confirmation shows the product price, the name and the card that were entered.
- A guest adds a product to the cart and removes it.

### 2. Authentication (`auth.spec.ts`)
**Why?**
- Authentication is the entry point to every protected feature.
- Each test uses a newly created user instead of the shared public account, so results don't depend on other people.

**Validations:**
- Sign up succeeds and the modal closes.
- After login, the navbar shows "Welcome <user>" and "Log out" and hides "Log in" and "Sign up". Log out reverses it.

### 3. Cart Totals (`cart.spec.ts`)
**Why?**
- Pricing errors directly affect revenue and user trust.

**Validations:**
- Cart row prices match the product API.
- The total equals the sum of rows and updates after a deletion.

### 4. Purchase Confirmation and Validation (`purchase.spec.ts`)
**Why?**
- Checkout is the most critical flow; the confirmation must reflect what the user is paying.

**Validations:**
- The confirmation amount equals the cart total, and the name and card match what was typed.
- The cart is emptied after purchase.
- An incomplete form is rejected with an alert.

### 5. API Contracts (`api.spec.ts`)
**Why?**
- Catches backend regressions faster and more precisely than UI tests.

**Validations:**
- Cart add / view / delete round trip.
- Catalog entries have the required fields.

## Findings

What testing the live site revealed, and how the suite handles each case.

### Bugs in the site under test

| Finding | Cause | How the suite handles it |
|---|---|---|
| The purchase confirmation shows the wrong date (27 Sep shows as `27/8`). | The site builds the date with JavaScript's 0-based `getMonth()`. | The date is not asserted; the bug is documented in `purchase.spec.ts`. |
| After a purchase, OK does not always return to the home page; about 1 in 3 times the page stays on the cart. | The redirect in the confirmation callback is unreliable. | The test reopens the cart by URL and verifies through the `/viewcart` response that it is empty. |
| "Previous" in the catalog pagination returns a different first page than the initial load (Samsung galaxy s6 is missing). | The `/pagination` endpoint does not match `/entries`. | Not covered yet. A pagination test must compare against the `/pagination` response, not against the first load. |

### Testing challenges

| Finding | Cause | Solution |
|---|---|---|
| Cart tests passed or failed depending on the day. | The demo account (`asd`) is public: anyone can add items to its cart at any time. | Cart and purchase tests use a guest cart, or a newly created user, that belongs only to that test. |
| Opening the cart page directly showed other people's products. | The cookie that identifies a guest cart is set only when the home page loads. | Every test loads the home page first. |
| The "Product added" confirmation appears outside the page. | It is a native `window.alert`, not an HTML modal. | Handled with `page.waitForEvent('dialog')`. The message also differs by state: `Product added` as a guest, `Product added.` when logged in. |
| Waiting for the form validation alert froze the test. | That alert fires synchronously inside the click, so the click never finishes until the alert is handled. | The listener is registered with `page.once('dialog')` before the click and accepts the alert itself. |
| The API reports success even when an operation fails. | Demoblaze returns HTTP 200 with an `errorMessage` in the body (wrong password, duplicate user, item not found). | API tests assert on the body, and check that an item really exists before testing its deletion. |

## AI-assisted coverage workflow (Claude Code)
The repo includes a Claude Code skill, `cover-feature-with-tests` (in `.claude/`), that adds coverage in three steps. Each step is handled by a separate agent:
1. **Plan**: a read-only agent explores the live site and the current suite, then proposes up to 6 coverage gaps mapped to their spec and page object.
2. **Approve**: a human picks which gaps to implement.
3. **Write and verify**: one agent writes the tests (append-only, following [the authoring rules](.claude/skills/cover-feature-with-tests/references/authoring-rules.md)), and a different agent runs them, repeats them to detect flakiness, and marks as `test.fixme` whatever it cannot fix without changing the assertion.

Assertions compare the UI against the API responses that feed it (`api.demoblaze.com`) and against invariants such as "cart total = sum of rows". They avoid hardcoded values, because the public site is shared. See [assertions.md](.claude/skills/cover-feature-with-tests/references/assertions.md).

## How to Run

1. Install dependencies and the browser:
   ```bash
   npm install
   npx playwright install chromium
   ```
2. Run tests:
   ```bash
   npm test              # whole suite
   npm run test:e2e      # end-to-end journeys only
   npm run test:api      # API tests only
   ```
3. View the report:
   ```bash
   npm run report
   ```
4. Format code:
   ```bash
   npm run format
   ```

## Test Environment Notes
- Only the Chromium browser is used (other browsers are disabled in the configuration).
- Tests inside a file run in order; files run in parallel locally, and on a single worker in CI.
- The suite runs against the public Demoblaze site. If the site is down ("Server Error"), tests fail for reasons outside the repo; re-run once it is back.
- CI runs on every push and pull request to `main` (GitHub Actions) and uploads the HTML report as an artifact.

---

For any questions, please contact the repository owner.
