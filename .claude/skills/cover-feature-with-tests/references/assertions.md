# Oracles: what an assertion compares against

An **oracle** is the source of truth an assertion compares against. Picking the
wrong oracle is the most common way a generated test passes for the wrong reason,
or fails tomorrow when nothing changed.

## Why exact values are a weak oracle here

Demoblaze is a public demo shared by everyone on the internet. The catalog is
mostly static, but carts, users and orders are not: a hardcoded count or total
can pass today and fail when someone else touches the same account.

A gap phrased as "check that the cart shows 3 items" is not blocked: it is **the
wrong assertion**. Rewrite it with one of the oracles below. Use `blocked` only
when the behavior cannot be reached reliably.

Exception: if the test itself creates the data (adds "Samsung galaxy s6" to a
fresh cart), asserting that exact value is correct.

## UI: default oracle, UI vs. source data

The front end renders from `https://api.demoblaze.com`. Capture the response that
feeds the screen and compare what is displayed against it:

| Screen | Request that feeds it |
|---|---|
| Home catalog | `GET /entries` (and `POST /pagination` for next pages) |
| Category filter | `POST /bycat` |
| Product detail | `POST /view` |
| Cart | `POST /viewcart`, then `POST /view` per item |

```ts
const entries = page.waitForResponse('**/entries');
await page.goto('/');
const { Items } = await (await entries).json();
await expect(home.productTitles).toHaveText(Items.map((i) => i.title));
```

Confirm the exact request (method, path, body) in the real site before relying on
it: open DevTools or log `page.on('request')` once.

Limitation: this does not detect a wrong server response, because both sides come
from the same call. That is what invariants are for.

## Complement: invariants

Relationships that hold no matter the values:

- **Totals**: the cart total equals the sum of the row prices.
- **Cross-screen equality**: the "Amount" in the purchase confirmation equals the cart total; the price on the product detail equals the price on the home card and in the cart row.
- **Partition**: every product shown under Phones / Laptops / Monitors appears in the full catalog, and no product appears in two categories.
- **Shape and format**: prices are positive numbers, every card has an image, a title and a price.
- **Same-run stability**: reload and verify the same catalog.

## API: the response is the oracle

Call `https://api.demoblaze.com` with Playwright's `request` fixture and verify
the contract, not the data:

- **Status and shape**: required fields present (`id`, `title`, `price`, `cat`, `img`), correct types.
- **Error paths**: Demoblaze reports some errors in the response body rather than the status code (e.g. a wrong login). Discover the real behavior by calling the endpoint once, then assert what it actually does.
- **Round trip**: add an item, read the cart, verify it is there; delete it, read again, verify it is gone.

Use non-retrying matchers (`toBe`, `toEqual`, `toMatchObject`): the response is
already a resolved value.

## Shared state: own your data

- The account in `constants/testData.ts` is public. Anyone can change its cart at any time: never assert on its cart contents.
- Guests get their own cart, tied to a cookie in the browser context, so each test starts with a fresh one. Prefer guest carts for cart tests that do not need login (confirm this on the live site first).
- When a test needs a logged-in user with a known state, create a unique user for that test (random username) instead of reusing the shared one.
