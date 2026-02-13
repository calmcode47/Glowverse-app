describe('Shopping Flow', () => {
  beforeAll(async () => {
    await device.reloadReactNative?.();
  });

  it('navigates to Shop and displays grid', async () => {
    await element(by.id('shop-tab')).tap();
    await expect(element(by.text('Shop'))).toBeVisible();
  });
});
