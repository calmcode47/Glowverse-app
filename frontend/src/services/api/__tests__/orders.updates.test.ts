import * as OrdersAPI from "../orders.api";

describe("subscribeToOrderUpdates", () => {
  it("returns an unsubscribe function", () => {
    const unsub = OrdersAPI.subscribeToOrderUpdates("order_1", () => {});
    expect(typeof unsub).toBe("function");
    expect(() => unsub()).not.toThrow();
  });
});
