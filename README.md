# Glowverse — AI/AR Beauty & Grooming Platform

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7%2B-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo%20SDK-54-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7%2B-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![License](https://img.shields.io/badge/License-Proprietary-FF0000?style=for-the-badge)](LICENSE)

**An immersive AI- and AR-powered beauty platform combining virtual try-on, skin analysis, personalized product recommendations, e-commerce, and wellness tracking — helping users discover products, visualize results in real-time, and make confident purchase decisions.**

[Backend API](#-backend) · [Frontend App](#-frontend) · [Quick Start](#-quick-start) · [API Reference](backend/docs/API_REFERENCE.md) · [Deployment](backend/docs/DEPLOYMENT_GUIDE.md)

</div>

---

## 📊 Project Status

| Component | Status | Completion | Notes |
|-----------|:------:|:----------:|-------|
| **Backend API** | ✅ Stable | 88% | 65+ endpoints across 16 modules; payments & notification delivery in progress |
| **Database** | ✅ Stable | 95% | Prisma schema with 25+ models, indexes, seeds, and migration history |
| **Frontend UI** | ✅ Stable | 90% | 76+ components, 30+ screens; AR/AI production hardening ongoing |
| **CI/CD Pipeline** | ✅ Stable | 90% | 7 GitHub Actions workflows (test, build, deploy, backup, perf) |
| **Infrastructure** | ✅ Stable | 85% | Docker, AWS ECS auto-scaling, Terraform, Kubernetes HPA |
| **Testing** | ✅ Stable | 80% | Unit, integration, and E2E (Detox) coverage across both packages |
| **Documentation** | ✅ In Progress | 85% | 26 backend docs; frontend docs and API reference are complete |

---

## 🏗️ Repository Structure

```
Glowverse-app/
├── backend/                    # Node.js + Express + TypeScript REST API
│   ├── src/
│   │   ├── config/             # Env, Redis, Sentry, Cloudinary, tracing
│   │   ├── controllers/        # 16 route controllers
│   │   ├── middleware/         # Auth, adaptive rate-limit, DDoS, cache, CSRF
│   │   ├── routes/             # 20 route files (65+ endpoints)
│   │   ├── services/           # 21 business-logic & performance services
│   │   ├── types/              # TypeScript type definitions
│   │   └── utils/              # Helpers, performance metrics, DB metrics
│   ├── prisma/                 # Schema (25+ models), migrations, seeds
│   ├── __tests__/              # 14 integration + 1 e2e + 4 unit suites
│   ├── load-tests/             # Artillery load & stress test scenarios
│   ├── infrastructure/         # Terraform (ECS) & Kubernetes HPA configs
│   ├── scripts/                # DevOps: backup, deploy, rollback, cost analysis
│   ├── docs/                   # 26 documentation files & runbooks
│   └── .github/workflows/      # 7 CI/CD workflow files
│
├── frontend/                   # React Native + Expo cross-platform app
│   ├── src/
│   │   ├── components/         # 76+ components across 12 categories
│   │   ├── screens/            # 30+ screens across 17 categories
│   │   ├── navigation/         # React Navigation 7 configuration
│   │   ├── services/           # API client, analytics, offline queue, cache
│   │   ├── hooks/              # Custom React hooks
│   │   ├── context/            # React context providers
│   │   ├── theme/              # Design system, tokens, light/dark theming
│   │   └── utils/              # Utility functions
│   ├── e2e/                    # Detox E2E test suites
│   ├── assets/                 # Images, fonts, Lottie animations
│   └── app-store-assets/       # App Store screenshots and metadata
│
├── docker-compose.yml          # Local development services (Postgres, Redis)
├── render.yaml                 # Render deployment configuration
└── railway.json                # Railway deployment configuration
```

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 18+ | Required for both packages |
| npm | 9+ | Comes bundled with Node.js |
| PostgreSQL | 15+ | Or use Docker (recommended) |
| Redis | 7+ | Or use Docker (recommended) |
| Docker | Latest | Optional — simplifies local services |
| Expo CLI | Latest | Required for mobile development |

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Glowverse-app
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env — see Environment Variables section below

# Start infrastructure services (Docker recommended)
docker-compose up -d postgres redis

# Initialise database: generate Prisma client → run migrations → seed data
npm run db:setup

# Start the development server (hot reload via tsx watch)
npm run dev
```

> **Backend running at:** `http://localhost:5000`
> **Health check:** `http://localhost:5000/health`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Expo development server
# Windows & macOS: defaults to tunnel mode with automatic LAN fallback
npm start

# Platform launchers
npm run web       # Open in browser
npm run android   # Android emulator / device
npm run ios       # iOS simulator (macOS only)

# Connectivity options
npm run start:tunnel   # Force tunnel (any OS)
npm run start:lan      # Prefer LAN (same Wi-Fi, VPN off)
```

> **Frontend running at:** `http://localhost:8081`

#### Windows-Specific Note
If LAN mode is blocked by Windows Firewall, run:
```powershell
powershell -ExecutionPolicy Bypass -File .\windows_fix.ps1
```
This opens port 8081 and sets the correct bundler host.

---

## 🌟 Feature Overview

### Backend — 16 Modules, 65+ Endpoints

| Module | Endpoint | Highlights |
|--------|----------|------------|
| 🔐 **Authentication** | `/auth/*` | JWT + refresh tokens, bcrypt hashing, secure sessions |
| 👤 **User Management** | `/users/*` | Profile CRUD, avatar uploads, preferences |
| 🛒 **E-Commerce** | `/products/*`, `/cart/*`, `/orders/*` | Full catalog, cart, order lifecycle |
| 📢 **Notifications** | `/notifications/*` | In-app notification center with preferences |
| 🎁 **Promotions** | `/promotions/*` | Percentage & fixed discount codes, validation |
| 🤝 **Referrals** | `/referrals/*` | Code generation, usage tracking, rewards & stats |
| 💪 **Fitness** | `/fitness/*` | Activity logging, goal tracking, progress analytics |
| 📚 **Beauty Guides** | `/guides/*` | Tutorials with steps, likes, bookmarks, comments |
| 🔍 **Search** | `/search/*` | Global search, suggestions, trending terms |
| 🎨 **AR / AI** | `/perfectcorp/*`, `/tryon/*`, `/analysis/*` | PerfectCorp virtual try-on & skin analysis |
| 📤 **File Upload** | `/upload` | Cloudinary integration with Sharp image processing |
| 🛡️ **Admin** | `/admin/*`, `/metrics` | Rate-limit management, performance metrics |
| 💾 **Caching & Perf** | — | Redis caching, adaptive rate limiting, DDoS protection |

### Frontend — React Native + Expo

| Feature | Details |
|---------|---------|
| 📱 **Cross-Platform** | iOS, Android, and Web from a single codebase |
| 🎨 **76+ Components** | Buttons, cards, animated wrappers, AR overlays, glassmorphism UI |
| 📱 **30+ Screens** | Auth, catalog, AR try-on, skin analysis, fitness, guides, profile |
| 🛒 **E-Commerce** | Multi-step checkout with Stripe card, Apple Pay & Google Pay |
| 🧠 **AI & AR** | Virtual try-on with frame capture, AI skin analysis overlays |
| 📶 **Offline-First** | Async request queue auto-synced on reconnect, optimistic cart UI |
| 📈 **Analytics** | Firebase Analytics — screens, commerce funnels, AR/AI, referrals |
| ✨ **Design System** | Light/dark themes, design tokens, Reanimated micro-interactions |
| 🔌 **Typed API Layer** | Full Axios client with retry/backoff, deduplication, health monitoring |
| ♿ **Accessibility** | Descriptive labels, focus management, touch-target enforcement |

---

## 🛠️ Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | JavaScript runtime |
| TypeScript | 5.7+ | Type safety |
| Express | 4.21 | Web framework |
| Prisma | 6.3 | ORM (PostgreSQL) |
| Redis (IORedis) | 5.4 | Caching & rate limiting |
| Winston | 3.17 | Structured logging |
| Sentry | 8.54 | Error tracking & APM |
| Sharp | 0.33 | Image processing |
| Cloudinary | 2.5 | Image hosting & CDN |
| Stripe | 17.6 | Payment processing |
| Zod | 3.24 | Runtime validation |
| Jest + Supertest | 29.7 | Testing |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React Native | 0.81 | Mobile framework |
| Expo SDK | 54 | Build & development platform |
| TypeScript | 5.9 | Type safety |
| React Navigation | 7 | Routing & navigation |
| React Native Reanimated | 4.1 | Smooth animations |
| React Native Paper | 5 | Material Design components |
| Axios | 1.13 | HTTP client |
| TanStack Query | 5 | Server state management |
| Stripe React Native | 0.33 | Payments |
| Firebase | 23 | Analytics & push notifications |
| Detox | 20 | E2E testing |

### DevOps & Infrastructure
| Technology | Purpose |
|------------|---------|
| GitHub Actions | CI/CD (7 workflows) |
| Docker | Containerisation & local dev |
| AWS ECS + RDS + S3 | Cloud production infrastructure |
| Terraform | Infrastructure as Code (ECS auto-scaling) |
| Kubernetes HPA | Container orchestration scaling |
| Sentry | Error tracking & performance monitoring |

---

## 🔌 API Reference

**Base URL:** `http://localhost:5000/api/v1`

| Module | Endpoint | Methods |
|--------|----------|---------|
| Auth | `/auth/*` | POST — register, login, refresh, logout |
| Users | `/users/*` | GET, PUT, DELETE — profile & preferences |
| Products | `/products/*` | GET — catalog, details, categories, search |
| Cart | `/cart/*` | GET, POST, PUT, DELETE |
| Orders | `/orders/*` | GET, POST, PUT — full lifecycle |
| Favorites | `/favorites/*` | GET, POST, DELETE |
| Notifications | `/notifications/*` | GET, PUT, DELETE |
| Promotions | `/promotions/*` | GET, POST — validation & application |
| Referrals | `/referrals/*` | GET, POST — codes & rewards |
| Fitness | `/fitness/*` | GET, POST, PUT, DELETE |
| Guides | `/guides/*` | GET, POST, PUT, DELETE |
| Search | `/search/*` | GET — query, suggestions, trending |
| Upload | `/upload` | POST |
| Skin Analysis | `/analysis/*` | POST, GET |
| Virtual Try-On | `/tryon/*` | POST, GET |
| PerfectCorp | `/perfectcorp/*` | POST, GET |

📖 **Full API Reference:** [backend/docs/API_REFERENCE.md](backend/docs/API_REFERENCE.md)

---

## 🗄️ Database

### Schema — 25+ Prisma Models

| Domain | Models |
|--------|--------|
| **Users** | `User`, `UserProfile`, `UserPreferences` |
| **E-Commerce** | `Product`, `Category`, `Cart`, `CartItem`, `Order`, `OrderItem`, `Favorite` |
| **Content** | `Guide`, `GuideStep`, `GuideComment`, `GuideLike`, `GuideBookmark` |
| **Fitness** | `FitnessActivity`, `FitnessGoal` |
| **Promotions** | `Promotion`, `ReferralCode`, `ReferralUsage` |
| **Notifications** | `Notification` |
| **AI / AR** | `SkinAnalysis`, `TryOnSession` |

```bash
# Common database commands (run from ./backend)
npm run prisma:generate     # Generate Prisma client
npm run prisma:migrate      # Apply pending migrations
npm run prisma:seed         # Seed with sample data
npm run prisma:studio       # Open Prisma Studio GUI
npm run db:setup            # All-in-one: generate + migrate + seed
```

---

## 🧪 Testing

### Backend
```bash
cd backend
npm test                    # All test suites
npm run test:coverage       # Coverage report
npm run test:integration    # Integration tests only
npm run test:verbose        # Verbose mode
npm run test:ci             # CI mode (limited workers)
```
**19 test suites:** 14 integration · 1 E2E · 4 service unit tests

### Frontend
```bash
cd frontend
npm test                    # Unit tests
npm run test:coverage       # Coverage report
npm run e2e:ios:test        # Detox E2E (iOS)
npm run e2e:android:test    # Detox E2E (Android)
```

> ⚠️ Backend integration tests require PostgreSQL. Use `docker-compose up -d postgres` or configure `.env.test`.

---

## 🚀 Deployment

### Docker (Local Development)
```bash
docker-compose up -d          # Start all services (Postgres + Redis)
docker-compose logs -f        # Stream logs
docker-compose down           # Stop all services
```

### Production Docker
```bash
docker-compose -f docker-compose.production.yml up -d
```

### CI/CD Pipelines (GitHub Actions)

| Workflow | Trigger | Description |
|----------|---------|-------------|
| `ci.yml` | PR / Push | Lint, test, security scan, performance regression |
| `test.yml` | PR | Test suite with Postgres & Redis services |
| `build.yml` | Push to main/staging | Docker build + push + Trivy vulnerability scan |
| `deploy-staging.yml` | Push to staging | Automated staging deployment |
| `deploy-production.yml` | Release tag | Production deploy with manual approval gate |
| `database-backup.yml` | Daily 2 AM UTC | Encrypted GPG-AES-256 backups to S3 |
| `load-test.yml` | Manual / Weekly | Automated Artillery load testing |

### Cloud Platforms
- **Render** — `render.yaml` configuration included
- **Railway** — `railway.json` configuration included
- **AWS ECS** — Full Terraform & deployment guide in [`backend/docs`](backend/docs/)

📖 **Deployment Guide:** [backend/docs/DEPLOYMENT_GUIDE.md](backend/docs/DEPLOYMENT_GUIDE.md)

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
# Server
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/glowverse

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000,http://localhost:8081

# Services (optional for local dev)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
PERFECTCORP_API_KEY=your-api-key
STRIPE_SECRET_KEY=sk_test_your-key
REDIS_URL=redis://localhost:6379
SENTRY_DSN=your-sentry-dsn
```

### Frontend (`frontend/app.json` extras)
```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api/v1
EXPO_PUBLIC_PERFECTCORP_API_KEY=your-api-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-key
ANALYTICS_ID=your-firebase-id
```

---

## 📦 Sample Data

After running `npm run db:setup` from the `backend/` directory:

| Type | Details |
|------|---------|
| **Test Accounts** | `admin@glowverse.com / Admin@123` · `demo@glowverse.com / Demo@123` |
| **Products** | 50+ products across 10 categories |
| **Promo Codes** | `WELCOME15` (15%) · `GLOW25` (25%) · `FLAT10` ($10 off) |
| **Beauty Guides** | 15–20 tutorials with step-by-step instructions |

---

## 🔒 Security

| Feature | Implementation |
|---------|---------------|
| Authentication | JWT with refresh token rotation |
| Password Hashing | bcrypt with 12 rounds |
| Rate Limiting | Adaptive tier-based limiting with behaviour analysis |
| DDoS Protection | Pattern detection, IP reputation, automatic blocking |
| Headers | Helmet security headers |
| CORS | Allowlist-only CORS policy |
| CSRF | Token-based CSRF protection |
| XSS | Input sanitisation & xss-clean middleware |
| SQL Injection | Prisma ORM parameterised queries |
| File Uploads | Type & size validation with Cloudinary scanning |
| Backups | GPG AES-256 encrypted database backups to S3 |
| Container Security | Trivy vulnerability scanning in CI |

---

## 📚 Documentation

### Backend
- [API Reference](backend/docs/API_REFERENCE.md)
- [Deployment Guide](backend/docs/DEPLOYMENT_GUIDE.md)
- [CI/CD Documentation](backend/docs/CI_CD.md)
- [Security Guide](backend/docs/SECURITY.md)
- [Rate Limiting & DDoS](backend/docs/RATE_LIMITING.md)
- [Performance Dashboard](backend/docs/PERFORMANCE_DASHBOARD.md)
- [Auto-Scaling](backend/docs/AUTO_SCALING.md)
- [Backup & Recovery](backend/docs/BACKUP_RECOVERY.md)
- [Configuration Guide](backend/docs/CONFIGURATION.md)
- [Onboarding Guide](backend/docs/ONBOARDING.md)
- [Production Runbook](backend/docs/PRODUCTION_DEPLOYMENT.md)

### Frontend
- [Frontend README](frontend/README.md) — Architecture, features, testing, status
- [EAS Build Guide](frontend/docs/EAS.md) — Build profiles, secrets, CI submission

### Project
- [Project Status Report](project_report.md) — Completion %, gaps, and go-live checklist

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and add tests where applicable
4. Ensure checks pass: `npm run lint && npm run type-check && npm test`
5. Commit with a descriptive message: `git commit -m 'feat: add your feature'`
6. Push the branch: `git push origin feature/your-feature-name`
7. Open a Pull Request — CI will run automatically

---

## 📄 License

This project is proprietary software developed for the Glowverse beauty platform. All rights reserved.

---

<div align="center">

**Built with ❤️ for the Glowverse beauty community**

*Last updated: February 20, 2026*

</div>
