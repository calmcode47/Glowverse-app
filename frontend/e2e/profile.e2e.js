/* global device, element, by, waitFor, expect */
const { loginUser } = require('./helpers');

describe('Profile and Orders', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
    await loginUser();
  });

  it('should view order history', async () => {
    await element(by.id('profile-tab')).tap();
    await element(by.id('order-history-link')).tap();
    await waitFor(element(by.id('order-history-screen'))).toBeVisible();
    await expect(element(by.id('order-card-0'))).toBeVisible();
  });

  it('should view order details', async () => {
    await element(by.id('profile-tab')).tap();
    await element(by.id('order-history-link')).tap();
    await element(by.id('order-card-0')).tap();
    await waitFor(element(by.id('order-detail-screen'))).toBeVisible();
    await expect(element(by.id('order-number'))).toBeVisible();
    await expect(element(by.id('order-status'))).toBeVisible();
    await expect(element(by.id('order-timeline'))).toBeVisible();
  });

  it('should edit profile', async () => {
    await element(by.id('profile-tab')).tap();
    await element(by.id('edit-profile-button')).tap();
    await element(by.id('name-input')).clearText();
    await element(by.id('name-input')).typeText('Updated Name');
    await element(by.id('save-button')).tap();
    await waitFor(element(by.text('Profile updated'))).toBeVisible();
  });

  it('should add new address', async () => {
    await element(by.id('profile-tab')).tap();
    await element(by.id('addresses-link')).tap();
    await element(by.id('add-address-button')).tap();
    await element(by.id('street-input')).typeText('123 Main St');
    await element(by.id('city-input')).typeText('New York');
    await element(by.id('state-input')).typeText('NY');
    await element(by.id('postal-code-input')).typeText('10001');
    await element(by.id('save-address-button')).tap();
    await waitFor(element(by.text('123 Main St'))).toBeVisible();
  });
});

