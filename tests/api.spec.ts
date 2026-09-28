import { test, expect, type APIRequestContext } from '@playwright/test';
import { API_URL as API } from '../constants/testData';

const PRODUCT_ID = 1;

// Each test creates its own guest cookie, so no test reads a cart that someone else can change.
function newGuestCookie(): string {
  return `user=${crypto.randomUUID()}`;
}

async function addToCart(request: APIRequestContext, cookie: string, itemId: string) {
  return request.post(`${API}/addtocart`, {
    data: { id: itemId, cookie, prod_id: PRODUCT_ID, flag: false },
  });
}

async function viewCart(request: APIRequestContext, cookie: string) {
  return request.post(`${API}/viewcart`, { data: { cookie, flag: false } });
}

async function deleteItem(request: APIRequestContext, itemId: string) {
  return request.post(`${API}/deleteitem`, { data: { id: itemId } });
}

test.describe('API — cart', () => {
  test('should list the added product in the guest cart', async ({ request }) => {
    const cookie = newGuestCookie();
    const itemId = crypto.randomUUID();

    const added = await addToCart(request, cookie, itemId);
    expect(added.status()).toBe(200);

    const cart = await viewCart(request, cookie);
    expect(cart.status()).toBe(200);
    const { Items } = await cart.json();
    expect(Items).toHaveLength(1);
    expect(Items[0]).toMatchObject({ id: itemId, prod_id: PRODUCT_ID });

    await deleteItem(request, itemId);
  });

  test('should empty the guest cart after deleting its only item', async ({ request }) => {
    const cookie = newGuestCookie();
    const itemId = crypto.randomUUID();
    await addToCart(request, cookie, itemId);
    // Demoblaze answers 200 even when an add fails, so confirm the item is there before deleting.
    const before = await (await viewCart(request, cookie)).json();
    expect(before.Items).toHaveLength(1);
    expect(before.Items[0]).toMatchObject({ id: itemId });

    const deleted = await deleteItem(request, itemId);
    expect(deleted.status()).toBe(200);
    expect(await deleted.json()).toBe('Item deleted.');

    const cart = await viewCart(request, cookie);
    expect(cart.status()).toBe(200);
    expect(await cart.json()).toEqual({ Items: [] });
  });

  test('should return an empty cart for a guest cookie that was never used', async ({
    request,
  }) => {
    const cart = await viewCart(request, newGuestCookie());

    expect(cart.status()).toBe(200);
    expect(await cart.json()).toEqual({ Items: [] });
  });
});

test.describe('API — catalog', () => {
  // /entries returns the first catalog page only (it is paginated with LastEvaluatedKey).
  test('should return catalog entries with id, title, positive price, category and image', async ({
    request,
  }) => {
    const response = await request.get(`${API}/entries`);
    expect(response.status()).toBe(200);

    const { Items } = await response.json();
    expect(Items.length).toBeGreaterThan(0);
    for (const item of Items) {
      expect(item).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          title: expect.stringMatching(/\S/),
          price: expect.any(Number),
          cat: expect.stringMatching(/^(phone|notebook|monitor)$/),
          img: expect.stringMatching(/\S/),
        })
      );
      expect(item.price).toBeGreaterThan(0);
    }
  });
});
