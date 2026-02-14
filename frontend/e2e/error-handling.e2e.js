/* global device, element, by, waitFor */
import { TestIDs } from "./helpers/testIDs";
import { addProductToCart } from "./helpers/testHelpers";

describe("Error Handling (Network)", () => {
  beforeAll(async () => {
    await device.reloadReactNative();
  });

  it("handles network error during add to cart", async () => {
    await device.setURLBlacklist(["**/cart/items**"]);
    await addProductToCart("1");
    await waitFor(element(by.id(TestIDs.COMMON.ERROR_MESSAGE))).toBeVisible().withTimeout(3000);
    await device.setURLBlacklist([]);
  });
});
