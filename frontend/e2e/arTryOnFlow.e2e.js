describe('AR Virtual Try-On Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('applies product and captures screenshot', async () => {
    await element(by.id('tabBar.home')).tap();
    // Navigate to AR from a button or direct route if present; fallback to screen id
    await device.launchApp({ url: 'glowverse://ar' }).catch(() => {});
    await waitFor(element(by.id('ar-camera-view'))).toBeVisible().withTimeout(8000);

    await element(by.id('tryon-apply')).tap();
    await waitFor(element(by.id('tryon-capture'))).toBeVisible().withTimeout(5000);
    await element(by.id('tryon-capture')).tap();

    await element(by.id('tryon-cart')).tap();
  });
});
