EAS Build & Submit

Setup
1) Install CLI and login:
   - npm i -g eas-cli
   - eas login
2) Initialize (one-time):
   - cd frontend
   - eas init
   - Update app.json extra.eas.projectId if prompted

Build Profiles
- Configured in eas.json:
  - development: internal testing, dev client
  - preview: internal distribution for QA
  - production: store builds (AAB on Android, Release on iOS)

Secrets
- Create secrets for production keys and DSN:
  - eas secret:create --scope project --name PRODUCTION_STRIPE_KEY --value pk_live_***
  - eas secret:create --scope project --name SENTRY_DSN --value https://***

Submit
- iOS requires App Store Connect account:
  - Fill submit.production.ios in eas.json (appleId, ascAppId)
- Android requires service account key:
  - Place google-play-key.json under frontend/secrets/ and reference in eas.json

CI/CD
- PR checks: .github/workflows/pr.yml
- Tagged release: .github/workflows/production.yml

Commands
- npm run build:dev
- npm run build:prod
- npm run submit:ios
- npm run submit:android
- npm run release
