import AsyncStorage from "@react-native-async-storage/async-storage";
import * as AuthAPI from "../auth.api";
import * as ProductsAPI from "../products.api";
import * as CartAPI from "../cart.api";
import * as OrdersAPI from "../orders.api";

const run = process.env.RUN_INTEGRATION === "true";

(run ? describe : describe.skip)("Backend Integration", () => {
  describe("Auth Flow", () => {
    it("completes full auth flow", async () => {
      const email = `test_${Date.now()}@example.com`;
      const reg = await AuthAPI.register({ email, password: "Test123!", name: "Test User" });
      expect(reg.tokens.accessToken).toBeTruthy();
      await AsyncStorage.setItem("pcAuthToken", reg.tokens.accessToken);
      const me = await AuthAPI.getProfile();
      expect(me.user.email).toBe(email);
      await AuthAPI.logout();
      const login = await AuthAPI.login({ email, password: "Test123!" });
      expect(login.tokens.accessToken).toBeTruthy();
    });

    it("refreshes expired token", async () => {
      const login = await AuthAPI.login({ email: "test@example.com", password: "Test123!" });
      await AsyncStorage.setItem("pcAuthToken", "expired");
      await AsyncStorage.setItem("pcRefreshToken", login.tokens.refreshToken);
      const me = await AuthAPI.getProfile();
      expect(me.user.email).toBeDefined();
    });
  });

  describe("Shopping Flow", () => {
    beforeAll(async () => {
      const email = `shop_${Date.now()}@example.com`;
      const { tokens } = await AuthAPI.register({ email, password: "Test123!", name: "Shopper" });
      await AsyncStorage.setItem("pcAuthToken", tokens.accessToken);
      await AsyncStorage.setItem("pcRefreshToken", tokens.refreshToken);
    });

    it("completes full shopping flow", async () => {
      const list = await ProductsAPI.getProducts({ page: 1 });
      expect(list.products.length).toBeGreaterThan(0);
      const first = list.products[0];
      const item = await CartAPI.addItem({ productId: first.id, quantity: 1 });
      expect(item.productId).toBe(first.id);
      const promo = await CartAPI.applyPromoCode("SAVE10");
      expect(promo.discountAmount >= 0).toBe(true);
      const cart = await CartAPI.getCart();
      const order = await OrdersAPI.createOrder({
        items: cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddressId: "address_1",
        paymentMethod: "pm_test"
      });
      expect(order.id).toBeTruthy();
    });
  });

  describe("Error Handling", () => {
    it("handles 404 errors", async () => {
      await expect(ProductsAPI.getProductById("nonexistent")).rejects.toBeTruthy();
    });
    it("handles validation errors", async () => {
      await expect(CartAPI.addItem({ productId: "invalid", quantity: -1 })).rejects.toBeTruthy();
    });
  });
});

