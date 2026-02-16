describe('Complete Purchase Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('completes purchase from browse to confirmation', async () => {
    await element(by.id('tabBar.shop')).tap();
    await expect(element(by.id('productListScreen'))).toBeVisible();
    await waitFor(element(by.id('productListScreen'))).toBeVisible().withTimeout(5000);

    // Open first product card if list testIDs are dynamic; fall back to first by label
    await element(by.id('productListScreen.productCard.0')).tap().catch(async () => {
      await element(by.type('RCTView')).atIndex(0).tap();
    });
    await expect(element(by.id('productDetailScreen'))).toBeVisible();

    await element(by.id('productDetailScreen.addToCartButton')).tap();

    await element(by.id('tabBar.cart')).tap();
    await expect(element(by.id('cartScreen'))).toBeVisible();

    await element(by.id('cartScreen.checkoutButton')).tap();
    await expect(element(by.id('checkoutScreen'))).toBeVisible();

    // Navigate steps and place order
    await element(by.label('Next')).tap();
    await element(by.label('Next')).tap();
    await element(by.id('checkoutScreen.placeOrderButton')).tap();
  });
});
