/* global device, element, by, waitFor */
import { TestIDs } from "./helpers/testIDs";
import { loginUser, addProductToCart } from "./helpers/testHelpers";

describe("Shopping Flow (Expanded)", () => {
  beforeAll(async () => {
    await device.reloadReactNative();
    await loginUser("test@glowverse.com", "Test123!");
  });

  it("completes checkout with card", async () => {
    await addProductToCart("1");
    await element(by.id(TestIDs.TAB_BAR.CART)).tap();
    await element(by.id(TestIDs.CART.CHECKOUT_BUTTON)).tap();
    await waitFor(element(by.id(TestIDs.CHECKOUT.SCREEN))).toBeVisible().withTimeout(3000);
    await element(by.id(TestIDs.CHECKOUT.SHIPPING_NAME_INPUT)).replaceText("John Doe");
    await element(by.id(TestIDs.CHECKOUT.PLACE_ORDER_BUTTON)).tap();
    // Confirmation screen title check (by visible text)
    await waitFor(element(by.text("Order Confirmed"))).toBeVisible().withTimeout(10000);
  });
});
