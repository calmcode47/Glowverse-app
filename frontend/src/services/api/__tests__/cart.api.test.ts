import { getCart, addItem, updateItemQuantity, removeItem, clearCart, applyPromoCode } from "../cart.api";

jest.mock("../client", () => {
  return {
    client: {
      get: jest.fn(async () => ({
        data: {
          cart: {
            id: "c1",
            items: [
              {
                id: "i1",
                productId: "p1",
                product: { id: "p1", name: "Lipstick", brand: "Brand", category: "lipstick", price: 29.99, rating: 4, reviews: 10, inStock: true },
                quantity: 2,
                price: 29.99,
                total: 59.98
              }
            ],
            subtotal: 59.98,
            tax: 0,
            shipping: 0,
            total: 59.98,
            itemCount: 2,
            promo: { code: "SAVE10", discountType: "percentage", discountValue: 10, discountAmount: 5.99, description: "Ten off" }
          }
        }
      })),
      post: jest.fn(async (_url: string, body: any) => {
        if (_url.endsWith("/promo")) {
          return { data: { code: body.code, discountType: "percentage", discountValue: 20, discountAmount: 12, description: "Promo" } };
        }
        return {
          data: {
            id: "i2",
            productId: body.productId,
            product: { id: body.productId, name: "Gloss", brand: "Brand", category: "lipgloss", price: 19.99, rating: 5, reviews: 2, inStock: true },
            quantity: body.quantity,
            price: 19.99,
            total: 19.99 * body.quantity
          }
        };
      }),
      patch: jest.fn(async (_url: string, body: any) => ({
        data: {
          id: "i1",
          productId: "p1",
          product: { id: "p1", name: "Lipstick", brand: "Brand", category: "lipstick", price: 29.99, rating: 4, reviews: 10, inStock: true },
        quantity: body.quantity,
          price: 29.99,
          total: 29.99 * body.quantity
        }
      })),
      delete: jest.fn(async () => ({ data: { ok: true } }))
    }
  };
});

describe("cart.api", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("maps cart response correctly", async () => {
    const c = await getCart();
    expect(c.id).toBe("c1");
    expect(c.items.length).toBe(1);
    expect(c.subtotal).toBeCloseTo(59.98);
    expect(c.total).toBeCloseTo(59.98);
    expect(c.itemCount).toBe(2);
    expect(c.promo?.code).toBe("SAVE10");
  });

  it("adds item and maps result", async () => {
    const it = await addItem({ productId: "p2", quantity: 1 });
    expect(it.productId).toBe("p2");
    expect(it.quantity).toBe(1);
    expect(it.total).toBeCloseTo(19.99);
  });

  it("updates item quantity", async () => {
    const it = await updateItemQuantity("i1", 3);
    expect(it.id).toBe("i1");
    expect(it.quantity).toBe(3);
    expect(it.total).toBeCloseTo(29.99 * 3);
  });

  it("removes item and clears cart without error", async () => {
    await expect(removeItem("i1")).resolves.toBeUndefined();
    await expect(clearCart()).resolves.toBeUndefined();
  });

  it("applies promo code", async () => {
    const p = await applyPromoCode("SAVE20");
    expect(p.code).toBe("SAVE20");
    expect(p.discountType).toBe("percentage");
    expect(p.discountAmount).toBe(12);
  });
});
