/* global device, element, by, waitFor */
import { TestIDs } from "./helpers/testIDs";

describe("Authentication (Expanded)", () => {
  beforeAll(async () => {
    await device.reloadReactNative();
  });

  it("logs in successfully", async () => {
    await element(by.id(TestIDs.LOGIN.EMAIL_INPUT)).replaceText("test@glowverse.com");
    await element(by.id(TestIDs.LOGIN.PASSWORD_INPUT)).replaceText("Test123!");
    await element(by.id(TestIDs.LOGIN.SUBMIT_BUTTON)).tap();
    await waitFor(element(by.id(TestIDs.PROFILE.SCREEN))).toBeVisible().withTimeout(5000);
  });

  it("shows error for invalid credentials", async () => {
    await device.reloadReactNative();
    await element(by.id(TestIDs.LOGIN.EMAIL_INPUT)).replaceText("invalid@test.com");
    await element(by.id(TestIDs.LOGIN.PASSWORD_INPUT)).replaceText("wrongpass");
    await element(by.id(TestIDs.LOGIN.SUBMIT_BUTTON)).tap();
    await waitFor(element(by.id(TestIDs.COMMON.ERROR_MESSAGE))).toBeVisible().withTimeout(3000);
  });
});
