/* global device, element, by, waitFor, expect */

describe('Accessibility', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('shows key controls on login', async () => {
    await waitFor(element(by.id('loginScreen'))).toBeVisible().withTimeout(5000);
    await expect(element(by.id('loginScreen.emailInput'))).toBeVisible();
    await expect(element(by.id('loginScreen.passwordInput'))).toBeVisible();
    await expect(element(by.id('loginScreen.submitButton'))).toBeVisible();
  });

  it('meets touch target for add-to-cart button', async () => {
    await element(by.id('shop-tab')).tap();
    await element(by.id('product-card-0')).tap();
    await waitFor(element(by.id('productDetailScreen'))).toBeVisible().withTimeout(5000);
    const attrs = await element(by.id('productDetailScreen.addToCartButton')).getAttributes();
    expect(attrs.frame.height).toBeGreaterThanOrEqual(device.getPlatform() === 'ios' ? 44 : 48);
    expect(attrs.frame.width).toBeGreaterThanOrEqual(device.getPlatform() === 'ios' ? 44 : 48);
  });
});

