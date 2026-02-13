describe('Authentication', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('shows home screen', async () => {
    await expect(element(by.id('home-screen'))).toBeVisible();
  });
});
