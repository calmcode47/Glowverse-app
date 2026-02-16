describe('AI Skin Analysis Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
  });

  it('uploads photo and shows analysis results', async () => {
    await element(by.id('tabBar.profile')).tap();
    await waitFor(element(by.id('profileScreen'))).toBeVisible().withTimeout(5000);
    await element(by.id('skin-analysis-button')).tap().catch(() => {});
    await element(by.id('upload-photo-button')).tap().catch(() => {});
    await waitFor(element(by.id('analysis-results-screen'))).toBeVisible().withTimeout(20000);
    await expect(element(by.id('skin-score'))).toBeVisible();
    await element(by.id('recommendations-section')).swipe('up').catch(() => {});
  });
});
