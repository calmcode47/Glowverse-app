/* global device, element, by, waitFor, expect */

describe('Deep Linking Navigation', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  describe('Product Links', () => {
    it('opens product detail from product deep link', async () => {
      await device.openURL({ url: 'glowverse://product/product_123' });
      await waitFor(element(by.id('productDetailScreen'))).toBeVisible().withTimeout(8000);
      await expect(element(by.id('productDetailScreen.productName'))).toBeVisible();
    });

    it('handles invalid product id gracefully', async () => {
      await device.openURL({ url: 'glowverse://product/invalid_id' });
      await waitFor(element(by.text(/Product Unavailable/i))).toBeVisible().withTimeout(5000);
    });
  });

  describe('Protected Links', () => {
    it('redirects to login for protected order link', async () => {
      await device.openURL({ url: 'glowverse://order/order_123' });
      await waitFor(element(by.id('loginScreen'))).toBeVisible().withTimeout(5000);
    });
  });
});

