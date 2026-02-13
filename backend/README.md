# Glowverse Backend API

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.18-lightgrey.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.7-2D3748.svg)](https://www.prisma.io/)
[![Jest](https://img.shields.io/badge/Jest-29.7-C21325.svg)](https://jestjs.io/)

Production-ready Node.js + Express + TypeScript REST API powering the Glowverse AI/AR beauty platform. Features 60+ endpoints across 16 modules with JWT authentication, Prisma ORM, Redis caching, Sentry monitoring, and full CI/CD automation.

---

## 📊 Status

| Area | Status | Details |
|------|--------|---------|
| API Endpoints | ✅ 60+ | 16 controllers, 17 route files |
| Services | ✅ 19 | Business logic layer complete |
| Database | ✅ 25+ models | Prisma ORM with PostgreSQL |
| CI/CD | ✅ 6 workflows | GitHub Actions (test, build, deploy, backup) |
| Security | ✅ Full | JWT, rate limiting, Helmet, CSRF, XSS, sanitization |
| Caching | ✅ Configured | Redis (IORedis) with cache middleware |
| Monitoring | ✅ Configured | Sentry + Winston logging |
| Documentation | ✅ 21 docs | API docs, deployment, runbooks, onboarding |
| Testing | ⚠️ 19 suites | 14 integration + 1 e2e + 4 unit |
| Scripts | ✅ 6 | Backup, restore, verify, deploy, rollback, audit |

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database and API keys

# Start PostgreSQL (Docker recommended)
docker-compose up -d postgres

# Initialize database
npm run db:setup

# Start development server
npm run dev
```

**Server:** `http://localhost:5000`
**Health:** `http://localhost:5000/health`

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.ts                          # Express app setup
│   ├── server.ts                       # Server entry point
│   ├── config/                         # Configuration
│   │   ├── env.ts                      # Environment variables
│   │   ├── database.ts                 # Prisma client
│   │   ├── redis.ts                    # Redis client
│   │   ├── cloudinary.ts              # Image hosting
│   │   ├── sentry.ts                  # Error tracking
│   │   └── tracing.ts                 # Performance tracing
│   ├── controllers/                    # 16 controllers
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   ├── product.controller.ts
│   │   ├── cart.controller.ts
│   │   ├── order.controller.ts
│   │   ├── favorite.controller.ts
│   │   ├── notification.controller.ts
│   │   ├── promotion.controller.ts
│   │   ├── referral.controller.ts
│   │   ├── fitness.controller.ts
│   │   ├── guide.controller.ts
│   │   ├── search.controller.ts
│   │   ├── upload.controller.ts
│   │   ├── analysis.controller.ts
│   │   ├── tryon.controller.ts
│   │   └── perfectcorp.controller.ts
│   ├── services/                       # 19 services
│   │   ├── auth.service.ts
│   │   ├── user.service.ts
│   │   ├── product.service.ts
│   │   ├── cart.service.ts
│   │   ├── order.service.ts
│   │   ├── notification.service.ts
│   │   ├── promotion.service.ts
│   │   ├── referral.service.ts
│   │   ├── fitness.service.ts
│   │   ├── guide.service.ts
│   │   ├── search.service.ts
│   │   ├── image.service.ts
│   │   ├── storage.service.ts
│   │   ├── cache.service.ts
│   │   └── perfectcorp.service.ts
│   ├── middleware/                     # Security & utility middleware
│   │   ├── auth.ts                    # JWT authentication
│   │   ├── cache.ts                   # Response caching
│   │   ├── csrf.ts                    # CSRF protection
│   │   ├── errorHandler.ts            # Global error handler
│   │   ├── rate-limit.ts              # Rate limiting
│   │   ├── sanitize.ts                # Input sanitization
│   │   ├── sentry.ts                  # Sentry middleware
│   │   ├── upload.ts                  # Multer file upload
│   │   └── validation/                # Request validation
│   ├── routes/                         # 17 route files
│   ├── types/                          # TypeScript types
│   └── utils/                          # Utilities & helpers
├── prisma/
│   ├── schema.prisma                   # Database schema (25+ models)
│   ├── migrations/                     # Migration history
│   └── seed.ts                         # Database seeder
├── __tests__/
│   ├── integration/                    # 13 integration test files
│   ├── e2e/                           # 1 e2e test (user journey)
│   └── setup.ts                       # Test configuration
├── scripts/
│   ├── backup-database.sh             # Encrypted DB backup
│   ├── restore-database.sh            # DB restoration
│   ├── verify-backup.sh               # Backup integrity check
│   ├── deploy.sh                      # Manual deployment
│   ├── rollback.sh                    # Rollback procedure
│   └── security-audit.sh             # Security audit
├── docs/                              # 21 documentation files
├── .github/workflows/                 # 6 CI/CD workflows
├── Dockerfile                         # Development Docker
├── Dockerfile.production              # Production Docker (multi-stage)
├── docker-compose.yml                 # Local dev services
└── docker-compose.production.yml      # Production services
```

---

## 🔌 API Endpoints (60+)

**Base URL:** `/api/v1`

| Module | Routes | Auth | Description |
|--------|--------|------|-------------|
| `/auth` | 4 | No | Register, login, refresh, logout |
| `/users` | 5 | Yes | Profile CRUD, preferences, avatar |
| `/products` | 4 | Mixed | Catalog, search, categories, details |
| `/cart` | 4 | Yes | View, add, update, remove |
| `/orders` | 4 | Yes | Create, list, details, cancel |
| `/favorites` | 3 | Yes | Add, remove, list |
| `/notifications` | 4 | Yes | List, read, mark all, delete |
| `/promotions` | 4 | Mixed | Validate, apply, list, create |
| `/referrals` | 4 | Yes | Generate, validate, redeem, stats |
| `/fitness` | 6+ | Yes | Activities, goals, progress, stats |
| `/guides` | 6+ | Mixed | CRUD, likes, bookmarks, comments |
| `/search` | 3 | No | Query, suggestions, popular |
| `/upload` | 1 | Yes | File upload |
| `/analysis` | 3 | Yes | Skin analysis, results, history |
| `/tryon` | 4 | Yes | Virtual try-on sessions |
| `/perfectcorp` | 5 | Yes | AI/AR health, face detect, recommendations |

📖 **Full reference:** [docs/API_REFERENCE.md](docs/API_REFERENCE.md)

---

## 🧪 Testing

```bash
npm test                      # All tests
npm run test:coverage         # With coverage
npm run test:integration      # Integration only
npm run test:verbose          # Verbose output
npm run test:ci               # CI mode
```

**Test suites:** 14 integration + 1 e2e + 4 service unit tests

> **Note:** Integration tests require PostgreSQL. Use `docker-compose up -d postgres` or configure `.env.test`.

---

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting |
| `npm run type-check` | Verify TypeScript types |
| `npm test` | Run all tests |
| `npm run test:coverage` | Test with coverage report |
| `npm run test:ci` | CI test mode |
| `npm run db:setup` | Generate + migrate + seed |
| `npm run prisma:studio` | Open Prisma Studio |

---

## 🔐 Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | `development` | Environment |
| `PORT` | Yes | `5000` | Server port |
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `JWT_SECRET` | Yes | — | JWT signing key |
| `JWT_REFRESH_SECRET` | Yes | — | Refresh token signing key |
| `REDIS_URL` | No | — | Redis connection URL |
| `CLOUDINARY_*` | No | — | Image hosting config |
| `PERFECTCORP_API_KEY` | No | `mock` | AI/AR API key (uses mock if not set) |
| `SENTRY_DSN` | No | — | Error tracking DSN |

---

## 🚀 Deployment

### Docker
```bash
docker-compose up -d                                    # Development
docker-compose -f docker-compose.production.yml up -d   # Production
```

### CI/CD (GitHub Actions)

| Workflow | Trigger | What It Does |
|----------|---------|-------------|
| `ci.yml` | PR/Push | Lint, test, security scan |
| `test.yml` | PR | Test with Postgres + Redis services |
| `build.yml` | Push main/staging | Docker build + push + Trivy scan |
| `deploy-staging.yml` | Push staging | Auto-deploy to staging |
| `deploy-production.yml` | Release tag | Production deploy with approval |
| `database-backup.yml` | Daily 2 AM UTC | Encrypted DB backup to S3 |

📖 **Guides:** [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) · [CI_CD.md](docs/CI_CD.md) · [PRODUCTION_DEPLOYMENT.md](docs/PRODUCTION_DEPLOYMENT.md)

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [API_REFERENCE.md](docs/API_REFERENCE.md) | Complete endpoint reference |
| [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) | Deployment procedures |
| [CI_CD.md](docs/CI_CD.md) | CI/CD pipeline documentation |
| [SECURITY.md](docs/SECURITY.md) | Security implementation |
| [BACKUP_RECOVERY.md](docs/BACKUP_RECOVERY.md) | Backup & disaster recovery |
| [CONFIGURATION.md](docs/CONFIGURATION.md) | Configuration guide |
| [ONBOARDING.md](docs/ONBOARDING.md) | New developer onboarding |
| [GITHUB_SETUP.md](docs/GITHUB_SETUP.md) | Repository setup |
| [GITHUB_SECRETS.md](docs/GITHUB_SECRETS.md) | Required secrets |
| [RELEASE_MANAGEMENT.md](docs/RELEASE_MANAGEMENT.md) | Release process |

---

## 🔒 Security Features

- JWT authentication + refresh tokens
- bcrypt password hashing (10 rounds)
- Rate limiting (100 req/15min)
- Helmet security headers
- CORS with whitelist
- CSRF protection
- XSS prevention
- Input sanitization (express-mongo-sanitize)
- HPP (HTTP parameter pollution protection)
- Prisma ORM (SQL injection safe)
- Encrypted database backups (GPG AES-256)
- Trivy vulnerability scanning in CI

---

*Last Updated: February 13, 2026*
