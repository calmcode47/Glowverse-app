# AR SDK Setup Guide

Complete guide for setting up AR features in Glowverse using Perfect Corp SDK or API fallback.

## Overview

Glowverse AR features support two modes:

| Mode | Environment | Performance | Setup Required |
|------|------------|-------------|----------------|
| **API Mode** (Default) | Expo Go | Good | ✅ None |
| **Native Mode** (Advanced) | Development Build | Excellent | ⚠️ Perfect Corp SDK |

---

## Quick Start: API Mode (Recommended)

API mode works immediately without any setup:

```bash
cd frontend
npx expo start
# Scan QR code with Expo Go
# AR features work via backend API
```

✅ **Ready to use** - No additional configuration needed!

---

## Advanced: Native SDK Mode

For on-device AR processing with Perfect Corp's native SDK.

### Prerequisites

- ✅ Perfect Corp SDK license & files
- ✅ Expo Development Build setup
- ✅ iOS/Android development environment

### Installation

#### 1. Obtain Perfect Corp SDK

Contact Perfect Corp for:
- iOS SDK framework (`.xcframework`)
- Android SDK (`.aar` file)
- License key

#### 2. iOS Setup

```bash
# Copy SDK framework
cp PerfectCorp.xcframework frontend/modules/ar-sdk/ios/

# Install pods
cd frontend/modules/ar-sdk/ios
pod install

# Build development client
cd ../../..
npx expo prebuild --platform ios
npx expo run:ios
```

#### 3. Android Setup

```bash
# Copy SDK AAR
cp perfectcorp-sdk.aar frontend/modules/ar-sdk/android/libs/

# Build development client
npx expo prebuild --platform android
npx expo run:android
```

### Configuration

Add to `frontend/app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "minSdkVersion": 24
          },
          "ios": {
            "deploymentTarget": "13.0"
          }
        }
      ]
    ]
  }
}
```

---

## How It Works

### Automatic Fallback

The AR service automatically selects the best available mode:

```typescript
// Try native first, fallback to API
const result = await ARSDKService.detectFace(imageUri);
```

**Decision Flow:**
1. Check if native module available
2. If yes → Use native SDK (faster)
3. If no → Use API (works everywhere)

### Mode Detection

```typescript
import { ARSDKModule } from '@modules/ar-sdk';

if (ARSDKModule) {
  console.log('Native AR available');
} else {
  console.log('Using API fallback');
}
```

---

## Features

### Face Detection
- Detects faces in images
- Returns landmarks (eyes, nose, mouth)
- Confidence score

### Virtual Try-On
- Apply makeup (lipstick, eyeshadow, blush, etc.)
- Adjustable intensity (0-100)
- Real-time preview
- Multiple products simultaneously

### Screenshot
- Capture AR result
- Save to device gallery
- Share on social media

---

## Testing

### Test API Mode

```bash
npx expo start
# Use Expo Go app
# Navigate to AR features
# Verify "Using API fallback" in logs
```

### Test Native Mode

```bash
# Build development client
npx expo prebuild
npx expo run:ios  # or run:android

# Navigate to AR features
# Verify "Using native AR SDK" in logs
```

### Performance Comparison

| Metric | API Mode | Native Mode |
|--------|----------|-------------|
| Face Detection | ~2-3s | ~500ms |
| Makeup Application | ~4-5s | ~1s |
| Latency | Network-dependent | Instant |
| Offline Support | ❌ No | ✅ Yes |

---

## Troubleshooting

### "ARSDKModule is not available"

**Normal in Expo Go!** This means API fallback is being used.

For native mode:
```bash
npx expo prebuild
npx expo run:ios
```

### Face Detection Fails

**Check:**
- ✅ Camera permissions granted
- ✅ Good lighting
- ✅ Face clearly visible
- ✅ Backend API key configured (API mode)
- ✅ SDK license valid (Native mode)

### Build Errors

**iOS:**
```bash
cd ios
pod deintegrate
pod install
cd ..
npx expo run:ios
```

**Android:**
```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```

### Performance Issues

1. Check mode being used (native vs API)
2. Reduce image resolution
3. Close background apps
4. Use `performanceMode: 'balanced'`

---

## Production Deployment

### Using API Mode (Recommended)

```bash
# No additional setup needed
eas build --platform all --profile production
```

✅ Works immediately  
✅ No SDK integration required  
✅ Easier maintenance

### Using Native Mode

```bash
# Ensure SDK files included
eas build --platform all --profile production
```

⚠️ **Remember:**
- Include SDK files in build
- Valid license key in config
- Larger app size (~50MB extra)

---

## API Reference

### ARSDKService.initialize()

```typescript
await ARSDKService.initialize({
  licenseKey: 'your-key',
  performanceMode: 'balanced'
});
```

### ARSDKService.detectFace()

```typescript
const result = await ARSDKService.detectFace(imageUri);
// {
//   faceDetected: true,
//   confidence: 0.95,
//   landmarks: { ... }
// }
```

### ARSDKService.applyMakeup()

```typescript
await ARSDKService.applyMakeup(imageUri, {
  productId: 'lipstick-red-01',
  category: 'lipstick',
  color: '#FF0000',
  intensity: 80
});
```

---

## Current Status

- ✅ AR SDK structure in place
- ✅ API fallback fully functional
- ✅ TypeScript types defined
- ⚠️ Native SDK integration (optional)
- ✅ Works in Expo Go

**Recommendation:** Use API mode for initial launch. Add native mode later if needed for performance.

---

## Support

**Backend API Issues:**
- Check `PERFECTCORP_API_KEY` in backend `.env`
- Verify API quota not exceeded
- Review backend logs

**Native SDK Issues:**
- Contact Perfect Corp support
- Check SDK version compatibility
- Verify license key validity

**General AR Issues:**
- Open GitHub issue
- Include device model, OS version
- Attach logs from `npx expo start`
