# Rules for writing tests

Hard rules. All of them can be checked by reading the code. Some existing code in
this repo predates these rules; new code follows the rules anyway.

## Demoblaze specifics

- **Native dialogs**: "Product added.", sign up and login errors are `window.alert`s. Register the listener **before** the action that triggers it, then assert the message and accept it:
  ```ts
  const dialog = page.waitForEvent('dialog');
  await product.addToCartLink.click();
  expect((await dialog).message()).toBe('Product added'); // 'Product added.' when logged in
  await (await dialog).accept();
  ```
- **Synchronous alerts** (form validation, such as "Please fill out Name and Creditcard.") fire inside the click handler, so `click()` does not resolve until the dialog is handled and the pattern above deadlocks. Register `page.once('dialog', (d) => ...)` before the click and accept inside the listener.
- **Guest carts**: the `user` cookie that keys a guest cart is set when the home page loads. Always `page.goto('/')` before adding to the cart; opening `/cart.html` first shows a shared bucket of other people's items.
- **Bootstrap modals** (Log in, Sign up, Contact, About us, Place order) fade in. Assert the modal heading is visible before filling fields.
- **Async content**: the catalog and the cart are rendered after API calls. Wait on visible content, never on time.
- **Re-rendered tables**: the cart `<tbody>` is rebuilt after each delete. Re-locate rows after every action, or wrap the action in `await expect(async () => { ... }).toPass()`.
- **Navigation**: use `page.goto('/')` and rely on `baseURL` from `playwright.config.ts`; do not hardcode the full URL.
- The site cannot be changed. When no user-facing locator exists, use a semantic attribute (`#id`, `[name=...]`) and note it in the report as a known limitation.

## Locators

Use the first level that works:

`getByRole` → `getByLabel` → `getByPlaceholder` → `getByText` → `getByAltText` → `getByTitle` → CSS on a **semantic** attribute (`#id`, `[name=...]`, `[type=...]`).

- Always pass the accessible name to `getByRole`: `getByRole('button', { name: 'Purchase' })`.
- Prefer `getByRole(role, { name })` over `getByLabel`: `getByLabel` matches partially and can collide with other text.
- Resolve strict mode violations with `.filter()`, `.and()`, `.or()` or a parent locator (e.g. `page.getByRole('row').filter({ hasText: 'Samsung galaxy s6' })`).
- Declare each locator as a `readonly` field of a page object, initialized in the constructor. Specs call page object members only.
- Discover roles and accessible names from the real page, not by guessing.

Forbidden: XPath; CSS based on styling classes or nesting (`div > div:nth-child(3)`);
`.first()`, `.last()`, `.nth()`; `ElementHandle`, `page.$`, `page.$$`.

## Waiting

Wait by asserting content: `await expect(row).toBeVisible()` is the wait.
Trust actionability checks before each action. If a click must change the URL,
use `page.waitForURL()`.

Forbidden: `page.waitForTimeout()`; `waitForLoadState('networkidle')`;
`force: true`, which turns a real bug (an overlay, a disabled control) into a silent pass.

## Assertions

- Use the retrying matchers `expect(locator)` / `expect(page)` for all DOM state, always with `await`.
- For conditions without a retrying matcher, use `expect.poll()` or `expect().toPass()`.
- Reserve non-retrying matchers (`toBe`, `toEqual`, `toContain`, `toMatchObject`, `toHaveLength`) for resolved values: API responses, dialog messages, computed values.

Forbidden: one-shot DOM reads such as `expect(await locator.isVisible()).toBe(true)`,
`expect(await locator.textContent()).toBe(...)` or `expect(await locator.count()).toBe(n)`.
Also `page.$eval` / `page.$$eval` and selector-string methods (`page.click`,
`page.fill`, ...): use the `locator.*` equivalents.

## Structure and isolation

Each test passes alone and in any order, and owns its data.

- One behavior per `test()`. If the title needs "and also check...", split it.
- Repeated navigation and login go in `test.beforeEach`.
- `expect.soft()` when several independent facts on one screen should be reported together.
- `test.step()` is optional; use it only to label phases of a long end-to-end flow (e.g. purchase).

### Assertions live in the test

Every assertion about behavior goes in the `test()` body, so the test shows what it
checks without following calls. Page object methods **prepare** (log in, navigate,
fill a form, read a value) but do not verify.

Exception: `expect()` used as a **wait**, not as a claim (`toBeVisible()` so a modal
settles, or the `toPass()` guard for re-rendered rows).

Forbidden: sharing `Page`, `BrowserContext` or mutable state between tests via
`beforeAll` or module variables; `test.describe.serial()` to chain tests;
asserting on data of the shared public account.

## Naming

A failure report shows **titles, not paths**. Each level must locate the test on its own.

- **`test()` title**: `should <observable outcome>`, in product language.
  - ✅ `should show the product total in the purchase confirmation`
  - ❌ `purchase_flow`, `should work`, `should handle errors`
- Name the **behavior**, not the mechanics.
- If it only applies to a role or state, say so: `... as a guest`, `... when the cart is empty`.
- **`describe` title**: `<Screen> — <what>`, e.g. `Cart — item management`.
- **File name**: `tests/<screen>.spec.ts`, unique in the repo.

## Where each file goes

Add to the spec that already covers the screen. Start a new `tests/<screen>.spec.ts`
when the behavior is a self-contained flow with its own setup (a modal, the
purchase flow) or when the target file goes beyond 10 to 12 tests.

`tests/e2e.spec.ts` (tagged `@e2e`) holds full journeys across several screens;
use `test.step()` there to label each phase. Everything else goes to a focused spec.

New page objects go in `pages/`, one class per screen or modal: file in camelCase,
class in PascalCase (`contactModal.ts` → `ContactModal`). Navbar links live in
`NavBar`; do not redeclare them in other page objects.

Reusable data helpers (unique users, random suffixes, API setup) go in
`utils/dataFactory.ts`; fixed data (demo account, API URL) in `constants/testData.ts`.

## Code style

Format with Prettier (`.prettierrc.json`): single quotes, semicolons, 100 columns.
Run `npx prettier --write <files>` on every file you touch.

## Version control

Read the installed Playwright version in `package.json` before writing code and
do not use newer APIs: playwright.dev documents the latest release.

Installed version: `@playwright/test` 1.58.x. If `package.json` says otherwise,
trust `package.json` and say that this line needs updating.

Run Playwright with `npx playwright` (it resolves the local install).
