# Glowverse

An immersive AI- and AR-powered shopping experience that uses virtual try-on, skin analysis, and personalized recommendations to help consumers discover products, visualize results in real time, and make confident purchase decisions.

## Repository Structure
- frontend/ — Expo React Native application
- backend/ — Node.js + Express + TypeScript API server (Prisma, Cloudinary, Perfect Corp)

---

## Quick Start (Full Stack)
- Prerequisites: Node 18+, npm, Expo CLI
- Backend
  - cd backend && npm install
  - Copy .env.example to .env and set at least PORT, JWT secrets
  - Optional: set CLOUDINARY_* to enable uploads; if missing or set to "mock"/"root", uploads fall back to local snapshots
  - Optional: set PERFECTCORP_API_KEY; when "mock" or empty, mock responses are used
  - npm run dev
- Frontend
  - cd frontend && npm install
  - Set API_BASE_URL for web via environment or app.json extra; default http://localhost:5000
  - npm run web (or npm start, then scan with Expo Go)
- Health checks
  - Backend: http://localhost:5000/health
  - Frontend (web dev): http://localhost:8081/

## Frontend (Expo React Native)

Glowverse features a cutting-edge mobile experience built with **React Native** and **Expo SDK 52**, delivering a premium, designer-label feel through advanced animations and AI/AR integrations.

### 🌟 Key Features

*   **AI-Powered Skin Analysis**: Advanced face detection and skin scanning via [Perfect Corp](https://www.perfectcorp.com/) API to provide detailed hydration, texture, and clarity scores.
*   **Virtual Try-On (AR)**: Real-time makeup application (Lipstick, Eyeshadow, Blush) using AR overlays on live camera feeds.
*   **Premium Visual Experience**:
    *   **Parallax Backgrounds**: Smooth, depth-defying scroll effects using `react-native-reanimated`.
    *   **Scroll Reveals**: Content that fades and scales elegantly into view as you browse.
    *   **Glassmorphic UI**: Modern, translucent elements with vibrant gradients and subtle shadows.
*   **Market Insights**: Live price tracking and market trend visualization for premium products.
*   **Smart Search**: Dynamic product discovery with brand-based filtering and instant search.

### 🏗️ Application Architecture

The frontend follows a modular, feature-based architecture for scalability and maintainability:

*   **`src/screens/`**: Feature-grouped screens (AR, Shop, Home, Profile, Results).
*   **`src/components/`**: Atomic and complex UI components.
    *   `ui/`: Reusable primitive components (Buttons, Inputs).
    *   `animations/`: Custom animation wrappers (ScrollReveal, ParallaxView).
    *   `ar/`: AR-specific UI elements (ColorPicker, MakeupDrawer).
*   **`src/services/`**: API client logic and third-party integrations (Perfect Corp, Backend).
*   **`src/context/`**: Global state management using React Context (AI Results, Camera State, Authentication).
*   **`src/theme/`**: Centralized design system with support for dynamic theme switching.

### 🛠️ Technology Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | React Native, Expo (SDK 52) |
| **Language** | TypeScript |
| **UI Library** | React Native Paper (v5) |
| **Animations** | React Native Reanimated (v3), Moti |
| **Vector Icons** | Expo Vector Icons |
| **CI/CD** | EAS (Expo Application Services) |

### 🚀 Getting Started

1.  **Install**: `npm install` (inside `frontend/`)
2.  **Environment**:
    - `API_BASE_URL` via `app.json` extra or environment (web)
    - Defaults to `http://localhost:5000`
    - Runtime override supported via AsyncStorage key `apiBaseUrl`
3.  **Start**: `npm run web` (or `npm start` for QR + Expo Go)
4.  **Tests**: `npm test`

### 📱 Build & Deployment

*   **Development Builds**: `eas build --profile development`
*   **Production Submissions**: `eas submit --profile production`
*   **OTA Updates**: `eas update --branch production`

---

## Backend (Node.js + Express + TypeScript)
 
 ### Overview
- Detailed documentation: [backend README](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/README.md)
 - API server using Express, TypeScript, Prisma, Cloudinary, and Perfect Corp integrations.
 - API prefix: `/api/v1` (configurable via `API_VERSION`).
 - Health check: `GET /health`.
 - Authentication: JWT (access + refresh tokens) with Bearer scheme.
 
 ### Architecture
 - Request pipeline: Helmet, CORS, Compression, JSON body parsing, Rate Limiting, Routing, Error Handling.
 - Authentication: `Authorization: Bearer <token>` via [auth middleware](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/middleware/auth.ts).
 - Validation: `express-validator` centralized in [validation.ts](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/middleware/validation.ts).
 - Rate Limiting: global and endpoint-specific limits in [rateLimiter.ts](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/middleware/rateLimiter.ts).
 - Error Handling: consistent JSON errors via [errorHandler.ts](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/middleware/errorHandler.ts) and [errors.ts](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/utils/errors.ts).
 - Storage:
   - Cloudinary for image hosting via [cloudinary.ts](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/config/cloudinary.ts) and [StorageService](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/services/storage.service.ts).
   - Local snapshots in `LOCAL_DATA_DIR` (default `N:\trae data`) for debugging and audit trails.
 - Imaging: validation/compression with Sharp in [ImageService](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/services/image.service.ts).
 - Perfect Corp: resilient client with retries and normalization in [PerfectCorpService](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/services/perfectcorp.service.ts); mock fallback when API key is `mock` or empty.
 - Data Access: Prisma client in [database.ts](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/config/database.ts).
 - Logging: Winston with environment-sensitive levels in [logger.ts](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/utils/logger.ts).
 
 ### Directory Map
 - Entry: [server.ts](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/server.ts), [app.ts](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/app.ts)
 - Config: [env.ts](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/config/env.ts), [database.ts](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/config/database.ts), [cloudinary.ts](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/config/cloudinary.ts)
 - Controllers: [controllers/*](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/controllers)
 - Routes: [routes/*](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/routes)
 - Middleware: [middleware/*](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/middleware)
 - Services: [services/*](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/services)
 - Types: [types/*](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/types)
 - Prisma: [schema.prisma](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/prisma/schema.prisma), [migrations](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/prisma/migrations), [seed.ts](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/prisma/seed.ts)
 
 ### Commands
 - Install: `npm install` (inside `backend/`)
 - Dev: `npm run dev`
 - Build: `npm run build`
 - Start: `npm start`
 - Lint: `npm run lint`
 - Prisma:
   - Generate: `npm run prisma:generate`
   - Dev migrate: `npm run prisma:migrate`
   - Deploy migrate: `npm run prisma:deploy`
   - Seed: `npm run prisma:seed`
   - Studio: `npm run prisma:studio`
 
 ### Environment
 - Required:
   - `PORT` (default 5000)
   - `JWT_SECRET`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
 - Recommended:
   - `API_VERSION` (default `v1`)
   - `LOCAL_DATA_DIR` (default `N:\trae data`)
   - `CORS_ORIGIN` (comma separated)
   - `MAX_FILE_SIZE` (default `10485760`)
   - `ALLOWED_FILE_TYPES` (default `image/jpeg,image/png,image/jpg`)
   - `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX_REQUESTS`
 - Optional:
   - `DATABASE_URL` (if unset, Prisma default is SQLite `file:./dev.db`)
   - `JWT_REFRESH_SECRET` (defaults to `JWT_SECRET`), `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`
  - `PERFECTCORP_API_KEY`, `PERFECTCORP_API_SECRET`, `PERFECTCORP_BASE_URL` (use `mock` to enable local mock mode)
   - `REDIS_URL`, `REDIS_ENABLED`
 
 ### Rate Limits
 - Global API: `RATE_LIMIT_MAX_REQUESTS` per `RATE_LIMIT_WINDOW_MS` (default 100 / 15m).
 - Auth: 5 requests / 15 minutes, successful requests skipped.
 - Upload: 20 requests / hour.
 - Perfect Corp proxy: 10 requests / minute.
 
 ### Storage & Uploads
 - Uploads use in-memory Multer with file-type/size validation in [upload.ts](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/middleware/upload.ts).
 - Images are validated and compressed via [ImageService](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/src/services/image.service.ts).
- Cloudinary stores originals/results when configured; if Cloudinary is disabled, uploads fall back to local storage paths with JSON snapshots under `LOCAL_DATA_DIR` for traceability.
 
 ### API Endpoints (v1)
 - Auth
   - `POST /auth/register` — email/password register
   - `POST /auth/login` — email/password login
   - `POST /auth/refresh` — exchange refresh token for new tokens
   - `POST /auth/logout` — invalidate one refresh token (optional body `refreshToken`)
   - `POST /auth/logout-all` — invalidate all tokens (auth required)
   - `GET /auth/me` — current profile (auth required)
   - `POST /auth/change-password` — change password (auth required)
   - `DELETE /auth/account` — delete account (auth required)
 - Users
   - `PATCH /users/profile` — update profile fields (auth required)
   - `PATCH /users/preferences` — update skin preferences (auth required)
   - `POST /users/avatar` — upload avatar (`image` form field) (auth required)
   - `GET /users/stats`, `GET /users/history`, `DELETE /users/history/:id` (auth required)
 - Analysis
   - `POST /analysis/skin` — upload image (`image` form field) to start analysis (auth required)
   - `GET /analysis` — list analyses (`page`, `limit`, `type`, `status`) (auth required)
   - `GET /analysis/:id` — get one (auth required)
   - `GET /analysis/:id/recommendations` — product recs (auth required)
   - `DELETE /analysis/:id` — delete (auth required)
 - Try-on
   - `POST /tryon` — upload image and body `{ type, productId?, intensity? }` (auth required)
   - `GET /tryon` — list (`page`, `limit`, `type`, `status`) (auth required)
   - `GET /tryon/:id` — get one (auth required)
   - `DELETE /tryon/:id` — delete (auth required)
   - `POST /tryon/:id/favorite` — save as favorite (auth required)
 - Favorites & Products
   - `GET /favorites` — list favorites (auth required)
   - `POST /favorites` — add favorite `{ productId, productName }` (auth required)
   - `DELETE /favorites/:productId`, `PATCH /favorites/:productId` (auth required)
   - `GET /products/search` — proxy product search (auth required)
   - `GET /products/recommendations` — proxy recommendations (auth required)
 - Upload (utility)
   - `POST /upload` — upload image (`image` form field) to Cloudinary (auth required)
 - Perfect Corp (proxy)
   - `GET /perfectcorp/health` (auth required)
   - `POST /perfectcorp/skin-analysis` (auth required)
   - `GET /perfectcorp/skin-analysis/:id` (auth required)
   - `POST /perfectcorp/virtual-tryon` (auth required)
   - `GET /perfectcorp/virtual-tryon/:id` (auth required)
   - `GET /perfectcorp/recommendations/:analysisId` (auth required)
   - `GET /perfectcorp/products/search` (auth required)
   - `POST /perfectcorp/face-detection` (auth required)
 
 ### Example Requests
 ```bash
 # Register
 curl -X POST http://localhost:5000/api/v1/auth/register \
   -H "Content-Type: application/json" \
   -d '{"email":"user@example.com","password":"StrongPass123","name":"Alex"}'
 
 # Login
 TOKEN=$(curl -s -X POST http://localhost:5000/api/v1/auth/login \
   -H "Content-Type: application/json" \
   -d '{"email":"user@example.com","password":"StrongPass123"}' | jq -r '.tokens.accessToken')
 
 # Start skin analysis (multipart)
 curl -X POST http://localhost:5000/api/v1/analysis/skin \
   -H "Authorization: Bearer $TOKEN" \
   -F "image=@./face.jpg;type=image/jpeg"
 
 # Create try-on (multipart + JSON fields)
 curl -X POST http://localhost:5000/api/v1/tryon \
   -H "Authorization: Bearer $TOKEN" \
   -F "image=@./face.jpg;type=image/jpeg" \
   -F "type=FULL_MAKEUP" \
   -F "productId=MOCK-LIPSTICK-001" \
   -F "intensity=0.8"
 ```
 
 ### Database
 - Default dev provider: SQLite (`file:./dev.db`) as defined in [schema.prisma](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/prisma/schema.prisma).
 - To use Postgres in production:
   - Change `provider` to `postgresql` in `schema.prisma`.
   - Set `DATABASE_URL` accordingly.
   - Regenerate and deploy: `npx prisma generate && npx prisma migrate deploy`.
 
 ### Docker & Deployment
 - Local stack via [docker-compose.yml](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/docker-compose.yml): Postgres, Redis, Backend.
 - Docker build via [Dockerfile](file:///n:/github-repos/Glowverse-app/Glowverse-app/backend/Dockerfile) (multi-stage, healthcheck).
 - Render: [render.yaml](file:///n:/github-repos/Glowverse-app/Glowverse-app/render.yaml)
 - Railway: [railway.json](file:///n:/github-repos/Glowverse-app/Glowverse-app/railway.json)
 - CI/CD: [deploy.yml](file:///n:/github-repos/Glowverse-app/Glowverse-app/.github/workflows/deploy.yml)
 
 ### Security
 - Store secrets in environment or platform secret store; never commit actual keys.
 - Configure CORS (`CORS_ORIGIN`) to trusted origins.
 - Rotate JWT secrets regularly; set refresh token TTLs.
 - Enforce upload constraints (`MAX_FILE_SIZE`, `ALLOWED_FILE_TYPES`).
 - Keep dependencies updated; monitor logs and rate limits.

---

## Support
- Issues: GitHub Issues
- Contact: tony_tsai@perfectcorp.com, darren_liu@perfectcorp.com

## License
Proprietary — Perfect Corp Hackathon 2025
