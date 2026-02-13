# Environment Configuration Guide

## Overview
The Glowverse backend uses environment variables for all configuration with runtime validation using Zod schema. The server will **fail to start** if any required variables are missing or invalid.

## Configuration System

### Validation Flow
1. Server startup calls `validateEnv()` before any other imports
2. Zod schema validates all environment variables
3. Validated config stored globally for type-safe access
4. Any validation errors cause immediate process exit with detailed error messages

### Type-Safe Access
Instead of using `process.env` directly, import the centralized `config` object:

```typescript
import { config } from './config';

// Type-safe, namespaced access
const port = config.server.port;
const dbUrl = config.database.url;
const jwtSecret = config.jwt.secret;
```

## Required Variables

### Server Configuration
| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NODE_ENV` | enum | - | Environment: `development`, `test`, `staging`, `production` |
| `PORT` | number | 5000 | Server port |
| `HOST` | string | 0.0.0.0 | Server host |

### Database
| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `DATABASE_URL` | string | - | PostgreSQL connection string (must start with `postgresql://`) |
| `DATABASE_POOL_SIZE` | number | 10 | Connection pool size |

### Redis Cache
| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `REDIS_URL` | string | - | Redis connection string (must start with `redis://`) |
| `REDIS_TTL` | number | 3600 | Default cache TTL in seconds |

### JWT Authentication
| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `JWT_SECRET` | string | - | JWT signing secret (min 32 chars) |
| `JWT_EXPIRES_IN` | string | 15m | Access token expiration |
| `JWT_REFRESH_SECRET` | string | - | Refresh token secret (min 32 chars) |
| `JWT_REFRESH_EXPIRES_IN` | string | 7d | Refresh token expiration |

### Cloudinary Storage
| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `CLOUDINARY_CLOUD_NAME` | string | - | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | string | - | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | string | - | Cloudinary API secret |

### Perfect Corp AR
| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `PERFECTCORP_API_KEY` | string | - | Perfect Corp API key |
| `PERFECTCORP_API_URL` | string | https://api.perfectcorp.com | Perfect Corp API endpoint |

### Security
| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `RATE_LIMIT_WINDOW_MS` | number | 900000 | Rate limit window (15 minutes) |
| `RATE_LIMIT_MAX` | number | 100 | Max requests per window |
| `CORS_ORIGIN` | string | * | CORS allowed origins |

### Optional Variables

#### Email Service
| Variable | Type | Description |
|----------|------|-------------|
| `EMAIL_SERVICE` | enum | Email provider: `sendgrid`, `ses`, `smtp` |
| `EMAIL_FROM` | string | From email address |
| `SENDGRID_API_KEY` | string | SendGrid API key |

#### Monitoring
| Variable | Type | Description |
|----------|------|-------------|
| `SENTRY_DSN` | string | Sentry error tracking DSN |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | string | OpenTelemetry collector endpoint |

## Environment Setup

### Development
1. Copy `.env.development` to `.env`:
   ```bash
   cp .env.development .env
   ```

2. Update placeholder values:
   - Set `CLOUDINARY_*` credentials
   - Set `PERFECTCORP_API_KEY`
   - Optionally configure email and monitoring

3. Start local services:
   ```bash
   docker-compose up -d postgres redis
   ```

4. Run migrations:
   ```bash
   npm run db:migrate
   ```

5. Start server:
   ```bash
   npm run dev
   ```

### Staging
1. Use `.env.staging` as template
2. Replace `${VARIABLE}` placeholders with actual secrets from your secrets manager
3. Deploy via CI/CD pipeline which injects secrets

### Production
1. **NEVER** commit `.env.production` with actual secrets
2. Use `.env.production.example` as template
3. Store actual secrets in:
   - AWS Secrets Manager
   - HashiCorp Vault
   - Kubernetes Secrets
   - CI/CD secret variables
4. Inject secrets at runtime via environment variables

## Secret Management

### Generating Secrets
Generate strong secrets for JWT and session:
```bash
# Generate 48-byte base64 secret
openssl rand -base64 48
```

### Secret Storage
- **Development:** `.env` file (gitignored)
- **Staging/Production:** Secrets manager (AWS Secrets Manager, Vault, etc.)
- **CI/CD:** GitHub Secrets, GitLab CI Variables, etc.

### Secret Rotation
See [SECRET_ROTATION.md](SECRET_ROTATION.md) for detailed rotation procedures.

## Troubleshooting

### Server Won't Start
**Error:** `Environment validation failed`

**Solution:** Check the error output for specific missing/invalid variables:
```
✗ Environment validation failed

Missing or invalid environment variables:
  - JWT_SECRET: String must contain at least 32 character(s)
  - DATABASE_URL: Invalid url
```

Fix the indicated variables in your `.env` file.

### Database Connection Fails
**Error:** `Can't reach database server`

**Solution:**
1. Verify `DATABASE_URL` format: `postgresql://user:pass@host:port/database`
2. Ensure PostgreSQL is running: `docker-compose ps postgres`
3. Test connection: `psql $DATABASE_URL`

### Redis Connection Fails
**Error:** `Redis connection refused`

**Solution:**
1. Verify `REDIS_URL` format: `redis://host:port`
2. Ensure Redis is running: `docker-compose ps redis`
3. Test connection: `redis-cli -u $REDIS_URL ping`

## Environment-Specific Behavior

### Development
- Detailed console logging
- Hot reload enabled
- CORS allows all origins
- Lower rate limits

### Staging
- Production-like configuration
- Moderate rate limits
- Sentry error tracking
- Separate database/cache

### Production
- Minimal logging (info/error only)
- Strict CORS
- High rate limits
- Full monitoring stack
- Separate infrastructure
