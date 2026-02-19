# Store Assets Checklist

Place finalized, optimized assets in this folder before submission.

Required:
- iOS
  - icon.png — 1024×1024, PNG, no alpha
  - splash-icon.png — 2048×2048 master
  - splash-icon-dark.png — 2048×2048 master (dark)
- Android
  - adaptive-icon.png — square source
  - Notification icon — monochrome, placed under android native if needed

Run verification:
- npm run assets:verify
- npm run assets:optimize
- npm run screenshots:verify
- npm run eas:verify

Last Updated: February 19, 2026
