# AR SDK Native Module - Android Implementation Template

This directory contains the Android native module implementation for AR SDK integration.

## Structure

```
android/
├── ARSDKModule.kt              # Main native module
├── ARSDKPackage.kt             # React Native package
├── FaceTracker.kt              # Face tracking implementation
├── MakeupRenderer.kt           # Makeup rendering engine
└── utils/
    ├── LandmarkProcessor.kt
    └── TextureManager.kt
```

## Setup Instructions

### 1. Run Expo Prebuild

First, generate the native Android directory:

```bash
cd /Users/mayank/Glowverse-app/frontend
npx expo prebuild --platform android
```

### 2. Add AR SDK Dependencies

Update `android/app/build.gradle`:

**For PerfectCorp SDK:**
```gradle
dependencies {
    implementation 'com.perfectcorp.ar:makeup-sdk:5.0.0'
}
```

**For Banuba SDK:**
```gradle
repositories {
    maven { url 'https://maven.banuba.com/releases' }
}

dependencies {
    implementation 'com.banuba.sdk:effect-player:1.0.0'
}
```

**For DeepAR:**
```gradle
dependencies {
    implementation 'ai.deepar.ar:deepar:4.0.0'
}
```

### 3. Update AndroidManifest.xml

Ensure permissions (already in app.json):
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
```

### 4. Add Native Module Files

Create module directory and add Kotlin files:

```bash
mkdir -p android/app/src/main/java/com/glowverse/modules/arsdk
# Copy Kotlin files here
```

### 5. Register Package

Update `MainApplication.kt` to include the AR SDK package:

```kotlin
import com.glowverse.modules.arsdk.ARSDKPackage

class MainApplication : Application(), ReactApplication {
    override fun getPackages(): List<ReactPackage> {
        return PackageList(this).packages.apply {
            add(ARSDKPackage())
        }
    }
}
```

## Native Module Implementation

### ARSDKModule.kt (Template)

```kotlin
package com.glowverse.modules.arsdk

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class ARSDKModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    private var faceTracker: FaceTracker? = null
    private var makeupRenderer: MakeupRenderer? = null
    
    override fun getName(): String {
        return "ARSDKModule"
    }
    
    // MARK: - Initialization
    
    @ReactMethod
    fun initialize(config: ReadableMap, promise: Promise) {
        try {
            // TODO: Initialize AR SDK with vendor-specific code
            // Example:
            // val apiKey = config.getString("apiKey")
            // ARSDKManager.initialize(reactApplicationContext, apiKey)
            
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("INIT_ERROR", "Failed to initialize AR SDK", e)
        }
    }
    
    // MARK: - Face Tracking
    
    @ReactMethod
    fun startFaceTracking(promise: Promise) {
        try {
            faceTracker = FaceTracker(reactApplicationContext)
            faceTracker?.start { result ->
                sendEvent("onFaceDetected", result)
            }
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("TRACKING_ERROR", "Failed to start face tracking", e)
        }
    }
    
    @ReactMethod
    fun stopFaceTracking(promise: Promise) {
        faceTracker?.stop()
        promise.resolve(null)
    }
    
    // MARK: - Makeup Application
    
    @ReactMethod
    fun applyMakeup(settings: ReadableMap, promise: Promise) {
        try {
            // TODO: Apply makeup using SDK
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("MAKEUP_ERROR", "Failed to apply makeup", e)
        }
    }
    
    @ReactMethod
    fun removeMakeup(category: String, promise: Promise) {
        // TODO: Remove makeup
        promise.resolve(null)
    }
    
    @ReactMethod
    fun clearAllMakeup(promise: Promise) {
        // TODO: Clear all makeup
        promise.resolve(null)
    }
    
    @ReactMethod
    fun updateIntensity(category: String, intensity: Double, promise: Promise) {
        // TODO: Update intensity
        promise.resolve(null)
    }
    
    @ReactMethod
    fun captureScreenshot(options: ReadableMap, promise: Promise) {
        // TODO: Capture screenshot
        promise.resolve(null)
    }
    
    @ReactMethod
    fun getPerformanceMetrics(promise: Promise) {
        // TODO: Return performance metrics
        val metrics = Arguments.createMap()
        metrics.putDouble("fps", 30.0)
        metrics.putDouble("avgFps", 30.0)
        metrics.putInt("droppedFrames", 0)
        metrics.putDouble("memoryUsageMb", 80.0)
        metrics.putDouble("timestamp", System.currentTimeMillis().toDouble())
        promise.resolve(metrics)
    }
    
    @ReactMethod
    fun isARSupported(promise: Promise) {
        // TODO: Check AR support
        promise.resolve(true)
    }
    
    // MARK: - Event Emission
    
    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }
}
```

### ARSDKPackage.kt (Template)

```kotlin
package com.glowverse.modules.arsdk

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class ARSDKPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(ARSDKModule(reactContext))
    }
    
    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}
```

## Testing

Build and run on Android emulator:
```bash
npx expo run:android
```

Or build via EAS:
```bash
eas build --profile development --platform android
```

## Resources

- [React Native Native Modules (Android)](https://reactnative.dev/docs/native-modules-android)
- [Kotlin in React Native](https://reactnative.dev/docs/native-modules-android#kotlin)
