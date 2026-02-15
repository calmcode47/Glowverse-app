import AsyncStorage from "@react-native-async-storage/async-storage";
import { products as localProducts } from "../../../data/products";
import { getCart, addItem, updateItemQuantity, removeItem, clearCart, applyPromoCode, removePromoCode } from "../cart.api";

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
  beforeEach(async () => {
    jest.clearAllMocks();
    await (AsyncStorage as any).clear();
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

  it("falls back to AsyncStorage cart when API fails", async () => {
    const { client } = require("../client");
    client.get.mockRejectedValueOnce(new Error("Network error"));
    await AsyncStorage.setItem("demo_cart", JSON.stringify({
      id: "demo",
      items: [
        { id: "ci_1", productId: "p_demo", product: { id: "p_demo", name: "Demo", brand: "Brand", category: "tech", price: 10, rating: 0, reviews: 0, inStock: true, description: "", features: [] }, quantity: 2, price: 10, total: 20 }
      ]
    }));
    const c = await getCart();
    expect(c.id).toBe("demo");
    expect(c.itemCount).toBe(2);
    expect(c.subtotal).toBe(20);
    expect(c.total).toBe(20);
  });

  it("adds item via AsyncStorage fallback when API fails", async () => {
    const { client } = require("../client");
    client.post.mockRejectedValueOnce(new Error("Network error"));
    const productId = localProducts[0].id;
    const it = await addItem({ productId, quantity: 1 });
    expect(it.productId).toBe(productId);
    expect(it.quantity).toBe(1);
    client.get.mockRejectedValueOnce(new Error("Network error"));
    const c = await getCart();
    expect(c.items.some((x) => x.productId === productId)).toBe(true);
    expect(c.itemCount).toBeGreaterThan(0);
  });

  it("updates quantity via AsyncStorage fallback when API fails", async () => {
    const { client } = require("../client");
    await AsyncStorage.setItem("demo_cart", JSON.stringify({
      id: "demo",
      items: [
        { id: "ci_1", productId: localProducts[0].id, product: localProducts[0], quantity: 2, price: localProducts[0].price, total: localProducts[0].price * 2 }
      ]
    }));
    client.patch.mockRejectedValueOnce(new Error("Network error"));
    const it = await updateItemQuantity("ci_1", 0);
    expect(it.id).toBe("ci_1");
    expect(it.quantity).toBe(1);
    expect(it.total).toBeCloseTo(it.price * it.quantity);
  });

  it("removes item via AsyncStorage fallback when API fails", async () => {
    const { client } = require("../client");
    await AsyncStorage.setItem("demo_cart", JSON.stringify({
      id: "demo",
      items: [
        { id: "ci_1", productId: localProducts[0].id, product: localProducts[0], quantity: 1, price: localProducts[0].price, total: localProducts[0].price },
        { id: "ci_2", productId: localProducts[1].id, product: localProducts[1], quantity: 1, price: localProducts[1].price, total: localProducts[1].price }
      ]
    }));
    client.delete.mockRejectedValueOnce(new Error("Network error"));
    await removeItem("ci_1");
    const raw = await AsyncStorage.getItem("demo_cart");
    const stored = raw ? JSON.parse(raw) : null;
    expect(stored.items.some((x: any) => String(x.id) === "ci_1")).toBe(false);
  });

  it("clears cart via AsyncStorage fallback when API fails", async () => {
    const { client } = require("../client");
    client.delete.mockRejectedValueOnce(new Error("Network error"));
    await clearCart();
    const raw = await AsyncStorage.getItem("demo_cart");
    const stored = raw ? JSON.parse(raw) : null;
    expect(stored.items.length).toBe(0);
    expect(stored.itemCount).toBe(0);
    expect(stored.total).toBe(0);
  });

  it("applies and removes promo via AsyncStorage fallback when API fails", async () => {
    const { client } = require("../client");
    const product = localProducts[0];
    await AsyncStorage.setItem("demo_cart", JSON.stringify({
      id: "demo",
      items: [{ id: "ci_1", productId: product.id, product, quantity: 2, price: product.price, total: product.price * 2 }]
    }));
    client.post.mockRejectedValueOnce(new Error("Network error"));
    const promo = await applyPromoCode("DEMO10");
    expect(promo.code).toBe("DEMO10");
    expect(promo.discountType).toBe("percentage");
    expect(promo.discountValue).toBe(10);

    client.delete.mockRejectedValueOnce(new Error("Network error"));
    await removePromoCode();
    const raw = await AsyncStorage.getItem("demo_cart");
    const stored = raw ? JSON.parse(raw) : null;
    expect(stored.promo).toBeUndefined();
  });
});
