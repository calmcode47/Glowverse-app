# Deep Link Association Files Setup

## Overview

This directory contains the association files required for iOS Universal Links and Android App Links.

**IMPORTANT**: These files must be hosted on your production domain at specific paths.

---

## Files

### 1. `apple-app-site-association` (iOS Universal Links)

**Host at**: `https://glowverse.app/.well-known/apple-app-site-association`

**Requirements**:
- ✅ HTTPS only (no HTTP)
- ✅ No file extension (no `.json`)
- ✅ Content-Type: `application/json`
- ✅ Response time < 500ms
- ✅ Max size: 128KB

**Configuration Needed**:
Replace `TEAM_ID` with your Apple Team ID (format: `XXXXXXXXXX`)

**How to find Team ID**:
1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Navigate to Membership
3. Copy your Team ID

**Testing**:
```bash
# Verify file is accessible
curl -I https://glowverse.app/.well-known/apple-app-site-association

# Should return:
# HTTP/2 200
# Content-Type: application/json
```

**Validation**:
- Use Apple's [AASA Validator](https://search.developer.apple.com/appsearch-validation-tool/)
- Enter your domain: `glowverse.app`
- Verify all paths are recognized

---

### 2. `assetlinks.json` (Android App Links)

**Host at**: `https://glowverse.app/.well-known/assetlinks.json`

**Requirements**:
- ✅ HTTPS only
- ✅ Content-Type: `application/json`
- ✅ Must include SHA-256 fingerprints

**Configuration Needed**:
Replace SHA-256 fingerprints with your app signing certificates.

**How to get SHA-256 fingerprints**:

**Debug keystore**:
```bash
keytool -list -v -keystore ~/.android/debug.keystore \
  -alias androiddebugkey \
  -storepass android \
  -keypass android \
  | grep "SHA256:"
```

**Release keystore**:
```bash
keytool -list -v -keystore /path/to/release.keystore \
  -alias your-key-alias \
  | grep "SHA256:"
```

**Google Play Console** (if using App Signing):
1. Go to Play Console → Your App → Setup → App Signing
2. Copy SHA-256 certificate fingerprint

**Testing**:
```bash
# Verify file is accessible
curl https://glowverse.app/.well-known/assetlinks.json

# Should return JSON with your fingerprints
```

**Validation**:
- Use Google's [Statement List Generator and Tester](https://developers.google.com/digital-asset-links/tools/generator)
- Enter hosting site: `https://glowverse.app`
- Verify it recognizes your app

---

## Deployment Checklist

- [ ] Replace `TEAM_ID` in `apple-app-site-association`
- [ ] Replace SHA-256 fingerprints in `assetlinks.json`
- [ ] Deploy files to production backend
- [ ] Verify HTTPS access for both files
- [ ] Check Content-Type headers are `application/json`
- [ ] Validate using Apple's AASA tool
- [ ] Validate using Google's Asset Links tool
- [ ] Test Universal Links on iOS device
- [ ] Test App Links on Android device

---

## Common Issues

### iOS: Universal Links not working

**Issue**: App doesn't open from Safari links

**Solutions**:
1. Verify AASA file is accessible via HTTPS
2. Check Content-Type is `application/json`
3. Ensure Team ID is correct
4. Rebuild app after updating `app.json`
5. Test on physical device (not simulator)
6. Long-press link → Should show "Open in Glowverse"

### Android: App Links not verified

**Issue**: Links open in browser instead of app

**Solutions**:
1. Verify assetlinks.json is accessible
2. Check SHA-256 fingerprints match signing certificate
3. Ensure `autoVerify: true` in intent filters
4. Wait 24-48 hours for Google to verify
5. Check verification status:
   ```bash
   adb shell pm get-app-links com.glowverse.app
   ```
6. Manually verify if needed:
   ```bash
   adb shell pm verify-app-links --re-verify com.glowverse.app
   ```

---

## Security Notes

1. **HTTPS Required**: Never use HTTP for association files
2. **No Redirects**: Files must be served directly (no 301/302)
3. **CORS**: Not required for association files
4. **Caching**: Can cache with short TTL (e.g., 1 hour)
5. **Updates**: Changes require app reinstall to take effect

---

## Support Links

- [Apple Universal Links Documentation](https://developer.apple.com/ios/universal-links/)
- [Android App Links Documentation](https://developer.android.com/training/app-links)
- [AASA Validator](https://search.developer.apple.com/appsearch-validation-tool/)
- [Asset Links Tester](https://developers.google.com/digital-asset-links/tools/generator)

Last Updated: February 19, 2026
