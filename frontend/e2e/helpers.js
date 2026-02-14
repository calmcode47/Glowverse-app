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

export const navigateToCheckout = async () => {
  await element(by.id('shop-tab')).tap();
  await element(by.id('product-card-0')).tap();
  await element(by.id('add-to-cart-button')).tap();
  await element(by.id('cart-tab')).tap();
  await element(by.id('checkout-button')).tap();
};

export const fillShippingInfo = async () => {
  await waitFor(element(by.id('shipping-step'))).toBeVisible().withTimeout(5000);
  await element(by.id('address-option-0')).tap();
  await element(by.id('continue-to-payment')).tap();
};

export const fillPaymentInfo = async (cardNumber = '4242424242424242', expiry = '1228', cvc = '123') => {
  await waitFor(element(by.id('payment-step'))).toBeVisible().withTimeout(5000);
  await element(by.id('card-number-input')).replaceText(cardNumber);
  await element(by.id('card-expiry-input')).replaceText(expiry);
  await element(by.id('card-cvc-input')).replaceText(cvc);
};
