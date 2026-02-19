# Glowverse Backend API

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.18-lightgrey.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.7-2D3748.svg)](https://www.prisma.io/)
[![Jest](https://img.shields.io/badge/Jest-29.7-C21325.svg)](https://jestjs.io/)

Production-ready Node.js + Express + TypeScript REST API powering the Glowverse AI/AR beauty platform. Features 60+ endpoints across 16 modules with JWT authentication, Prisma ORM, Redis caching, Sentry APM, adaptive rate limiting, auto-scaling, and full CI/CD automation.

---

## 📊 Status

| Area | Status | Details |
|------|--------|---------|
| API Endpoints | ✅ 65+ | 16 controllers, 20 route files |
| Services | ✅ 21 | Business logic + performance services |
| Database | ✅ 25+ models | Prisma ORM with PostgreSQL + indexes |
| CI/CD | ✅ 7 workflows | GitHub Actions (test, build, deploy, backup, perf) |
| Security | ✅ Enhanced | JWT, adaptive rate limiting, DDoS protection |
| Caching | ✅ Optimized | Redis with intelligent invalidation |
| Monitoring | ✅ Full APM | Sentry Performance + Profiling |
| Performance | ✅ Optimized | Load tested, indexed, auto-scaling ready |
| Documentation | ✅ 26 docs | API, deployment, performance, scaling |
| Testing | ⚠️ 19 suites | 14 integration + 1 e2e + 4 unit |
| Scripts | ✅ 12 | Backup, deploy, load test, optimization |

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

### Frontend (Windows & macOS)
To run the mobile app locally:
```bash
cd ../frontend
npm install
npm start           # Unified start; Windows/macOS default to tunnel with LAN fallback
npm run ios         # macOS only (simulator)
npm run android     # Android emulator
```
For LAN mode: `npm run start:lan` (ensure same Wi‑Fi; VPNs off). If needed, force a specific IP: `HOST_IP=YOUR_MAC_IP npm run start:lan`. On Windows, if blocked, use: `powershell -ExecutionPolicy Bypass -File .\windows_fix.ps1`.

---

## 🎯 Phase 4: Performance Optimization (NEW)

### Rate Limiting & DDoS Protection
- **Adaptive Rate Limiting**: Automatically adjusts limits based on user tier and behavior
- **DDoS Protection**: Pattern detection, IP reputation tracking, automatic blocking
- **Admin Dashboard**: Monitor rate limits, blocked IPs, and suspicious activity
- **Endpoints**: `/api/v1/admin/rate-limits/*`

### Application Performance Monitoring (APM)
- **Sentry Performance**: 20% trace sampling in production
- **Profiling**: 10% profile sampling for deep code analysis
- **Custom Metrics**: Track business-critical operations
- **Performance Regression Detection**: Automated CI checks against baselines

### Database Optimization
- **Indexes**: Optimized for common queries (products, orders, users)
- **Query Analysis**: Scripts to identify slow queries and N+1 problems
- **Connection Pooling**: Environment-based sizing (Prod: 20, Staging: 10, Dev: 5)

### Load Testing
- **Artillery Tests**: Scenarios for smoke, load, stress, and endurance testing
- **Performance Baselines**: P50, P95, P99 latency targets documented
- **Automated Analysis**: Scripts to analyze test results and generate reports

### Auto-Scaling Configuration
- **ECS Auto-Scaling**: CPU (70%), Memory (80%), Request-based (1000 req/instance)
- **Kubernetes HPA**: Multi-metric scaling with intelligent policies
- **Scheduled Scaling**: Peak hours (5-20 instances), Off-peak (2-10 instances)
- **Cost Optimization**: ~45% potential savings through Reserved Instances and Spot capacity

📖 **Performance Docs**: [RATE_LIMITING.md](docs/RATE_LIMITING.md) · [PERFORMANCE_DASHBOARD.md](docs/PERFORMANCE_DASHBOARD.md) · [AUTO_SCALING.md](docs/AUTO_SCALING.md)

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.ts                          # Express app setup
│   ├── server.ts                       # Server entry point
│   ├── config/                         # Configuration
│   │   ├── env.ts                      # Environment variables
│   │   ├── database.ts                 # Prisma client + connection pool
│   │   ├── redis.ts                    # Redis client
│   │   ├── cloudinary.ts              # Image hosting
│   │   ├── sentry.ts                  # Error tracking + APM
│   │   └── tracing.ts                 # Performance tracing
│   ├── controllers/                    # 16 controllers
│   ├── services/                       # 21 services
│   │   ├── ip-reputation.service.ts   # IP tracking for DDoS
│   │   └── ...                        # Auth, products, orders, etc.
│   ├── middleware/                     # Security & utility middleware
│   │   ├── auth.ts                    # JWT authentication
│   │   ├── adaptive-rate-limit.ts     # Smart rate limiting
│   │   ├── ddos-protection.ts         # DDoS detection
│   │   ├── cache.ts                   # Response caching
│   │   ├── csrf.ts                    # CSRF protection
│   │   └── ...
│   ├── routes/                         # 20 route files
│   │   ├── admin/                     # Admin-only routes
│   │   │   └── rate-limits.routes.ts  # Rate limit management
│   │   ├── metrics.routes.ts          # Performance metrics
│   │   └── ...
│   ├── utils/                          # Utilities & helpers
│   │   ├── performance.ts             # Performance monitoring
│   │   ├── db-metrics.ts              # Database metrics
│   │   └── ...
│   └── types/                          # TypeScript types
├── prisma/
│   ├── schema.prisma                   # Database schema (25+ models)
│   ├── migrations/                     # Migration history
│   │   └── add_performance_indexes/   # Performance indexes
│   └── seed.ts                         # Database seeder
├── infrastructure/
│   ├── ecs-autoscaling.tf             # AWS ECS auto-scaling (Terraform)
│   └── k8s-hpa.yaml                   # Kubernetes HPA config
├── load-tests/
│   ├── scenarios.yml                  # Load test scenarios
│   ├── stress-test.yml                # Stress testing
│   ├── endurance-test.yml             # Endurance testing
│   └── helpers.js                     # Test utilities
├── scripts/
│   ├── backup-database.sh             # Encrypted DB backup
│   ├── deploy.sh                      # Manual deployment
│   ├── run-load-tests.sh              # Execute load tests
│   ├── analyze-load-tests.js          # Analyze test results
│   ├── query-optimization-report.ts   # Query analysis
│   ├── detect-performance-regression.ts # CI performance checks
│   ├── optimize-resources.sh          # Resource usage analysis
│   ├── cost-optimization-report.sh    # Cost analysis
│   └── test-autoscaling.sh            # Auto-scaling verification
├── docs/                              # 26 documentation files
│   ├── RATE_LIMITING.md               # Rate limiting guide
│   ├── PERFORMANCE_DASHBOARD.md       # APM setup
│   ├── AUTO_SCALING.md                # Scaling configuration
│   ├── PERFORMANCE_BASELINES.md       # Performance targets
│   ├── RUM_SETUP.md                   # Real User Monitoring
│   └── ...
├── __tests__/                         # Test suites
├── .github/workflows/                 # 7 CI/CD workflows
└── docker-compose.yml                 # Local dev services
```

---

## ✅ Completion & What’s Left

**Overall completion:** ≈ 88%

- Implemented
  - JWT auth and refresh, users/profile/preferences
  - Products/catalog/search; cart and orders flows
  - Promotions and referrals (code generation, usage, stats)
  - Notifications API and preferences; guides and fitness modules
  - Uploads with Cloudinary/Sharp; PerfectCorp integration shell
  - Redis caching, security middleware, rate limiting and DDoS protections
  - CI/CD with build/test/deploy and backup workflows; performance baselines and runbooks
- Remaining
  - Payments: Stripe 3DS and webhook orchestration with idempotent order state updates
  - Admin analytics: aggregation endpoints for revenue by category/product/status, engagement KPIs, and AR usage metrics
  - Notification delivery integrations (email/push) and background queue hardening
  - Additional integration tests for edge cases; final production migrations and seeds

For cross‑project status and the go‑live checklist see:
[Project Status Report](../project_report.md)

---

## 🔌 API Endpoints (65+)

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
| `/metrics` | 1 | Admin | Performance metrics endpoint |
| `/admin/rate-limits` | 3 | Admin | Rate limit management, blocked IPs |

📖 **Full reference:** [docs/API_REFERENCE.md](docs/API_REFERENCE.md)

---

## 🧪 Testing

```bash
npm test                      # All tests
npm run test:coverage         # With coverage
npm run test:integration      # Integration only
npm run test:load             # Load testing with Artillery
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
| `npm run test:load` | Run load tests |
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
| `SENTRY_DSN` | No | — | Error tracking + APM DSN |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | Rate limit window (15 min) |
| `RATE_LIMIT_MAX` | No | `100` | Max requests per window |

---

## 🚀 Deployment

### Docker
```bash
docker-compose up -d                                    # Development
docker-compose -f docker-compose.production.yml up -d   # Production
```

### CI/CD (GitHub Actions)

| Workflow | Trigger | What It Does |
|----------|---------|--------------|
| `ci.yml` | PR/Push | Lint, test, security scan, **performance regression** |
| `test.yml` | PR | Test with Postgres + Redis services |
| `build.yml` | Push main/staging | Docker build + push + Trivy scan |
| `deploy-staging.yml` | Push staging | Auto-deploy to staging |
| `deploy-production.yml` | Release tag | Production deploy with approval |
| `database-backup.yml` | Daily 2 AM UTC | Encrypted DB backup to S3 |
| `load-test.yml` | Manual/Weekly | Automated load testing |

📖 **Guides:** [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) · [CI_CD.md](docs/CI_CD.md) · [PRODUCTION_DEPLOYMENT.md](docs/PRODUCTION_DEPLOYMENT.md)

---

## 📚 Documentation

### Core Documentation
| Document | Description |
|----------|-------------|
| [API_REFERENCE.md](docs/API_REFERENCE.md) | Complete endpoint reference |
| [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) | Deployment procedures |
| [CI_CD.md](docs/CI_CD.md) | CI/CD pipeline documentation |
| [SECURITY.md](docs/SECURITY.md) | Security implementation |
| [BACKUP_RECOVERY.md](docs/BACKUP_RECOVERY.md) | Backup & disaster recovery |
| [CONFIGURATION.md](docs/CONFIGURATION.md) | Configuration guide |
| [ONBOARDING.md](docs/ONBOARDING.md) | New developer onboarding |

### Performance & Scaling Documentation
| Document | Description |
|----------|-------------|
| [RATE_LIMITING.md](docs/RATE_LIMITING.md) | Adaptive rate limiting & DDoS protection |
| [PERFORMANCE_DASHBOARD.md](docs/PERFORMANCE_DASHBOARD.md) | APM setup & monitoring |
| [PERFORMANCE_BASELINES.md](docs/PERFORMANCE_BASELINES.md) | Performance targets & SLAs |
| [AUTO_SCALING.md](docs/AUTO_SCALING.md) | Auto-scaling configuration |
| [RUM_SETUP.md](docs/RUM_SETUP.md) | Real User Monitoring setup |

---

## 🔒 Security Features

- JWT authentication + refresh tokens
- bcrypt password hashing (10 rounds)
- **Adaptive rate limiting** (tier-based, behavior-aware)
- **DDoS protection** (pattern detection, IP reputation)
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

## 📈 Performance Metrics

### Response Time Targets
- **P50**: < 100ms
- **P95**: < 300ms
- **P99**: < 500ms

### Load Capacity
- **Concurrent Users**: 1,000+
- **Requests/Second**: 500+
- **Database Queries**: Optimized with indexes

### Auto-Scaling
- **Min Instances**: 2
- **Max Instances**: 20
- **Scale-Out Trigger**: CPU > 70% or Memory > 80%
- **Scale-In Cooldown**: 5 minutes

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is proprietary and confidential.

---

*Last Updated: February 15, 2026*
