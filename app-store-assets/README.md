App Store and Play Store Assets

Folder structure and required specifications. Replace placeholders with final, optimized images before submission.

Structure
- ios/
  - icon/icon-1024.png
  - splash/splash-2048.png
  - splash/splash-2048-dark.png
  - screenshots/
    - iphone-6.7/
    - iphone-6.5/
    - ipad-12.9/
- android/
  - icon/adaptive-foreground.png
  - icon/adaptive-background.png
  - screenshots/
    - phone/
    - tablet/
  - feature-graphic.png

Specifications
- App Icon:
  - iOS: 1024×1024 PNG, no alpha, sRGB/P3
  - Android adaptive icon: 432×432 foreground + background layer
- Splash:
  - 2048×2048 master, center 1024×1024 safe zone
  - Provide light and dark variants
  - Keep <500KB per file after optimization
- iOS screenshots:
  - 6.7\": 1290×2796, 6.5\": 1284×2778, 5.5\": 1242×2208, 12.9\" iPad Pro: 2048×2732
  - Capture 5–10 per size (Hero AR, Browsing, AI Analysis, Checkout, Profile)
- Android:
  - Feature graphic: 1024×500
  - Screenshots: Phone 1080×1920; 7\" tablet 1200×1920; 10\" tablet 1600×2560

Optimization
- PNG:
  - pngquant --quality=65-80 input.png -o output.png
- JPEG:
  - jpegoptim --max=85 --strip-all image.jpg
- Alternatively, use Expo optimize:
  - npx @expo/optimize --quality 70 --save

Notes
- Ensure icon/splash references in app.json point to the final files placed under frontend/assets if used in-app, and keep store submission versions in this folder.
- Verify color space is sRGB or Display P3 as required by stores.
