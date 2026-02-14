/* global device, element, by, waitFor */
import { TestIDs } from "./testIDs";

export const loginUser = async (email, password) => {
  await element(by.id(TestIDs.LOGIN.EMAIL_INPUT)).replaceText(email);
  await element(by.id(TestIDs.LOGIN.PASSWORD_INPUT)).replaceText(password);
  await element(by.id(TestIDs.LOGIN.SUBMIT_BUTTON)).tap();
  await waitFor(element(by.id(TestIDs.PROFILE.SCREEN))).toBeVisible().withTimeout(8000);
};

export const addProductToCart = async (productId) => {
  await element(by.id(TestIDs.PRODUCT_LIST.PRODUCT_CARD(productId))).tap();
  await element(by.id(TestIDs.PRODUCT_DETAIL.ADD_TO_CART_BUTTON)).tap();
};
