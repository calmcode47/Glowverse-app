// Programmatic Expo config to support env injection and dev-friendly defaults
const fs = require('fs');
const os = require('os');
const path = require('path');

function getLanIPv4() {
  if (process.env.REACT_NATIVE_PACKAGER_HOSTNAME) {
    return process.env.REACT_NATIVE_PACKAGER_HOSTNAME.trim();
  }

  const ifs = os.networkInterfaces();
  const candidates = [];

  for (const name of Object.keys(ifs)) {
    for (const net of ifs[name] || []) {
      // Skip internal (127.0.0.1) and non-IPv4
      if (net.family === 'IPv4' && !net.internal) {
        // Prioritize likely physical interfaces
        const isPriority = name.toLowerCase().includes('wi-fi') ||
          name.toLowerCase().includes('eth') ||
          name.toLowerCase().includes('en0');

        candidates.push({ address: net.address, priority: isPriority ? 1 : 0 });
      }
    }
  }

  // Sort by priority (descending)
  candidates.sort((a, b) => b.priority - a.priority);

  return candidates.length > 0 ? candidates[0].address : '127.0.0.1';
}

const lanIP = getLanIPv4();
const DEV_API = process.env.API_BASE_URL || `http://${lanIP}:5000/api/v1`;
const googleServicesPath = path.resolve(__dirname, 'google-services.json');
const hasGoogleServices = fs.existsSync(googleServicesPath);

module.exports = {
  expo: {
    name: "Glowverse",
    slug: "glowverse",
    version: "1.0.1",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    runtimeVersion: { policy: "sdkVersion" },
    splash: {
      image: "./assets/splash-icon.png",
      dark: { image: "./assets/splash-icon-dark.png", backgroundColor: "#0D1117" },
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    androidStatusBar: {
      backgroundColor: "#000000",
      translucent: false,
      barStyle: "light-content"
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.glowverse.app",
      entitlements: {
        "com.apple.developer.in-app-payments": ["merchant.com.glowverse"]
      },
      associatedDomains: [
        "applinks:glowverse.app",
        "applinks:www.glowverse.app",
        "applinks:glowverse.com",
        "applinks:www.glowverse.com"
      ],
      buildNumber: "2",
      infoPlist: {
        NSCameraUsageDescription: "Glowverse needs access to your camera for virtual try-on and skin analysis.",
        NSPhotoLibraryUsageDescription: "Glowverse needs access to your photos to save and share try-on results.",
        NSPhotoLibraryAddUsageDescription: "Glowverse needs permission to save try-on results to your photo library.",
        NSFaceIDUsageDescription: "We use Face ID to secure your payment information."
      },
      config: { usesNonExemptEncryption: false }
    },
    android: {
      permissions: ["CAMERA", "READ_MEDIA_IMAGES", "INTERNET"],
      ...(hasGoogleServices ? { googleServicesFile: "./google-services.json" } : {}),
      versionCode: 2,
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [
            { scheme: "https", host: "glowverse.com", pathPrefix: "/app" },
            { scheme: "https", host: "www.glowverse.com", pathPrefix: "/app" },
            { scheme: "https", host: "glowverse.app", pathPrefix: "/app" },
            { scheme: "https", host: "www.glowverse.app", pathPrefix: "/app" }
          ],
          category: ["BROWSABLE", "DEFAULT"]
        }
      ],
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      predictiveBackGestureEnabled: false,
      package: "com.glowverse.app"
    },
    scheme: "glowverse",
    deeplinks: ["glowverse://"],
    web: { favicon: "./assets/favicon.png" },
    plugins: [
      "expo-camera",
      "expo-media-library",
      "expo-notifications",
      [
        "expo-build-properties",
        {
          ios: { deploymentTarget: "15.1" },
          android: {
            minSdkVersion: 24,
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            enableProguardInReleaseBuilds: true
          }
        }
      ],
      [
        "react-native-vision-camera",
        {
          enableFrameProcessors: true,
          cameraPermissionText: "Allow Glowverse to access the camera for try-on and analysis.",
          microphonePermissionText: "Allow Glowverse to access the microphone for video capture."
        }
      ]
    ],
    extra: {
      apiBaseUrl: DEV_API,
      cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
      environment: process.env.ENVIRONMENT || "development",
      sentryDsn: process.env.SENTRY_DSN || "",
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
      stripeMerchantId: process.env.STRIPE_MERCHANT_ID || "merchant.com.glowverse",
      arSdk: {
        vendor: process.env.AR_SDK_VENDOR || "",
        enabled: process.env.AR_SDK_ENABLED || "",
        apiKey: process.env.AR_SDK_API_KEY || "",
        licenseKey: process.env.AR_SDK_LICENSE_KEY || "",
        apiUrl: process.env.AR_SDK_API_URL || "",
        targetFps: process.env.AR_TARGET_FPS || "",
        enableGpuAcceleration: process.env.AR_ENABLE_GPU_ACCELERATION || "",
        maxTextureCacheSizeMb: process.env.AR_MAX_TEXTURE_CACHE_SIZE_MB || ""
      },
      eas: { projectId: "YOUR_PROJECT_ID" }
    }
  }
};
