# AR SDK Native Module - iOS Implementation Template

This directory contains the iOS native module implementation for AR SDK integration.

## Structure

```
ios/
├── ARSDKModule.swift           # Main native module
├── ARSDKModule-Bridging-Header.h  # Objective-C bridge
├── FaceTracker.swift          # Face tracking implementation
├── MakeupRenderer.swift       # Makeup rendering engine
└── Utils/
    ├── LandmarkProcessor.swift
    └── TextureManager.swift
```

## Setup Instructions

### 1. Run Expo Prebuild

First, generate the native iOS directory:

```bash
cd /Users/mayank/Glowverse-app/frontend
npx expo prebuild --platform ios
```

### 2. Install AR SDK Pod

Add the AR SDK to your `Podfile` (in `ios/` directory):

**For PerfectCorp SDK:**
```ruby
pod 'YMK', '~> 5.0'  # YouCam Makeup SDK
```

**For Banuba SDK:**
```ruby
pod 'BanubaEffectPlayer', '~> 1.0'
```

**For DeepAR:**
```ruby
pod 'DeepAR', '~> 4.0'
```

Then run:
```bash
cd ios
pod install
```

### 3. Add Native Module Files

Copy the Swift files from this template into `ios/Glowverse/Modules/ARSDK/`:

```bash
mkdir -p ios/Glowverse/Modules/ARSDK
# Copy Swift files here
```

### 4. Update Xcode Project

1. Open `ios/Glowverse.xcworkspace` in Xcode
2. Add the Swift files to the project
3. Ensure bridging header is configured
4. Add required frameworks:
   - ARKit.framework
   - CoreML.framework
   - Vision.framework
   - Accelerate.framework

### 5. Configure Info.plist

Ensure camera permissions are set (already in app.json):
- NSCameraUsageDescription
- NSPhotoLibraryUsageDescription

## Native Module Implementation

### ARSDKModule.swift (Template)

```swift
import Foundation
import React

@objc(ARSDKModule)
class ARSDKModule: RCTEventEmitter {
  
  private var faceTracker: FaceTracker?
  private var makeupRenderer: MakeupRenderer?
  
  // MARK: - Module Setup
  
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  override func supportedEvents() -> [String]! {
    return [
      "onFaceDetected",
      "onFaceLost",
      "onTrackingQualityChanged",
      "onPerformanceUpdate",
      "onError"
    ]
  }
  
  // MARK: - Initialization
  
  @objc func initialize(_ config: NSDictionary, 
                       resolver resolve: @escaping RCTPromiseResolveBlock,
                       rejecter reject: @escaping RCTPromiseRejectBlock) {
    // TODO: Initialize AR SDK with vendor-specific code
    // Example:
    // let apiKey = config["apiKey"] as? String
    // YMKSDKManager.shared.initialize(apiKey: apiKey)
    
    resolve(nil)
  }
  
  // MARK: - Face Tracking
  
  @objc func startFaceTracking(_ resolve: @escaping RCTPromiseResolveBlock,
                               rejecter reject: @escaping RCTPromiseRejectBlock) {
    // TODO: Start face tracking session
    faceTracker = FaceTracker()
    faceTracker?.start { [weak self] result in
      self?.sendEvent(withName: "onFaceDetected", body: result)
    }
    resolve(nil)
  }
  
  @objc func stopFaceTracking(_ resolve: @escaping RCTPromiseResolveBlock,
                              rejecter reject: @escaping RCTPromiseRejectBlock) {
    faceTracker?.stop()
    resolve(nil)
  }
  
  // MARK: - Makeup Application
  
  @objc func applyMakeup(_ settings: NSDictionary,
                        resolver resolve: @escaping RCTPromiseResolveBlock,
                        rejecter reject: @escaping RCTPromiseRejectBlock) {
    // TODO: Apply makeup using SDK
    resolve(nil)
  }
  
  // Add other methods: removeMakeup, clearAllMakeup, updateIntensity, etc.
}
```

## Testing

Build and run on iOS simulator:
```bash
npx expo run:ios
```

Or build via EAS:
```bash
eas build --profile development --platform ios
```

## Resources

- [React Native Native Modules (iOS)](https://reactnative.dev/docs/native-modules-ios)
- [Swift in React Native](https://teabreak.e-spres-oh.com/swift-in-react-native-the-ultimate-guide-part-1-modules-9bb8d054db03)
