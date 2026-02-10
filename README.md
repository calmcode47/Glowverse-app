# Glowverse

An immersive AI- and AR-powered shopping experience that uses virtual try-on, skin analysis, and personalized recommendations to help consumers discover products, visualize results in real time, and make confident purchase decisions.

## Repository Structure
- frontend/ — Expo React Native application
- backend/ — Node.js + Express + TypeScript API server (Prisma, Cloudinary, Perfect Corp)

---

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

1.  **Install dependencies**: `npm install` (run inside `frontend/`)
2.  **Environment Setup**: Copy `.env.example` to `.env` and fill in `API_BASE_URL` and `PERFECT_CORP_API_KEY`.
3.  **Start Development**: `npx expo start`
4.  **Testing**: `npx jest`

### 📱 Build & Deployment

*   **Development Builds**: `eas build --profile development`
*   **Production Submissions**: `eas submit --profile production`
*   **OTA Updates**: `eas update --branch production`

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
