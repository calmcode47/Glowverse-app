# Glowverse Backend

## Overview
- Node.js + Express + TypeScript API with Prisma, Cloudinary, and Perfect Corp integrations
- API prefix: /api/v1 (configurable via API_VERSION)
- Health check: GET /health
- Authentication: JWT access + refresh tokens using Authorization: Bearer <token>

## Quick Start
- Install: npm install
- Environment: copy .env.example to .env and fill required values
- Dev server: npm run dev
- Build: npm run build
- Start: npm start
- Lint: npm run lint
 - Notes:
   - If CLOUDINARY_* is not set or cloud name is "mock"/"root", uploads are saved to local storage with JSON snapshots
   - If PERFECTCORP_API_KEY is "mock" or empty, mock responses are used for skin analysis and try-on

## Environment
- Required
  - PORT (default 5000)
  - JWT_SECRET
  - CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
- Recommended
  - API_VERSION (default v1)
  - LOCAL_DATA_DIR (default N:\\trae data)
  - CORS_ORIGIN (comma separated)
  - MAX_FILE_SIZE (default 10485760)
  - ALLOWED_FILE_TYPES (default image/jpeg,image/png,image/jpg)
  - RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS
- Optional
  - DATABASE_URL (uses SQLite file:./dev.db if unset)
  - JWT_REFRESH_SECRET (defaults to JWT_SECRET), JWT_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN
  - PERFECTCORP_API_KEY, PERFECTCORP_API_SECRET, PERFECTCORP_BASE_URL (use "mock" to enable local mock mode)
  - REDIS_URL, REDIS_ENABLED
- Config reference: [env.ts](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/config/env.ts)

## Architecture
- Pipeline: Helmet, CORS, Compression, JSON parsing, Rate Limiting, Routing, Error Handling
- Auth: bearer verification in [auth middleware](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/middleware/auth.ts)
- Validation: central validator in [validation.ts](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/middleware/validation.ts)
- Rate limits: [rateLimiter.ts](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/middleware/rateLimiter.ts)
- Errors: [errorHandler.ts](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/middleware/errorHandler.ts), [errors.ts](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/utils/errors.ts)
- Storage:
  - Cloudinary config in [cloudinary.ts](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/config/cloudinary.ts)
  - Uploads in [StorageService](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/services/storage.service.ts); when Cloudinary is disabled, images are saved locally and snapshots stored in LOCAL_DATA_DIR
- Imaging: validation/compression via [ImageService](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/services/image.service.ts)
- Perfect Corp: resilient client in [PerfectCorpService](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/services/perfectcorp.service.ts) with mock fallback
- Data: Prisma client in [database.ts](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/config/database.ts), schema in [schema.prisma](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/prisma/schema.prisma)
- Logging: Winston in [logger.ts](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/utils/logger.ts)

## Directory Map
- Entry: [server.ts](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/server.ts), [app.ts](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/app.ts)
- Config: [config/*](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/config)
- Controllers: [controllers/*](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/controllers)
- Routes: [routes/*](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/routes)
- Middleware: [middleware/*](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/middleware)
- Services: [services/*](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/services)
- Types: [types/*](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/types)
- Prisma: [prisma/](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/prisma)

## Commands
- npm run dev — start dev server with ts-node-dev
- npm run build — compile TypeScript to dist/
- npm start — run compiled server
- npm run lint — ESLint over src
- Prisma
  - npm run prisma:generate
  - npm run prisma:migrate
  - npm run prisma:deploy
  - npm run prisma:seed
  - npm run prisma:studio

## API Endpoints (v1)
- Auth
  - POST /auth/register
  - POST /auth/login
  - POST /auth/refresh
  - POST /auth/logout
  - POST /auth/logout-all
  - GET /auth/me
  - POST /auth/change-password
  - DELETE /auth/account
- Users
  - PATCH /users/profile
  - PATCH /users/preferences
  - POST /users/avatar
  - GET /users/stats
  - GET /users/history
  - DELETE /users/history/:id
- Analysis
  - POST /analysis/skin
  - GET /analysis
  - GET /analysis/:id
  - GET /analysis/:id/recommendations
  - DELETE /analysis/:id
- Try-on
  - POST /tryon
  - GET /tryon
  - GET /tryon/:id
  - DELETE /tryon/:id
  - POST /tryon/:id/favorite
- Favorites & Products
  - GET /favorites
  - POST /favorites
  - DELETE /favorites/:productId
  - PATCH /favorites/:productId
  - GET /products/search
  - GET /products/recommendations
- Upload
  - POST /upload
- Perfect Corp
  - GET /perfectcorp/health
  - POST /perfectcorp/skin-analysis
  - GET /perfectcorp/skin-analysis/:id
  - POST /perfectcorp/virtual-tryon
  - GET /perfectcorp/virtual-tryon/:id
  - GET /perfectcorp/recommendations/:analysisId
  - GET /perfectcorp/products/search
  - POST /perfectcorp/face-detection

## Storage & Uploads
- Multer in-memory storage with type/size validation: [upload.ts](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/middleware/upload.ts)
- Image validation and compression: [ImageService](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/services/image.service.ts)
- Cloudinary originals and results, plus local JSON snapshots under LOCAL_DATA_DIR

## Rate Limits
- Global API: configurable via RATE_LIMIT_* in env
- Auth: 5 requests / 15 minutes (skip successful)
- Upload: 20 requests / hour
- Perfect Corp proxy: 10 requests / minute

## Example Requests
```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"StrongPass123","name":"Alex"}'

# Login
TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"StrongPass123"}' | jq -r '.tokens.accessToken')

# Start skin analysis
curl -X POST http://localhost:5000/api/v1/analysis/skin \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@./face.jpg;type=image/jpeg"

# Create try-on
curl -X POST http://localhost:5000/api/v1/tryon \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@./face.jpg;type=image/jpeg" \
  -F "type=FULL_MAKEUP" \
  -F "productId=MOCK-LIPSTICK-001" \
  -F "intensity=0.8"
```

## Database
- Dev default: SQLite file:./dev.db (see [schema.prisma](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/prisma/schema.prisma))
- Production Postgres: set DATABASE_URL, update provider to postgresql, then npx prisma generate && npx prisma migrate deploy

## Docker & Deployment
- Local stack: [docker-compose.yml](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/docker-compose.yml)
- Docker build: [Dockerfile](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/Dockerfile)
- Render: [render.yaml](file:///n:/github-repos/Glowverse-app/Glowverse-app/render.yaml)
- Railway: [railway.json](file:///n:/github-repos/Glowverse-app/Glowverse-app/railway.json)
- CI/CD workflow: [deploy.yml](file:///n:/github-repos/Glowverse-app/Glowverse-app/.github/workflows/deploy.yml)

## Security
- Store secrets in environment or platform secret store
- Configure CORS and rate limits
- Rotate JWT secrets and enforce upload constraints
