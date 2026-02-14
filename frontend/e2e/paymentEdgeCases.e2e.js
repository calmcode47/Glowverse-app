/* global device, element, by, waitFor, expect */
const { loginUser, navigateToCheckout, fillShippingInfo, fillPaymentInfo } = require('./helpers');

describe('Payment Edge Cases', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await loginUser();
  });

  it('handles generic card decline', async () => {
    await navigateToCheckout();
    await fillShippingInfo();
    await fillPaymentInfo('4000000000000002', '1228', '123');
    await element(by.id('continue-to-review')).tap();
    await element(by.id('place-order-button')).tap();
    await waitFor(element(by.id('paymentDeclinedScreen'))).toBeVisible().withTimeout(10000);
  });
});

