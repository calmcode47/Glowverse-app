# Security Implementation Guide

## Overview
The Glowverse backend implements multiple layers of security to protect against common web vulnerabilities and attacks.

## Security Layers

### 1. CSRF Protection

**What it protects against:** Cross-Site Request Forgery attacks

**Implementation:** Token-based CSRF protection using `csurf` middleware

**How it works:**
1. Server generates unique CSRF token per session
2. Token must be included in all state-changing requests (POST, PUT, DELETE, PATCH)
3. Server validates token before processing request

**Frontend Integration:**

```typescript
// 1. Get CSRF token
const response = await fetch('/api/csrf-token');
const { csrfToken } = await response.json();

// 2. Include token in requests
fetch('/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken, // Include token
  },
  body: JSON.stringify(orderData),
});
```

**Configuration:**
- Cookie-based token storage
- HttpOnly cookies in production
- SameSite: Strict
- Secure flag in production (HTTPS only)

---

### 2. Input Sanitization

**What it protects against:**
- MongoDB injection attacks
- XSS (Cross-Site Scripting) attacks
- HTTP Parameter Pollution
- Excessively long inputs

**Middleware Stack:**

#### MongoDB Injection Prevention
```typescript
// Replaces MongoDB operators ($gt, $ne, etc.) with underscores
// Example: { email: { $ne: null } } → { email: { _ne: null } }
preventMongoInjection
```

#### XSS Prevention
```typescript
// Sanitizes HTML/JavaScript from inputs
// Example: <script>alert('xss')</script> → &lt;script&gt;...
preventXSS
```

#### HTTP Parameter Pollution
```typescript
// Prevents duplicate query parameters
// Whitelist: category, sort, tags, filter
preventHPP
```

#### Input Length Limits
- **URL length**: Max 2048 characters
- **JSON body**: Max 10MB
- **String fields**: Max 10,000 characters

---

### 3. Rate Limiting

**What it protects against:**
- Brute force attacks
- DDoS attacks
- API abuse
- Resource exhaustion

**Rate Limit Tiers:**

| Endpoint Type | Window | Max Requests | Use Case |
|---------------|--------|--------------|----------|
| **General API** | 15 min | 100 | All API endpoints |
| **Authentication** | 15 min | 5 | Login, register, password reset |
| **File Upload** | 1 hour | 20 | Image/file uploads |
| **Expensive Operations** | 1 min | 5 | AR try-on, AI processing |
| **User Tier (Premium)** | 15 min | 10,000 | Authenticated premium users |
| **User Tier (Free)** | 15 min | 1,000 | Authenticated free users |

**Implementation:**
- Redis-backed rate limiting (distributed across instances)
- Standard `RateLimit-*` headers returned
- Custom error responses with retry-after information

**Response when rate limited:**
```json
{
  "success": false,
  "error": {
    "message": "Too many requests, please try again later",
    "statusCode": 429,
    "retryAfter": "900"
  }
}
```

---

### 4. Security Headers

**Implemented via Helmet middleware:**

#### Content Security Policy (CSP)
```javascript
defaultSrc: ["'self'"]
styleSrc: ["'self'", "'unsafe-inline'"]
scriptSrc: ["'self'"]
imgSrc: ["'self'", "data:", "https://res.cloudinary.com"]
connectSrc: ["'self'", "https://api.perfectcorp.com"]
```

#### HTTP Strict Transport Security (HSTS)
- Max age: 1 year
- Include subdomains: Yes
- Preload: Yes

#### X-Frame-Options
- Value: DENY (prevents clickjacking)

#### Referrer Policy
- Value: strict-origin-when-cross-origin

---

## Middleware Order

**Critical:** Security middleware must be applied in the correct order:

```typescript
// 1. Input length limits (first line of defense)
app.use(limitInputLength);

// 2. MongoDB injection prevention
app.use(preventMongoInjection);

// 3. XSS prevention
app.use(preventXSS);

// 4. HTTP Parameter Pollution prevention
app.use(preventHPP);

// 5. Custom input sanitization
app.use(sanitizeInputs);

// 6. Rate limiting
app.use('/api/', apiRateLimiter);

// 7. CSRF protection (for state-changing operations)
app.use(csrfProtection);
app.use(attachCsrfToken);

// ... routes ...

// 8. Error handling (last)
app.use(errorHandler);
```

---

## Route-Specific Security

### Authentication Routes
```typescript
import { authRateLimiter } from '../middleware/rate-limit';
import { csrfProtection } from '../middleware/csrf';

router.post('/register', authRateLimiter, csrfProtection, register);
router.post('/login', authRateLimiter, csrfProtection, login);
router.post('/refresh', authRateLimiter, csrfProtection, refreshToken);
```

### File Upload Routes
```typescript
import { uploadRateLimiter } from '../middleware/rate-limit';

router.post('/upload', uploadRateLimiter, uploadImage);
```

### Expensive Operations
```typescript
import { expensiveOperationRateLimiter } from '../middleware/rate-limit';

router.post('/tryon', expensiveOperationRateLimiter, tryOn);
```

---

## Security Audit

### Running Security Audit
```bash
npm run security:audit
```

**Checks performed:**
1. NPM dependency vulnerabilities
2. Exposed secrets in environment files
3. CORS configuration
4. Hardcoded secrets in source code
5. Security middleware configuration

### Fixing Vulnerabilities
```bash
# Automatic fix (safe updates)
npm run security:fix

# Manual review
npm audit

# Force fix (may include breaking changes)
npm audit fix --force
```

---

## Environment Configuration

### Development
```env
# CSRF (disabled for easier testing)
# CSRF tokens still generated but not strictly enforced

# Rate limiting (relaxed)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=1000

# CORS (allow localhost)
CORS_ORIGIN=http://localhost:19006
```

### Production
```env
# CSRF (strictly enforced)
# All state-changing requests must include valid token

# Rate limiting (strict)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# CORS (specific origin only)
CORS_ORIGIN=https://app.glowverse.com
```

---

## Best Practices

### 1. Never Trust User Input
- Always validate and sanitize all inputs
- Use schema validation (Zod, Joi)
- Enforce type checking

### 2. Use Parameterized Queries
```typescript
// ✅ Good (Prisma handles this)
await prisma.user.findUnique({ where: { email } });

// ❌ Bad (vulnerable to injection)
await prisma.$executeRaw`SELECT * FROM users WHERE email = '${email}'`;
```

### 3. Implement Least Privilege
- Users should only access their own resources
- Role-based access control (RBAC)
- Resource-level permissions

### 4. Secure Sensitive Data
- Hash passwords (bcrypt)
- Encrypt sensitive fields
- Never log passwords or tokens
- Use environment variables for secrets

### 5. Keep Dependencies Updated
```bash
# Check for updates
npm outdated

# Update dependencies
npm update

# Audit for vulnerabilities
npm audit
```

### 6. Monitor Security Events
- Log all authentication attempts
- Track rate limit violations
- Alert on suspicious patterns
- Review security logs regularly

---

## Common Vulnerabilities & Mitigations

| Vulnerability | Mitigation | Implementation |
|---------------|------------|----------------|
| **SQL Injection** | Parameterized queries | Prisma ORM |
| **NoSQL Injection** | Input sanitization | `express-mongo-sanitize` |
| **XSS** | Output encoding | `xss-clean` |
| **CSRF** | Token validation | `csurf` |
| **Brute Force** | Rate limiting | `express-rate-limit` |
| **DDoS** | Rate limiting + CDN | Redis-backed rate limiter |
| **Clickjacking** | X-Frame-Options | Helmet |
| **MITM** | HTTPS + HSTS | Helmet + TLS |
| **Session Hijacking** | Secure cookies | HttpOnly, Secure, SameSite |

---

## Reporting Security Vulnerabilities

### Internal Team
1. Create private issue in GitHub
2. Tag with `security` label
3. Notify security team immediately

### External Researchers
**Email:** security@glowverse.com

**Please include:**
- Vulnerability description
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

**Response time:**
- Critical: 24 hours
- High: 72 hours
- Medium: 1 week
- Low: 2 weeks

---

## Security Checklist

### Pre-Deployment
- [ ] Run `npm audit` and resolve vulnerabilities
- [ ] Run security audit script
- [ ] Review CORS configuration
- [ ] Verify HTTPS is enforced
- [ ] Check rate limit configurations
- [ ] Test CSRF protection
- [ ] Review authentication flows
- [ ] Scan for hardcoded secrets
- [ ] Update dependencies
- [ ] Review security headers

### Post-Deployment
- [ ] Monitor error rates
- [ ] Review authentication logs
- [ ] Check rate limit violations
- [ ] Verify HTTPS redirects
- [ ] Test security headers (securityheaders.com)
- [ ] Review access logs
- [ ] Monitor for suspicious activity

---

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Security Headers](https://securityheaders.com)
- [NPM Audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Helmet.js](https://helmetjs.github.io/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

## Deprecation Notices

> **⚠️ Note:** `csurf` and `xss-clean` packages are deprecated. Consider migrating to:
> - **CSRF:** `@fastify/csrf-protection` or custom token implementation
> - **XSS:** DOMPurify (client-side) + strict CSP headers

Migration guide will be provided in future updates.
