/* global device, element, by, waitFor */

export const loginUser = async (email = 'test@example.com', password = 'password123') => {
  await element(by.id('login-email')).replaceText(email);
  await element(by.id('login-password')).replaceText(password);
  await element(by.id('login-button')).tap();
  await waitFor(element(by.id('home-screen'))).toBeVisible().withTimeout(8000);
};

export const addProductToCart = async (productIndex = 0) => {
  await element(by.id('shop-tab')).tap();
  await element(by.id(`product-card-${productIndex}`)).tap();
  await element(by.id('add-to-cart-button')).tap();
  await element(by.id('cart-tab')).tap();
};

export const scrollToElement = async (elementId, direction = 'down', distance = 200) => {
  await element(by.id(elementId)).scroll(distance, direction);
};

