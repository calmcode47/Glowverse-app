# Glowverse

An immersive AI- and AR-powered shopping experience that uses virtual try-on, skin analysis, and personalized recommendations to help consumers discover products, visualize results in real time, and make confident purchase decisions.

## Repository Structure
- frontend/ — Expo React Native application
- backend/ — Node.js + Express + TypeScript API server (Prisma, Cloudinary, Perfect Corp)

---

## Frontend (Expo React Native)

### Key Paths
- App root: `frontend/`
- Entry: `frontend/App.tsx`
- Config: `frontend/app.json`, `frontend/eas.json`
- Tests: `frontend/__tests__/`
- Assets: `frontend/assets/`

### Commands
- Install dependencies: `npm install` (run inside `frontend/`)
- Start dev server: `npx expo start`
- Typecheck: `npx tsc --noEmit`
- Tests: `npx jest`
- EAS builds:
  - iOS dev: `eas build -p ios --profile development`
  - Android dev: `eas build -p android --profile development`
  - iOS prod: `eas build -p ios --profile production`
  - Android prod: `eas build -p android --profile production`

### Environment
- Copy `frontend/.env.example` to `frontend/.env`
- Common variables:
  - `API_BASE_URL`
  - `PERFECT_CORP_API_KEY`
  - `ANALYTICS_ID`
  - `SENTRY_DSN`
- Expo reads env via `expo.extra` in `app.json`

### Device Testing
- Expo Go: `npx expo start` and scan QR
- Development builds:
  - iOS via EAS dev profile
  - Android via EAS dev profile or APK

### Publishing
- Configure metadata in `app.json` (name, slug, version)
- Submit:
  - iOS: `eas submit -p ios --profile production`
  - Android: `eas submit -p android --profile production`
- OTA updates: `eas update --branch production`

---

## Backend (Node.js + Express + TypeScript)

### Key Paths
- App root: `backend/`
- Entry: `backend/src/server.ts`, `backend/src/app.ts`
- Config: `backend/src/config/*` (env, database, cloudinary)
- API: `backend/src/controllers/*`, `backend/src/routes/*`
- Middleware: `backend/src/middleware/*`
- Services: `backend/src/services/*`
- Types: `backend/src/types/*`
- Utils: `backend/src/utils/*`
- Prisma: `backend/prisma/schema.prisma`, `backend/prisma/seed.ts`

### Commands
- Install: `npm install` (run inside `backend/`)
- Dev: `npm run dev`
- Build: `npm run build`
- Start: `npm start`
- Lint: `npm run lint`
- Prisma:
  - Generate: `npm run prisma:generate`
  - Migrate: `npm run prisma:migrate`
  - Seed: `npm run prisma:seed`
  - Studio: `npm run prisma:studio`

### Environment Variables
Copy `backend/.env.example` to `backend/.env` and fill:
- `DATABASE_URL`
- `JWT_SECRET`, `JWT_REFRESH_SECRET`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `PERFECTCORP_API_KEY`, `PERFECTCORP_BASE_URL`
- `CORS_ORIGIN`, `RATE_LIMIT_*`

### Docker (Local Dev)
Inside `backend/`:
```bash
docker-compose up -d
docker-compose logs -f backend
docker-compose down
```
Services:
- Postgres (with healthcheck, persistent volume)
- Redis (optional caching)
- Backend API (port 5000, health at /health)

### Deployment
#### Railway
- Config: `/railway.json`
- Build: `cd backend && npm install && npx prisma generate && npm run build`
- Start: `cd backend && npx prisma migrate deploy && npm start`

#### Render
- Config: `/render.yaml`
- Build: `cd backend && npm install && npx prisma generate && npm run build`
- Start: `cd backend && npx prisma migrate deploy && npm start`
- Health: `/health`

#### GitHub Actions
- CI/CD workflow: [deploy.yml](.github/workflows/deploy.yml)
- Jobs: Lint, Typecheck, deploy to Railway on push to `main`

### Database Migrations
```bash
npm run prisma:migrate        # create dev migration
npx prisma migrate deploy     # deploy migrations in production
npx prisma migrate reset      # reset database (DANGER)
```

### Monitoring
- Health: `GET /health`
- Logs: `backend/logs/` or platform logs

### Rate Limits
- Auth: 5 requests / 15 minutes
- Upload: 20 requests / hour
- Perfect Corp API: 10 requests / minute
- General API: 100 requests / 15 minutes

### Security Checklist
- Change all default secrets
- Enable HTTPS
- Configure CORS properly
- Store secrets in env or platform secret store
- Enable rate limiting
- Regular security updates and dependency audits
- Database backups configured

---

## Support
- Issues: GitHub Issues
- Contact: tony_tsai@perfectcorp.com, darren_liu@perfectcorp.com

## License
Proprietary — Perfect Corp Hackathon 2025
