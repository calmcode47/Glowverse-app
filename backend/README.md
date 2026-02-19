# Glowverse Backend API

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7%2B-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.3-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7%2B-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Jest](https://img.shields.io/badge/Jest-29.7-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)

**Production-ready Node.js + Express + TypeScript REST API powering the Glowverse AI/AR beauty platform. Features 65+ endpoints across 16 modules with JWT authentication, Prisma ORM, Redis caching, Sentry APM, adaptive rate limiting, DDoS protection, auto-scaling, and full CI/CD automation.**

</div>

---

## 📊 Status

| Area | Status | Details |
|------|:------:|---------|
| API Endpoints | ✅ | 65+ across 16 controllers, 20 route files |
| Business Services | ✅ | 21 services (auth, products, orders, AI/AR, performance) |
| Database | ✅ | 25+ Prisma models, PostgreSQL with optimised indexes |
| CI/CD | ✅ | 7 GitHub Actions workflows |
| Security | ✅ | JWT, adaptive rate limiting, DDoS protection, Helmet, CSRF |
| Caching | ✅ | Redis intelligent caching with invalidation strategies |
| Monitoring | ✅ | Sentry Performance + Profiling (APM) |
| Performance | ✅ | Load tested, indexed, auto-scaling ready |
| Documentation | ✅ | 26 docs including API reference, runbooks, scaling guides |
| Testing | ⚠️ | 19 suites (14 integration · 1 e2e · 4 unit) — edge cases in progress |
| Payments | 🚧 | Stripe 3DS & webhook orchestration (in progress) |
| Notification Delivery | 🚧 | Email/push provider integrations (in progress) |

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your database URL, JWT secrets, and API keys

# 3. Start infrastructure services (Docker recommended)
docker-compose up -d postgres redis

# 4. Initialise the database
npm run db:setup   # generate Prisma client → migrate → seed

# 5. Start the development server
npm run dev
```

> **Server:** `http://localhost:5000`  
> **Health Check:** `http://localhost:5000/health`  
> **API Base URL:** `http://localhost:5000/api/v1`

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.ts                          # Express app bootstrap & middleware stack
│   ├── server.ts                       # HTTP server entry point
│   ├── config/
│   │   ├── env.ts                      # Validated environment variables
│   │   ├── database.ts                 # Prisma client & connection pool
│   │   ├── redis.ts                    # IORedis client
│   │   ├── cloudinary.ts               # Cloudinary image hosting
│   │   ├── sentry.ts                   # Sentry error tracking & APM
│   │   └── tracing.ts                  # OpenTelemetry performance tracing
│   ├── controllers/                    # 16 request/response controllers
│   ├── services/                       # 21 business-logic services
│   │   ├── ip-reputation.service.ts    # IP scoring for DDoS protection
│   │   └── ...                         # auth, products, orders, AR, etc.
│   ├── middleware/
│   │   ├── auth.ts                     # JWT authentication & refresh
│   │   ├── adaptive-rate-limit.ts      # Tier-based smart rate limiting
│   │   ├── ddos-protection.ts          # Pattern detection & auto-blocking
│   │   ├── cache.ts                    # Redis response caching
│   │   ├── csrf.ts                     # CSRF token generation & validation
│   │   └── ...                         # validation, sanitisation, logging
│   ├── routes/                         # 20 route files
│   │   ├── admin/
│   │   │   └── rate-limits.routes.ts   # Rate limit & blocked-IP management
│   │   ├── metrics.routes.ts           # Performance metrics endpoint
│   │   └── ...                         # auth, users, products, orders, etc.
│   ├── utils/
│   │   ├── performance.ts              # Performance monitoring utilities
│   │   ├── db-metrics.ts               # Database query metrics
│   │   └── ...
│   └── types/                          # Shared TypeScript types & interfaces
├── prisma/
│   ├── schema.prisma                   # DB schema (25+ models)
│   ├── migrations/                     # Migration history
│   └── seed.ts                         # Development data seeder
├── __tests__/                          # Test suites
│   ├── auth.test.ts
│   ├── products.test.ts
│   ├── cart.test.ts
│   ├── orders.test.ts
│   └── ...                             # 14 integration + 1 e2e + 4 unit
├── load-tests/
│   ├── scenarios.yml                   # Standard load scenarios
│   ├── stress-test.yml                 # Stress & spike testing
│   └── endurance-test.yml              # Long-running soak tests
├── infrastructure/
│   ├── ecs-autoscaling.tf              # Terraform — AWS ECS auto-scaling
│   └── k8s-hpa.yaml                    # Kubernetes HPA configuration
├── scripts/
│   ├── backup-database.sh              # GPG-encrypted DB backup to S3
│   ├── deploy.sh                       # Manual deployment script
│   ├── run-load-tests.sh               # Execute Artillery scenarios
│   ├── analyze-load-tests.js           # Parse & report test results
│   ├── query-optimization-report.ts    # Slow-query & N+1 analysis
│   ├── detect-performance-regression.ts # CI performance gate
│   ├── optimize-resources.sh           # Resource usage analysis
│   └── cost-optimization-report.sh     # AWS cost analysis
├── docs/                               # 26 documentation files
├── .github/workflows/                  # 7 CI/CD workflows
├── docker-compose.yml                  # Local development services
├── docker-compose.production.yml       # Production Docker stack
├── Dockerfile                          # Development image
├── Dockerfile.production               # Optimised production image
├── jest.config.js                      # Jest configuration
└── tsconfig.json                       # TypeScript configuration
```

---

## 🔌 API Endpoints (65+)

**Base URL:** `/api/v1`

| Module | Routes | Auth | Description |
|--------|--------|:----:|-------------|
| `/auth` | 4 | — | Register, login, token refresh, logout |
| `/users` | 5 | ✅ | Profile CRUD, preferences, avatar upload |
| `/products` | 4 | Mixed | Catalog, details, categories, search |
| `/cart` | 4 | ✅ | View, add item, update quantity, remove |
| `/orders` | 4 | ✅ | Create, list, detail, cancel |
| `/favorites` | 3 | ✅ | Add, remove, list wishlist |
| `/notifications` | 4 | ✅ | List, mark read, mark all, delete |
| `/promotions` | 4 | Mixed | Validate, apply, list, create (admin) |
| `/referrals` | 4 | ✅ | Generate code, validate, redeem, stats |
| `/fitness` | 6+ | ✅ | Activities, goals, progress, statistics |
| `/guides` | 6+ | Mixed | CRUD, steps, likes, bookmarks, comments |
| `/search` | 3 | — | Global search, suggestions, popular terms |
| `/upload` | 1 | ✅ | File upload (images via Cloudinary) |
| `/analysis` | 3 | ✅ | Initiate skin analysis, results, history |
| `/tryon` | 4 | ✅ | Create/list/view virtual try-on sessions |
| `/perfectcorp` | 5 | ✅ | Health check, face detect, AR recommendations |
| `/metrics` | 1 | Admin | Server performance metrics |
| `/admin/rate-limits` | 3 | Admin | Rate limit stats, blocked IPs, unblock |

📖 **Full reference:** [docs/API_REFERENCE.md](docs/API_REFERENCE.md)

---

## 🗄️ Database

### Prisma Schema — 25+ Models

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
npm run prisma:generate     # Regenerate Prisma client after schema changes
npm run prisma:migrate      # Apply pending migrations (dev)
npm run prisma:deploy       # Apply migrations (production)
npm run prisma:seed         # Seed with sample data
npm run prisma:studio       # Launch Prisma Studio GUI
npm run db:setup            # All-in-one: generate → migrate → seed
```

---

## ⚡ Performance & Scaling

### Adaptive Rate Limiting
- **Tier-based limits:** Different thresholds per user role (guest, user, premium, admin)
- **Behaviour-aware:** Automatically tightens limits for suspicious patterns
- **DDoS protection:** IP reputation scoring, pattern detection, auto-blocking
- **Admin endpoints:** `/api/v1/admin/rate-limits/*` for live monitoring

### Application Performance Monitoring
- **Sentry Performance:** 20% transaction sampling in production
- **Profiling:** 10% profile sampling for deep code analysis
- **Custom spans:** Track business-critical operations (checkout, AI calls)
- **Performance regression CI:** Automated baseline comparison on every PR

### Database Optimisation
- Indexes optimised for hot queries (products by category, orders by user, etc.)
- Connection pool tuned per environment: Production 20 · Staging 10 · Dev 5
- Query analysis scripts to detect N+1 and slow queries

### Auto-Scaling
| Metric | Target | Min Instances | Max Instances |
|--------|--------|:-------------:|:-------------:|
| CPU utilisation | > 70% | 2 | 20 |
| Memory utilisation | > 80% | 2 | 20 |
| Request rate | > 1,000 req/instance | 2 | 20 |

📖 **Docs:** [RATE_LIMITING.md](docs/RATE_LIMITING.md) · [PERFORMANCE_DASHBOARD.md](docs/PERFORMANCE_DASHBOARD.md) · [AUTO_SCALING.md](docs/AUTO_SCALING.md)

---

## 🧪 Testing

```bash
npm test                        # Run all test suites
npm run test:coverage           # With coverage report
npm run test:integration        # Integration tests only
npm run test:verbose            # Full verbose output
npm run test:ci                 # CI mode (coverage + limited workers)
```

**Test suites (19 total):**
- **Integration (14):** Auth, Users, Products, Cart, Orders, Notifications, Promotions, Referrals, Fitness, Guides, Search, PerfectCorp, Upload, Image/Storage
- **E2E (1):** Full user journey (register → browse → cart → checkout)
- **Unit (4):** CartService, NotificationService, OrderService, PromotionService

> ⚠️ Integration tests require a live PostgreSQL connection. Use `docker-compose up -d postgres` or configure `.env.test`.

---

## 🛠️ Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload (`tsx watch`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Start compiled production server |
| `npm run lint` | Run ESLint on all `.ts` files |
| `npm run lint:fix` | Auto-fix linting issues |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Check Prettier formatting |
| `npm run type-check` | Verify TypeScript without emitting |
| `npm test` | Run all tests |
| `npm run test:coverage` | Tests with coverage report |
| `npm run test:ci` | CI-optimised test run |
| `npm run db:setup` | Initialise database (generate → migrate → seed) |
| `npm run prisma:studio` | Open Prisma Studio |

---

## 🔐 Environment Variables

| Variable | Required | Default | Description |
|----------|:--------:|---------|-------------|
| `NODE_ENV` | ✅ | `development` | Runtime environment |
| `PORT` | ✅ | `5000` | HTTP server port |
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | — | JWT access token signing key |
| `JWT_REFRESH_SECRET` | ✅ | — | Refresh token signing key |
| `JWT_EXPIRES_IN` | — | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | — | `7d` | Refresh token lifetime |
| `REDIS_URL` | — | — | Redis connection URL (caching disabled if unset) |
| `CLOUDINARY_CLOUD_NAME` | — | — | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | — | — | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | — | — | Cloudinary API secret |
| `PERFECTCORP_API_KEY` | — | `mock` | AI/AR API key (auto-mocked if unset) |
| `STRIPE_SECRET_KEY` | — | — | Stripe secret key for payments |
| `SENTRY_DSN` | — | — | Sentry DSN for error tracking |
| `CORS_ORIGIN` | — | `*` | Allowed CORS origins (comma-separated) |
| `RATE_LIMIT_WINDOW_MS` | — | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX` | — | `100` | Max requests per window |
| `BCRYPT_ROUNDS` | — | `12` | bcrypt work factor |

---

## 🚀 Deployment

### Docker

```bash
# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.production.yml up -d
```

### CI/CD Pipelines (GitHub Actions)

| Workflow | Trigger | What It Does |
|----------|---------|--------------|
| `ci.yml` | PR / Push | Lint, type-check, test, security scan, perf regression |
| `test.yml` | PR | Full test suite with live Postgres & Redis |
| `build.yml` | Push to main/staging | Build & push Docker images + Trivy scan |
| `deploy-staging.yml` | Push to staging | Automated staging deployment |
| `deploy-production.yml` | Release tag | Production deploy with approval gate |
| `database-backup.yml` | Daily 2 AM UTC | GPG-AES-256 encrypted backup to S3 |
| `load-test.yml` | Manual / Weekly | Artillery load testing |

📖 **Guides:** [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) · [CI_CD.md](docs/CI_CD.md) · [PRODUCTION_DEPLOYMENT.md](docs/PRODUCTION_DEPLOYMENT.md)

---

## 🔒 Security

| Feature | Implementation |
|---------|---------------|
| Authentication | JWT with short-lived access tokens + refresh token rotation |
| Password Hashing | bcrypt with 12 rounds |
| Rate Limiting | Adaptive tier-based limiting with behaviour analysis |
| DDoS Protection | IP reputation scoring, pattern detection, automatic IP blocking |
| Security Headers | Helmet middleware |
| CORS | Strict allowlist-based policy |
| CSRF Protection | `csrf-csrf` double-submit cookie pattern |
| XSS Prevention | `xss-clean` + `express-mongo-sanitize` |
| HPP | HTTP Parameter Pollution protection |
| SQL Injection | Prisma ORM parameterised queries |
| Database Backups | GPG AES-256 encrypted, stored on S3 |
| Dependency Scanning | Trivy in CI pipeline |

---

## 📈 Performance Targets

| Metric | Target |
|--------|--------|
| P50 response time | < 100ms |
| P95 response time | < 300ms |
| P99 response time | < 500ms |
| Concurrent users | 1,000+ |
| Requests per second | 500+ |

---

## 📚 Documentation Index

### Core
| Document | Description |
|----------|-------------|
| [API_REFERENCE.md](docs/API_REFERENCE.md) | Complete endpoint reference with request/response schemas |
| [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) | Step-by-step deployment procedures |
| [CI_CD.md](docs/CI_CD.md) | CI/CD pipeline documentation |
| [SECURITY.md](docs/SECURITY.md) | Security implementation & hardening guide |
| [BACKUP_RECOVERY.md](docs/BACKUP_RECOVERY.md) | Backup strategy & disaster recovery |
| [CONFIGURATION.md](docs/CONFIGURATION.md) | Environment & configuration reference |
| [ONBOARDING.md](docs/ONBOARDING.md) | New developer onboarding guide |
| [PRODUCTION_DEPLOYMENT.md](docs/PRODUCTION_DEPLOYMENT.md) | Production deployment runbook |

### Performance & Scaling
| Document | Description |
|----------|-------------|
| [RATE_LIMITING.md](docs/RATE_LIMITING.md) | Adaptive rate limiting & DDoS protection |
| [PERFORMANCE_DASHBOARD.md](docs/PERFORMANCE_DASHBOARD.md) | APM setup & monitoring |
| [PERFORMANCE_BASELINES.md](docs/PERFORMANCE_BASELINES.md) | SLA targets and baselines |
| [AUTO_SCALING.md](docs/AUTO_SCALING.md) | ECS & Kubernetes auto-scaling config |
| [RUM_SETUP.md](docs/RUM_SETUP.md) | Real User Monitoring setup |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and add relevant tests
4. Run quality checks: `npm run lint && npm run type-check && npm test`
5. Commit: `git commit -m 'feat: describe your change'`
6. Push: `git push origin feature/your-feature`
7. Open a Pull Request

---

## 📄 License

This project is proprietary and confidential. All rights reserved.

---

*Last updated: February 20, 2026*
