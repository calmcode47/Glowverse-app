# Glowverse — Frontend

## Repository Structure
- frontend/ — Expo React Native application (this project)
  - src/ — app source code
  - assets/ — icons, splash, static assets
  - docs/ — demo and project documentation
  - __tests__/ — Jest test suites
  - app.json, package.json, eas.json — project configs

## Build Instructions
- Install dependencies: `npm install`
- Start development server: `npx expo start`
- Run typecheck: `npx tsc --noEmit`
- Run tests: `npx jest`
- Build with EAS:
  - Development (client): `eas build -p ios --profile development` or `eas build -p android --profile development`
  - Preview: `eas build -p ios --profile preview` or `eas build -p android --profile preview`
  - Production: `eas build -p ios --profile production` or `eas build -p android --profile production`

## Environment Setup
- Copy `.env.example` to `.env` and fill values:
  - `API_BASE_URL`
  - `PERFECT_CORP_API_KEY`
  - `ANALYTICS_ID`
  - `SENTRY_DSN`
- EAS profiles in `eas.json` set default envs; override with `--env` or secrets in EAS dashboard.
- Expo config reads env via `expo.extra` in `app.json`.

## Running On Device
- Development build:
  - iOS: `eas build -p ios --profile development` then install via QR/TestFlight internal
  - Android: `eas build -p android --profile development` then install APK
- Alternatively use Expo Go for quick testing: `npx expo start` and scan QR

## Project Paths
- App root: `frontend/`
- Entry: `frontend/App.tsx`
- Config: `frontend/app.json`, `frontend/eas.json`
- Env template: `frontend/.env.example`

## Publishing Updates
- Configure project: name, slug, version in `app.json`
- Bump version codes per platform when needed
- Build and submit:
  - iOS: `eas submit -p ios --profile production`
  - Android: `eas submit -p android --profile production`
- OTA updates:
  - Use `eas update --branch production` to publish updates to the production channel

## Permissions
- iOS InfoPlist keys for camera and photo library are configured in `app.json`
- Android permissions include CAMERA and READ_MEDIA_IMAGES for Android 13+

## Status Bar and Splash
- Android status bar style and background are configured in `app.json`
- Splash images and icons are located in `/assets`
