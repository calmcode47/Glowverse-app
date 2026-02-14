Do not commit production keys to the repository.

Expected files (gitignored):
- google-play-key.json: Google Play service account key for EAS submit

Create EAS secrets for sensitive environment variables:
- PRODUCTION_STRIPE_KEY
- SENTRY_DSN
- Any other runtime secrets

Example:
- eas secret:create --scope project --name PRODUCTION_STRIPE_KEY --value pk_live_***
- eas secret:create --scope project --name SENTRY_DSN --value https://***
