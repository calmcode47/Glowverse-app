# Glowverse - AI/AR Beauty & Grooming Platform

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-54-black.svg)](https://expo.dev/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

**An immersive AI- and AR-powered beauty platform combining virtual try-on, skin analysis, personalized recommendations, e-commerce, and wellness tracking to help users discover products, visualize results in real-time, and make confident purchase decisions.**

---

## 📊 Project Status

| Component | Status | Completion | Notes |
|-----------|--------|------------|-------|
| **Backend API** | ✅ Stable | 88% | Core API complete; payments + notifications delivery still partial |
| **Database** | ✅ Stable | 95% | Prisma schema + seeds; ongoing refinements for production data |
| **CI/CD Pipeline** | ✅ Stable | 90% | Workflows in place; env + release hardening ongoing |
| **Infrastructure** | ✅ Stable | 85% | Docker + monitoring; production rollout depends on env/provider setup |
| **Frontend UI** | ✅ Stable | 90% | Core app flows are complete; payment + some integrations are partial |
| **Testing** | ✅ Stable | 80% | Unit + integration + E2E coverage for key flows; expand edge cases |
| **Documentation** | ✅ In Progress | 85% | Backend docs strong; project report summarizes completion + gaps |

---

## 🏗️ Repository Structure

```
Glowverse-app/
├── backend/                 # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── config/          # App configuration (env, redis, sentry, cloudinary)
│   │   ├── controllers/     # 16 route controllers
│   │   ├── middleware/       # Auth, rate-limit, cache, validation, security
│   │   ├── routes/          # 17 route files (60+ endpoints)
│   │   ├── services/        # 19 business logic services
│   │   ├── types/           # TypeScript type definitions
│   │   └── utils/           # Utilities and helpers
│   ├── prisma/              # Database schema & migrations
│   ├── __tests__/           # 14 integration tests + 1 e2e test
│   ├── scripts/             # 6 DevOps scripts (backup, deploy, rollback)
│   ├── docs/                # 21 documentation files + runbooks
│   └── .github/workflows/   # 6 CI/CD workflow files
├── frontend/                # React Native + Expo mobile app
│   ├── src/
│   │   ├── components/      # 12 component categories (76+ components)
│   │   ├── screens/         # 17 screen categories (30+ screens)
│   │   ├── navigation/      # React Navigation setup
│   │   ├── services/        # API client services
│   │   ├── hooks/           # Custom React hooks
│   │   ├── context/         # React context providers
│   │   ├── theme/           # Design system & theming
│   │   └── utils/           # Utility functions
│   ├── assets/              # Images, fonts, icons
│   └── __tests__/           # Component tests
├── docker-compose.yml       # Local development services
├── render.yaml              # Render deployment config
└── railway.json             # Railway deployment config
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ installed
- **npm** package manager
- **PostgreSQL** (for production) or **Docker** (recommended)
- **Expo CLI** (for mobile development)

### 1. Clone Repository
```bash
git clone <repository-url>
cd Glowverse-app
```

### 2. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Setup database (Docker recommended)
docker-compose up -d postgres

# Initialize database
npm run db:setup

# Start development server
npm run dev
```

**Backend running at:** `http://localhost:5000`
**Health check:** `http://localhost:5000/health`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Expo development server (Windows & macOS)
npm start

# Platform launchers
npm run web
npm run ios          # macOS only
npm run android

# Connectivity modes
# Windows defaults to tunnel automatically for reliable device pairing
npm run start:tunnel # Force tunnel on any OS
npm run start:lan    # Prefer LAN (same Wi‑Fi, VPNs off)
```

**Frontend running at:** `http://localhost:8081`

---

## 🌟 Key Features

### Backend (16 Modules)

| Module | Description |
|--------|-------------|
| 🔐 **Authentication** | JWT + refresh tokens, registration, login, password management |
| 👤 **User Management** | Profile CRUD, avatar uploads, preferences |
| 🛒 **E-Commerce** | Product catalog, cart, orders, favorites, wishlist |
| 📢 **Notifications** | Push notifications, in-app notification center |
| 🎁 **Promotions** | Discount codes (% & fixed), seasonal campaigns |
| 🤝 **Referrals** | Referral program with code generation & rewards |
| 💪 **Fitness** | Activity logging, goal tracking, progress analytics |
| 📚 **Guides** | Beauty tutorials with steps, likes, bookmarks, comments |
| 🔍 **Search** | Cross-entity search with suggestions & trending |
| 🎨 **AR/AI** | PerfectCorp integration for skin analysis & virtual try-on |
| 📤 **Upload** | File upload with Cloudinary & Sharp image processing |
| 📊 **Analysis** | Skin analysis results and product recommendations |
| 🔄 **Try-On** | Virtual makeup try-on sessions |
| 📈 **Monitoring** | Sentry error tracking, Winston logging |
| 🛡️ **Security** | Helmet, CORS, rate limiting, CSRF, XSS protection |
| 💾 **Caching** | Redis-based caching with IORedis |

#### Backend Completion (≈ 88%)
- Implemented
  - Auth (JWT + refresh), users/profile, products/catalog/search, cart and orders core flows
  - Addresses CRUD with API + local/demo fallback
  - Promotions/referrals modules (API surface + basic flows)
  - Observability and hardening: logging, rate limiting, security middleware, runbooks
- Remaining
  - Payments: create payment intents / checkout sessions and fully wire Stripe flow end-to-end
  - Notifications delivery: integrate real email/push/SMS providers + background queue
  - Promotions in checkout: apply promo/discount consistently during order total calculation
  - Final QA hardening: fix known edge-case handlers and expand integration coverage

### Frontend (React Native + Expo)

| Feature | Description |
|---------|-------------|
| 📱 **Cross-Platform** | iOS, Android, and Web support |
| 🎨 **76+ Components** | Buttons, cards, animations, AR views |
| 📱 **30+ Screens** | Auth, shopping, AR, analysis, profile |
| 🛒 **Cart & Checkout** | Multi‑step checkout with Stripe integration points |
| 🧠 **AI & AR** | Virtual try‑on, skin analysis, recommendations |
| 🔌 **API Layer** | Typed services for products, cart, orders, users, promos |
| 📶 **Offline** | Request queue with auto‑sync, optimistic cart, caching |
| 📈 **Analytics** | Firebase Analytics for screens and commerce funnels |
| ✨ **Animations & UX** | Parallax, reveals, micro‑interactions |
| 🎭 **Design System** | Light/dark themes, tokens, consistent UI |

#### Frontend Completion (≈ 90%)
- Implemented
  - Authentication with token refresh; secure token storage
  - Product catalog, detail pages with galleries and variants
  - Cart operations, promo codes, multi‑step checkout
  - **Refined Promotion UI**: Coupon-style design with one-tap copy functionality
  - **Social Sharing**: Native system-level sharing for products and referral codes
  - **Notification Center**: Granular user preferences with real-time backend synchronization
  - **Fitness Tracking**: Comprehensive dashboard with goal progress and activity charts
  - Orders list/detail, addresses CRUD, profile update
  - AR virtual try‑on with capture and overlays
  - AI skin analysis flow and results
  - Search with filters; favorites and promotions
  - Offline request queue, optimistic cart, product caching
  - Analytics (extended): wishlist add/remove, filter apply/remove/sort, notification received/opened/dismissed, promo viewed/copied/applied/failed, payment selected/added, review started/submitted; plus view_item, add/remove cart, begin_checkout, purchase, search, try‑on and analysis, screen views
  - Accessibility: alt text and labels for images, labeled icon buttons with roles/hints, touch‑target enforcement, contrast audit script
  - Quality tooling: OpenAPI endpoint coverage audit; integration test scaffold for live backend; E2E deep linking and payment decline path
  - Performance: image preloading, FlatList tuning, lazy-loaded screens, CI bundle-size budgets
  - Build & Release: EAS profiles (dev/preview/prod), PR checks, production auto-submit workflows, store asset scaffolding, asset verification/optimization scripts, EAS projectId verification
- Remaining
  - End‑to‑end payments: server-issued client secret + webhook-driven order state
  - AR/AI production hardening: native SDK linkage/config and device QA pass
  - Offline queue UX: syncing state, user-facing conflict resolution UI
  - Tech debt cleanup: remove duplicate/legacy auth screens and dead routes
  - Expand E2E: payment edge cases (3DS/timeout/network) + more profile flows

---

## 🛠️ Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| TypeScript | 5.3+ | Type safety |
| Express | 4.18 | Web framework |
| Prisma | 5.7 | ORM (PostgreSQL) |
| Jest + Supertest | 29.7 | Testing |
| Redis (IORedis) | 5.9 | Caching |
| Winston | 3.11 | Logging |
| Sentry | 10.38 | Error tracking |
| Sharp | 0.33 | Image processing |
| Cloudinary | 2.9 | Image hosting |
| Zod | 4.3 | Validation |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.81 | Mobile framework |
| Expo SDK | 54 | Development platform |
| TypeScript | 5.9 | Type safety |
| React Navigation | 7 | Routing |
| React Native Paper | 5 | UI components |
| React Native Reanimated | 4.1 | Animations |
| Axios | 1.13 | HTTP client |

### DevOps
| Technology | Purpose |
|------------|---------|
| GitHub Actions | CI/CD (6 workflows) |
| Docker | Containerization |
| AWS (ECS, RDS, S3) | Cloud infrastructure |
| Sentry | Error tracking |

---

## 🔌 API Overview

**Base URL:** `http://localhost:5000/api/v1`

| Module | Endpoint | Methods |
|--------|----------|---------|
| **Auth** | `/auth/*` | POST (register, login, refresh, logout) |
| **Users** | `/users/*` | GET, PUT, DELETE (profile, preferences) |
| **Products** | `/products/*` | GET (catalog, search, categories) |
| **Cart** | `/cart/*` | GET, POST, PUT, DELETE (cart management) |
| **Orders** | `/orders/*` | GET, POST, PUT (order lifecycle) |
| **Favorites** | `/favorites/*` | GET, POST, DELETE (wishlist) |
| **Notifications** | `/notifications/*` | GET, PUT, DELETE (CRUD) |
| **Promotions** | `/promotions/*` | GET, POST (discount codes) |
| **Referrals** | `/referrals/*` | GET, POST (codes, rewards, stats) |
| **Fitness** | `/fitness/*` | GET, POST, PUT, DELETE (activities, goals) |
| **Guides** | `/guides/*` | GET, POST, PUT, DELETE (tutorials, engagement) |
| **Search** | `/search/*` | GET (global search, suggestions) |
| **Upload** | `/upload` | POST (file uploads) |
| **Analysis** | `/analysis/*` | POST, GET (skin analysis) |
| **Try-On** | `/tryon/*` | POST, GET (virtual makeup) |
| **PerfectCorp** | `/perfectcorp/*` | POST, GET (AI/AR services) |

**Total:** 60+ RESTful endpoints

📖 **Full API Reference:** [backend/docs/API_REFERENCE.md](backend/docs/API_REFERENCE.md)

---

## 🧪 Testing

### Backend Tests
```bash
cd backend

npm test                    # Run all tests
npm run test:coverage       # With coverage report
npm run test:integration    # Integration tests only
npm run test:verbose        # Verbose output
npm run test:ci             # CI mode (coverage + limited workers)
```

**Test Suites (14 integration + 1 e2e + 4 service specs):**
- Auth, Users, E-Commerce (products, cart, orders)
- Notifications, Promotions, Referrals
- Fitness, Guides, Search
- PerfectCorp, Upload, Image, Storage
- User Journey (e2e)
- Cart, Notification, Order, Promotion (service unit tests)

### Frontend Tests
```bash
cd frontend
npm test
```

---

## 🗄️ Database

### Schema: 25+ Prisma Models

| Domain | Models |
|--------|--------|
| **Users** | User, UserProfile, UserPreferences |
| **E-Commerce** | Product, Category, Cart, CartItem, Order, OrderItem, Favorite |
| **Content** | Guide, GuideStep, GuideComment, GuideLike, GuideBookmark |
| **Fitness** | FitnessActivity, FitnessGoal |
| **Promotions** | Promotion, ReferralCode, ReferralUsage |
| **Notifications** | Notification |
| **Analysis** | SkinAnalysis, TryOnSession |

```bash
npm run prisma:generate      # Generate Prisma client
npm run prisma:migrate       # Run migrations
npm run prisma:seed          # Seed database
npm run prisma:studio        # Open Prisma Studio
npm run db:setup             # All-in-one setup
```

---

## 🚀 Deployment

### Docker (Local Development)
```bash
docker-compose up -d         # Start all services
docker-compose logs -f       # View logs
docker-compose down          # Stop services
```

### Production Docker
```bash
docker-compose -f docker-compose.production.yml up -d
```

### CI/CD Pipelines (GitHub Actions)

| Workflow | Trigger | Description |
|----------|---------|-------------|
| `ci.yml` | PR / Push | Lint, test, security scan |
| `test.yml` | PR | Run test suite with Postgres/Redis |
| `build.yml` | Push to main/staging | Build & push Docker images |
| `deploy-staging.yml` | Push to staging | Auto-deploy to staging |
| `deploy-production.yml` | Release tag | Production deploy with approval |
| `database-backup.yml` | Daily (2 AM UTC) | Encrypted database backups |

### Cloud Platforms
- **Render:** `render.yaml` configuration included
- **Railway:** `railway.json` configuration included
- **AWS ECS:** Full deployment guide in docs

📖 **Deployment Guide:** [backend/docs/DEPLOYMENT_GUIDE.md](backend/docs/DEPLOYMENT_GUIDE.md)

---

## 📚 Documentation

### Backend
- [API Reference](backend/docs/API_REFERENCE.md)
- [Deployment Guide](backend/docs/DEPLOYMENT_GUIDE.md)
- [CI/CD Documentation](backend/docs/CI_CD.md)
- [Security Guide](backend/docs/SECURITY.md)
- [Backup & Recovery](backend/docs/BACKUP_RECOVERY.md)
- [Configuration Guide](backend/docs/CONFIGURATION.md)
- [Onboarding Guide](backend/docs/ONBOARDING.md)
- [Production Deployment Runbook](backend/docs/PRODUCTION_DEPLOYMENT.md)
- [Release Management](backend/docs/RELEASE_MANAGEMENT.md)
- [GitHub Setup](backend/docs/GITHUB_SETUP.md)
- [Environment Setup (AWS)](backend/docs/ENVIRONMENT_SETUP.md)

### Frontend
- [Frontend README](frontend/README.md) — Architecture, features, testing, status
- [Project Status Report](project_report.md) — Completion %, gaps, and next steps

---

## 🔐 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
API_VERSION=v1
DATABASE_URL=postgresql://user:password@localhost:5432/glowverse
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000,http://localhost:8081
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
PERFECTCORP_API_KEY=your-api-key
REDIS_URL=redis://localhost:6379
```

### Frontend
```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api/v1
EXPO_PUBLIC_PERFECTCORP_API_KEY=your-api-key
```

---

## 📦 Sample Data

After running `npm run db:setup`:

| Type | Details |
|------|---------|
| **Test Accounts** | `admin@glowverse.com / Admin@123`, `demo@glowverse.com / Demo@123` |
| **Products** | 50+ across 10 categories |
| **Promo Codes** | `WELCOME15` (15%), `GLOW25` (25%), `FLAT10` ($10) |
| **Guides** | 15-20 beauty tutorials with steps |

---

## 🔒 Security

- ✅ JWT authentication with refresh tokens
- ✅ bcrypt password hashing (10 rounds)
- ✅ Rate limiting (100 req/15min)
- ✅ Helmet security headers
- ✅ CORS configuration
- ✅ CSRF protection
- ✅ XSS prevention
- ✅ Input sanitization
- ✅ SQL injection protection (Prisma ORM)
- ✅ File upload validation
- ✅ Encrypted database backups (GPG AES-256)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is proprietary software developed for the Glowverse beauty platform.

---

**Built with ❤️ for the Glowverse beauty community**

*Last Updated: February 16, 2026*
