# AR SDK Migration Guide

## Overview

This guide documents the migration from **Expo managed workflow** to **Expo development builds** (prebuild) to enable native AR SDK integration for the virtual makeup try-on feature.

## Why Migration is Necessary

Expo's managed workflow provides excellent developer experience but has limitations:
- ❌ Cannot integrate custom native modules (AR SDKs)
- ❌ Cannot modify native build configurations (Podfile, build.gradle)
- ❌ Limited to Expo's predefined native APIs

**Expo Development Builds** (prebuild) offers the best of both worlds:
- ✅ Full access to native code and configuration
- ✅ Retain Expo developer experience (Expo Go replacement)
- ✅ Use EAS Build for CI/CD
- ✅ Keep all existing Expo modules working

## Prebuild vs Bare Workflow Comparison

| Feature | Managed | Development Builds (Prebuild) | Bare Workflow |
|---------|---------|------------------------------|---------------|
| Native code access | ❌ | ✅ | ✅ |
| Expo modules support | ✅ | ✅ | ✅ (with extra config) |
| Expo Go testing | ✅ | ❌ (need custom dev client) | ❌ |
| OTA updates | ✅ | ✅ (with EAS Updates) | ⚠️ (manual setup) |
| Build complexity | Low | Medium | High |
| Best for | Simple apps | Custom native features | Full control |

**Decision**: We're using **Development Builds** (prebuild) for optimal balance.

---

## Migration Steps

### Step 1: Install Expo CLI and EAS CLI

```bash
# Ensure you have the latest Expo CLI
npm install -g expo-cli@latest eas-cli@latest

# Login to Expo account
eas login
```

### Step 2: Configure EAS Build

EAS Build configuration is already present in [`eas.json`](file:///Users/mayank/Glowverse-app/frontend/eas.json). Verify it includes development profile:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    }
  }
}
```

### Step 3: Update app.json for Prebuild

Add the following plugins and configuration to [`app.json`](file:///Users/mayank/Glowverse-app/frontend/app.json):

```json
{
  "expo": {
    "plugins": [
      "expo-camera",
      "expo-media-library",
      "expo-notifications",
      [
        "expo-build-properties",
        {
          "ios": {
            "deploymentTarget": "13.0"
          },
          "android": {
            "minSdkVersion": 24,
            "compileSdkVersion": 34,
            "targetSdkVersion": 34
          }
        }
      ]
    ]
  }
}
```

### Step 4: Install Prerequisites

```bash
cd /Users/mayank/Glowverse-app/frontend

# Install expo-build-properties for native configuration
npx expo install expo-build-properties

# Install expo-dev-client for development builds
npx expo install expo-dev-client
```

### Step 5: Run Prebuild

This generates native iOS and Android directories:

```bash
# iOS and Android directories will be created
npx expo prebuild

# You can specify a platform if needed
# npx expo prebuild --platform ios
# npx expo prebuild --platform android
```

**Result**: You'll see new `ios/` and `android/` directories with full native projects.

### Step 6: Add to .gitignore

Since native directories are generated, add them to `.gitignore`:

```bash
# iOS
ios/

# Android
android/

# But keep custom native modules tracked
!ios/Glowverse/Modules/
!android/app/src/main/java/com/glowverse/modules/
```

Alternatively, you can commit native directories if you prefer version control over them.

---

## Development Workflow Changes

### Before (Managed Workflow)

```bash
# Development
expo start

# iOS simulator
npm run ios

# Android emulator  
npm run android

# Build
expo build:ios
expo build:android
```

### After (Development Builds)

```bash
# Development - create dev client first (one time)
eas build --profile development --platform ios
eas build --profile development --platform android

# Install the .ipa/.apk on your device/simulator
# Then start the dev server
npx expo start --dev-client

# Local builds (requires Xcode/Android Studio)
npx expo run:ios
npx expo run:android

# Production builds
eas build --profile production --platform all
```

---

## Dependency Compatibility

### Compatible Expo Modules

All existing Expo modules continue to work:
- ✅ `expo-camera`
- ✅ `expo-face-detector`
- ✅ `expo-media-library`
- ✅ `expo-notifications`
- ✅ `expo-blur`
- ✅ All others in package.json

### New Native Dependencies

AR SDK integration will add:
- iOS: AR SDK pod (e.g., `YouCamMakeupSDK` or `BanubaSDK`)
- Android: AR SDK maven dependencies
- Native bridge modules (custom code)

---

## OTA Updates with EAS Updates

Over-the-air updates still work with development builds via **EAS Updates**:

```bash
# Install EAS Updates
npx expo install expo-updates

# Configure eas.json for updates
{
  "build": {
    "production": {
      "channel": "production"
    }
  }
}

# Publish update
eas update --channel production --message "Bug fixes"
```

**Important**: Native code changes (SDK updates) require new builds. JS-only changes can use OTA updates.

---

## Testing Strategy

### Development Testing

1. **iOS Simulator** (local):
   ```bash
   npx expo run:ios
   ```

2. **Android Emulator** (local):
   ```bash
   npx expo run:android
   ```

3. **Physical Device**:
   ```bash
   # Build development client
   eas build --profile development --platform ios
   
   # Install on device, then start dev server
   npx expo start --dev-client
   ```

### Production Testing

```bash
# Internal distribution build
eas build --profile preview --platform all

# Submit to TestFlight/Internal Testing
eas submit --platform ios --profile preview
```

---

## Troubleshooting

### Issue: `expo-dev-client` not found

**Solution**: Install the package
```bash
npx expo install expo-dev-client
```

### Issue: Native module not found after prebuild

**Solution**: Clean and rebuild
```bash
rm -rf ios/ android/
npx expo prebuild --clean
npx expo run:ios
```

### Issue: Build fails on EAS

**Solution**: Check eas.json configuration and ensure all native dependencies are properly linked
```bash
eas build --profile development --platform ios --clear-cache
```

### Issue: Camera permission crashes app

**Solution**: Ensure `NSCameraUsageDescription` is in app.json (already configured)

---

## Rollback Plan

If migration causes issues, you can temporarily rollback:

```bash
# Remove native directories
rm -rf ios/ android/

# Remove development dependencies
npm uninstall expo-dev-client expo-build-properties

# Revert app.json changes

# Resume using Expo Go
expo start
```

However, AR functionality won't work without native code access.

---

## Next Steps

After successful migration:

1. ✅ Verify app builds on iOS and Android
2. ✅ Test all existing features still work
3. ✅ Add AR SDK native module integration
4. ✅ Update team documentation

---

## Resources

- [Expo Prebuild Documentation](https://docs.expo.dev/workflow/prebuild/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Updates Documentation](https://docs.expo.dev/eas-update/introduction/)
- [Custom Native Code](https://docs.expo.dev/workflow/customizing/)
