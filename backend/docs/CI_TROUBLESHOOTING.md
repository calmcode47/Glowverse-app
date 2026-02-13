# CI Pipeline Troubleshooting

## Common Issues

### Tests Failing Locally but Passing in CI

**Cause:** Database state differences or environment variable mismatches

**Solution:**
```bash
# Reset local database
npm run prisma:migrate reset

# Run database setup
npm run db:setup

# Ensure .env.test matches CI configuration
cp .env.example .env.test

# Update DATABASE_URL in .env.test
DATABASE_URL="postgresql://test_user:test_password@localhost:5432/glowverse_test?schema=public"
REDIS_URL="redis://localhost:6379"
```

---

### Coverage Threshold Not Met

**Cause:** New code lacks sufficient tests

**Solution:**
```bash
# Check coverage report
npm run test:coverage

# View detailed HTML report
open coverage/lcov-report/index.html

# Identify uncovered files
grep -A 5 "Uncovered" coverage/lcov-report/index.html
```

**Fix:**
1. Add tests for uncovered code paths
2. Aim for 70%+ coverage on new code
3. Focus on critical business logic first

---

### Linting Errors

**Cause:** Code doesn't match ESLint rules

**Solution:**
```bash
# Auto-fix linting issues
npm run lint:fix

# Check remaining issues
npm run lint

# Common fixes:
# - Remove unused imports
# - Fix indentation
# - Add missing semicolons
# - Remove console.log statements
```

**Common Linting Errors:**

**Unused variables:**
```typescript
// ❌ Bad
const result = await someFunction();

// ✅ Good - use underscore prefix if intentionally unused
const _result = await someFunction();
```

**Console statements:**
```typescript
// ❌ Bad
console.log('Debug info');

// ✅ Good - use logger
logger.info('Debug info');

// ✅ Allowed
console.error('Critical error');
console.warn('Warning message');
```

---

### Type Errors

**Cause:** TypeScript compilation errors

**Solution:**
```bash
# Run type check locally
npm run type-check

# Common type errors and fixes:
```

**Missing types:**
```typescript
// ❌ Bad
const user = await prisma.user.findUnique({ where: { id } });
user.name; // Error: Object is possibly 'null'

// ✅ Good
const user = await prisma.user.findUnique({ where: { id } });
if (!user) throw new Error('User not found');
user.name; // OK
```

**Implicit any:**
```typescript
// ❌ Bad
function processData(data) { // Error: Parameter 'data' implicitly has an 'any' type

// ✅ Good
function processData(data: UserData) {
```

---

### Security Vulnerabilities

**Cause:** Dependencies with known vulnerabilities

**Solution:**
```bash
# Check for vulnerabilities
npm audit

# Auto-fix if possible
npm audit fix

# Force fix (may cause breaking changes)
npm audit fix --force

# Review specific vulnerability
npm audit --json | jq '.vulnerabilities'
```

**If vulnerability can't be fixed:**
1. Check if it affects your code path
2. Document in security exceptions
3. Create issue to track
4. Consider alternative package

---

### Database Connection Errors in CI

**Cause:** PostgreSQL service not ready or wrong connection string

**Solution:**

**Check workflow configuration:**
```yaml
services:
  postgres:
    image: postgres:15-alpine
    env:
      POSTGRES_USER: test_user
      POSTGRES_PASSWORD: test_password
      POSTGRES_DB: glowverse_test
    options: >-
      --health-cmd pg_isready
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

**Verify connection string:**
```bash
DATABASE_URL=postgresql://test_user:test_password@localhost:5432/glowverse_test?schema=public
```

---

### Redis Connection Errors in CI

**Cause:** Redis service not ready

**Solution:**

**Check workflow configuration:**
```yaml
services:
  redis:
    image: redis:7-alpine
    options: >-
      --health-cmd "redis-cli ping"
      --health-interval 10s
      --health-timeout 5s
      --health-retries 5
```

**Add retry logic in tests:**
```typescript
// Wait for Redis to be ready
await new Promise(resolve => setTimeout(resolve, 1000));
```

---

### Prisma Migration Errors

**Cause:** Migration conflicts or schema issues

**Solution:**
```bash
# Reset migrations
npm run prisma:migrate reset

# Generate new migration
npm run prisma:migrate dev --name fix_schema

# Deploy migrations
npm run prisma:migrate deploy
```

---

### Build Failures

**Cause:** TypeScript compilation errors or missing dependencies

**Solution:**
```bash
# Clean build
rm -rf dist

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Generate Prisma client
npm run prisma:generate

# Build
npm run build
```

---

## Debugging CI Failures

### Step 1: Check GitHub Actions Logs

1. Go to repository → Actions tab
2. Click on failed workflow run
3. Click on failed job
4. Expand failed step
5. Review error messages

### Step 2: Reproduce Locally

```bash
# Run the exact commands from CI
npm ci
npm run lint
npm run type-check
npm run test:coverage
npm run build
```

### Step 3: Check Environment

```bash
# Verify Node version matches CI
node --version  # Should be 20.x

# Check environment variables
cat .env.test

# Verify database is running
psql $DATABASE_URL -c "SELECT 1"

# Verify Redis is running
redis-cli ping
```

### Step 4: Review Recent Changes

```bash
# Compare with last successful run
git diff <last-successful-commit> HEAD

# Check for new dependencies
git diff <last-successful-commit> HEAD -- package.json

# Review migration changes
git diff <last-successful-commit> HEAD -- prisma/
```

---

## Performance Issues

### Slow Tests

**Cause:** Tests taking too long in CI

**Solution:**
```bash
# Run tests in parallel
npm run test:ci  # Uses --maxWorkers=2

# Identify slow tests
npm test -- --verbose

# Optimize slow tests:
# - Use beforeAll instead of beforeEach
# - Mock external services
# - Use test database transactions
```

### Slow Builds

**Cause:** npm install taking too long

**Solution:**
```yaml
# Use npm cache in workflow
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20.x'
    cache: 'npm'
```

---

## Getting Help

### Check Workflow Logs

```bash
# Download workflow logs
gh run view <run-id> --log

# View specific job
gh run view <run-id> --job <job-id>
```

### Enable Debug Logging

Add to workflow file:
```yaml
env:
  ACTIONS_STEP_DEBUG: true
  ACTIONS_RUNNER_DEBUG: true
```

### Common Commands

```bash
# Re-run failed jobs
gh run rerun <run-id> --failed

# Cancel running workflow
gh run cancel <run-id>

# List recent runs
gh run list
```

---

## Prevention

### Pre-commit Checks

Install pre-commit hooks:
```bash
# Install husky
npm install --save-dev husky

# Initialize husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npm run lint && npm run type-check"

# Add pre-push hook
npx husky add .husky/pre-push "npm test"
```

### Local CI Simulation

Use `act` to run GitHub Actions locally:
```bash
# Install act
brew install act  # macOS
# or
choco install act  # Windows

# Run CI workflow locally
act pull_request

# Run specific job
act -j test
```

---

## Support Resources

**GitHub Actions Documentation:** https://docs.github.com/en/actions  
**Jest Documentation:** https://jestjs.io/docs/troubleshooting  
**TypeScript Documentation:** https://www.typescriptlang.org/docs/  
**Prisma Documentation:** https://www.prisma.io/docs/
