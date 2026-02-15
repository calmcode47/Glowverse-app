# Deep Linking Manual Testing Checklist

## Test Device Setup

### iOS Devices
- [ ] iPhone 13 (iOS 15)
- [ ] iPhone 14 (iOS 16)
- [ ] iPhone 15 (iOS 17)
- [ ] iPad Pro (latest iOS)

### Android Devices
- [ ] Pixel 6 (Android 12)
- [ ] Samsung Galaxy S22 (Android 13)
- [ ] OnePlus 10 (Android 14)
- [ ] Android Tablet

---

## Test Scenarios

### 1. Product Deep Links

#### Test Case: Valid Product
- **URL**: `https://glowverse.app/products/prod_123`
- **Expected**: Navigate to ProductDetail screen
- **Steps**:
  1. Send link via email/SMS
  2. Tap link from email/SMS
  3. Verify app opens directly (no browser)
  4. Verify ProductDetail screen loads with correct product
  5. Verify product data is displayed

**Results**:
- [ ] iOS - Safari
- [ ] iOS - Chrome
- [ ] Android - Chrome
- [ ] Android - Default Browser

#### Test Case: Invalid Product
- **URL**: `https://glowverse.app/products/invalid_123`
- **Expected**: Show InvalidLinkScreen
- **Results**:
  - [ ] iOS
  - [ ] Android

---

### 2. Referral Links

#### Test Case: Valid Referral Code
- **URL**: `https://glowverse.app/refer/FRIEND2024`
- **Expected**: Navigate to ReferralSignup with code pre-filled
- **Results**:
  - [ ] iOS
  - [ ] Android

#### Test Case: Expired Referral Code
- **URL**: `https://glowverse.app/refer/EXPIRED2023`
- **Expected**: Show LinkExpiredScreen
- **Results**:
  - [ ] iOS
  - [ ] Android

---

### 3. Order Tracking Links

#### Test Case: Authenticated User
- **URL**: `https://glowverse.app/orders/order_456/track`
- **Precondition**: User logged in
- **Expected**: Navigate to OrderTracking screen
- **Results**:
  - [ ] iOS
  - [ ] Android

#### Test Case: Unauthenticated User
- **URL**: `https://glowverse.app/orders/order_456/track`
- **Precondition**: User not logged in
- **Expected**: Navigate to Login, then redirect after login
- **Results**:
  - [ ] iOS
  - [ ] Android

---

### 4. Password Reset Links

#### Test Case: Valid Token
- **URL**: `https://glowverse.app/reset-password?token=reset_789`
- **Expected**: Navigate to ResetPassword screen
- **Results**:
  - [ ] iOS
  - [ ] Android

#### Test Case: Expired Token
- **URL**: `https://glowverse.app/reset-password?token=expired_456`
- **Expected**: Show LinkExpiredScreen
- **Results**:
  - [ ] iOS
  - [ ] Android

---

### 5. Shared Cart Links

#### Test Case: Valid Cart
- **URL**: `https://glowverse.app/cart/shared/cart_abc`
- **Expected**: Navigate to SharedCart screen with items loaded
- **Results**:
  - [ ] iOS
  - [ ] Android

---

### 6. AR Session Links

#### Test Case: Valid Session
- **URL**: `https://glowverse.app/ar-share/session_xyz`
- **Expected**: Navigate to ARShare screen with session loaded
- **Results**:
  - [ ] iOS
  - [ ] Android

---

## App States

### Cold Start (App Not Running)
- [ ] iOS - Tap link from Safari
- [ ] iOS - Tap link from Messages
- [ ] Android - Tap link from Chrome
- [ ] Android - Tap link from Messages

### Warm Start (App in Background)
- [ ] iOS - Switch from Safari to app via link
- [ ] Android - Switch from Chrome to app via link

### Foreground (App Active)
- [ ] iOS - Tap link while app is open
- [ ] Android - Tap link while app is open

---

## Delivery Methods

### Email Links
- [ ] Gmail app (iOS)
- [ ] Gmail app (Android)
- [ ] Apple Mail (iOS)
- [ ] Outlook (iOS/Android)

### SMS Links
- [ ] Messages (iOS)
- [ ] Messages (Android)
- [ ] WhatsApp (iOS/Android)

### QR Codes
- [ ] Scan QR code with Camera (iOS)
- [ ] Scan QR code with Camera (Android)
- [ ] Scan QR code with third-party app

### Social Media
- [ ] Instagram (iOS/Android)
- [ ] Facebook (iOS/Android)
- [ ] Twitter (iOS/Android)

### Browser
- [ ] Copy/paste into Safari (iOS)
- [ ] Copy/paste into Chrome (Android)
- [ ] Universal Clipboard (iOS)

---

## Network Conditions

### Online
- [ ] WiFi connection
- [ ] 4G/5G cellular

### Offline
- [ ] Airplane mode enabled
- [ ] No internet connection

### Slow Connection
- [ ] 3G simulation
- [ ] Throttled network

---

## Validation Checklist

For each test, verify:
- [ ] App opens correctly from link
- [ ] Correct screen is displayed
- [ ] Parameters are passed correctly
- [ ] Data is pre-fetched if required
- [ ] Authentication is handled properly
- [ ] Analytics event is fired
- [ ] Error states are displayed appropriately
- [ ] No navigation glitches or crashes
- [ ] Performance is acceptable (< 2s to navigate)

---

## Platform-Specific Tests

### iOS Only
- [ ] Universal Links work in Safari
- [ ] Fallback to custom scheme if AASA fails
- [ ] Long-press link shows "Open in Glowverse"
- [ ] Links work across devices (Handoff)

### Android Only
- [ ] App Links verified in Settings
- [ ] Intent resolution works correctly
- [ ] Auto-verify is enabled
- [ ] Link handling priority is correct

---

## Bug Report Template

**Bug Title**: [Brief description]

**Device**: [iPhone 15 / Pixel 6 / etc.]
**OS Version**: [iOS 17 / Android 13 / etc.]
**App Version**: [1.0.0]

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**:

**Actual Behavior**:

**Screenshots/Video**:

**Additional Context**:

---

## Performance Benchmarks

Measure time from link tap to screen display:

| Link Type | iOS Time | Android Time | Status |
|-----------|----------|--------------|--------|
| Product | ___ ms | ___ ms | [ ] |
| Referral | ___ ms | ___ ms | [ ] |
| Order | ___ ms | ___ ms | [ ] |
| Reset | ___ ms | ___ ms | [ ] |

**Target**: < 2000ms

---

## Regression Tests

After deployment, re-test critical paths:
- [ ] Product links (most common)
- [ ] Referral links (marketing campaigns)
- [ ] Reset password (user support)
- [ ] Order tracking (customer service)
