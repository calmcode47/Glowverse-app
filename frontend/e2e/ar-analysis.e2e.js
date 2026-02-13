/* global device, element, by, waitFor, expect */
const { loginUser } = require('./helpers');

describe('AR Try-On and Analysis', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    await loginUser();
    await device.launchApp({ permissions: { camera: 'YES', photos: 'YES' }, newInstance: true });
  });

  it('should open virtual try-on from product', async () => {
    await element(by.id('shop-tab')).tap();
    await element(by.id('product-card-0')).tap();
    await element(by.id('try-on-button')).tap();
    await waitFor(element(by.id('virtual-tryon-screen'))).toBeVisible();
    await expect(element(by.id('camera-view'))).toBeVisible();
  });

  it('should capture try-on photo', async () => {
    await element(by.id('shop-tab')).tap();
    await element(by.id('product-card-0')).tap();
    await element(by.id('try-on-button')).tap();
    await waitFor(element(by.id('capture-button'))).toBeVisible();
    await element(by.id('capture-button')).tap();
    await waitFor(element(by.id('processing-indicator'))).toBeVisible().withTimeout(2000);
    await waitFor(element(by.id('tryon-result'))).toBeVisible().withTimeout(30000);
  });

  it('should perform skin analysis', async () => {
    await element(by.id('profile-tab')).tap();
    await element(by.id('skin-analysis-link')).tap();
    await element(by.id('start-analysis-button')).tap();
    await waitFor(element(by.id('camera-view'))).toBeVisible();
    await element(by.id('capture-button')).tap();
    await waitFor(element(by.id('analysis-results-screen'))).toBeVisible().withTimeout(30000);
    await expect(element(by.id('hydration-score'))).toBeVisible();
    await expect(element(by.id('clarity-score'))).toBeVisible();
    await expect(element(by.id('texture-score'))).toBeVisible();
  });
});

