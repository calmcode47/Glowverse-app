/* global device, element, by, waitFor, expect */
const { loginUser } = require('./helpers');

describe('Shopping Journey', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await loginUser();
  });

  it('should browse products and view details', async () => {
    await element(by.id('shop-tab')).tap();
    await waitFor(element(by.id('shop-screen'))).toBeVisible().withTimeout(5000);
    await element(by.id('product-list')).scroll(200, 'down');
    await element(by.id('product-card-0')).tap();
    await expect(element(by.id('product-detail-screen'))).toBeVisible();
    await expect(element(by.id('product-name'))).toBeVisible();
    await expect(element(by.id('product-price'))).toBeVisible();
    await expect(element(by.id('add-to-cart-button'))).toBeVisible();
  });

  it('should add product to cart', async () => {
    await element(by.id('shop-tab')).tap();
    await element(by.id('product-card-0')).tap();
    await element(by.id('add-to-cart-button')).tap();
    await expect(element(by.id('cart-badge'))).toHaveText('1');
    await element(by.id('cart-tab')).tap();
    await expect(element(by.id('cart-item-0'))).toBeVisible();
  });

  it('should complete checkout flow', async () => {
    await element(by.id('shop-tab')).tap();
    await element(by.id('product-card-0')).tap();
    await element(by.id('add-to-cart-button')).tap();
    await element(by.id('cart-tab')).tap();
    await expect(element(by.id('cart-item-0'))).toBeVisible();
    await element(by.id('checkout-button')).tap();

    await waitFor(element(by.id('shipping-step'))).toBeVisible();
    await element(by.id('address-option-0')).tap();
    await element(by.id('continue-to-payment')).tap();

    await waitFor(element(by.id('payment-step'))).toBeVisible();
    await element(by.id('card-number-input')).typeText('4242424242424242');
    await element(by.id('card-expiry-input')).typeText('1228');
    await element(by.id('card-cvc-input')).typeText('123');
    await element(by.id('continue-to-review')).tap();

    await waitFor(element(by.id('review-step'))).toBeVisible();
    await element(by.id('terms-checkbox')).tap();
    await element(by.id('place-order-button')).tap();

    await waitFor(element(by.id('order-confirmation-screen'))).toBeVisible().withTimeout(10000);
    await expect(element(by.id('order-number'))).toBeVisible();
  });

  it('should update cart quantity', async () => {
    await element(by.id('shop-tab')).tap();
    await element(by.id('product-card-0')).tap();
    await element(by.id('add-to-cart-button')).tap();
    await element(by.id('cart-tab')).tap();
    await element(by.id('quantity-increase-0')).tap();
    await expect(element(by.id('quantity-value-0'))).toHaveText('2');
    await expect(element(by.id('cart-total'))).not.toHaveText('$0.00');
  });

  it('should remove item from cart', async () => {
    await element(by.id('shop-tab')).tap();
    await element(by.id('product-card-0')).tap();
    await element(by.id('add-to-cart-button')).tap();
    await element(by.id('cart-tab')).tap();
    await element(by.id('remove-item-0')).tap();
    await element(by.text('Remove')).tap();
    await expect(element(by.id('empty-cart'))).toBeVisible();
  });

  it('should apply promo code', async () => {
    await element(by.id('shop-tab')).tap();
    await element(by.id('product-card-0')).tap();
    await element(by.id('add-to-cart-button')).tap();
    await element(by.id('cart-tab')).tap();
    const totalBefore = await element(by.id('cart-total')).getText();
    await element(by.id('promo-input')).typeText('SAVE20');
    await element(by.id('apply-promo-button')).tap();
    await waitFor(element(by.id('promo-applied'))).toBeVisible();
    await expect(element(by.id('cart-total'))).not.toHaveText(totalBefore);
  });

  it('should search for products', async () => {
    await element(by.id('search-tab')).tap();
    await element(by.id('search-input')).typeText('lipstick');
    await element(by.id('search-input')).tapReturnKey();
    await waitFor(element(by.id('search-results'))).toBeVisible();
    await expect(element(by.id('product-card-0'))).toBeVisible();
  });

  it('should filter products', async () => {
    await element(by.id('shop-tab')).tap();
    await element(by.id('filter-button')).tap();
    await element(by.id('category-makeup')).tap();
    await element(by.id('apply-filters-button')).tap();
    await waitFor(element(by.id('product-list'))).toBeVisible();
  });
});

