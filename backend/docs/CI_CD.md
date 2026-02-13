# CI/CD Pipeline Documentation

## Overview

This document describes the Continuous Integration and Continuous Deployment (CI/CD) pipeline for the Glowverse backend API.

**Pipeline Tools:** GitHub Actions  
**Container Registry:** Docker Hub  
**Deployment Strategy:** Blue-Green Deployment  
**Monitoring:** Sentry, Uptime Monitoring

---

## Workflows

### 1. Test Workflow (`.github/workflows/test.yml`)

**Triggers:**
- Pull requests to `main`, `staging`, or `develop` branches
- Pushes to `main`, `staging`, or `develop` branches

**Services:**
- PostgreSQL 15 (test database)
- Redis 7 (test cache)

**Steps:**
1. **Checkout code** - Clone repository
2. **Setup Node.js 20** - Install Node.js with npm cache
3. **Install dependencies** - Run `npm ci`
4. **Lint code** - Run ESLint (`npm run lint`)
5. **Type check** - Run TypeScript compiler (`npm run type-check`)
6. **Generate Prisma Client** - Generate database client
7. **Run migrations** - Apply database schema
8. **Run tests** - Execute test suite with coverage
9. **Upload coverage** - Send coverage to Codecov (optional)
10. **Comment on PR** - Post coverage report on pull request

**Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - JWT signing secret
- All other required environment variables

**Success Criteria:**
- All linting checks pass
- No TypeScript errors
- All tests pass
- Coverage meets threshold (70%)

---

### 2. Build Workflow (`.github/workflows/build.yml`)

**Triggers:**
- Pushes to `main` or `staging` branches
- Manual workflow dispatch

**Steps:**
1. **Checkout code** - Clone repository
2. **Set up Docker Buildx** - Configure Docker builder
3. **Log in to Docker Hub** - Authenticate with container registry
4. **Extract metadata** - Generate image tags and labels
5. **Build and push** - Build Docker image and push to registry
6. **Vulnerability scan** - Run Trivy security scanner
7. **Upload results** - Send scan results to GitHub Security
8. **Notify on failure** - Send Slack notification if build fails

**Image Tags:**
- `latest` - Latest version from main branch
- `staging` - Latest version from staging branch
- `<branch>-<sha>` - Specific commit version

**Security:**
- Trivy vulnerability scanning
- Results uploaded to GitHub Security tab
- Slack notifications on failure

---

### 3. Staging Deployment (`.github/workflows/deploy-staging.yml`)

**Triggers:**
- Pushes to `staging` branch
- Manual workflow dispatch

**Environment:** `staging`  
**URL:** https://staging-api.glowverse.com

**Steps:**
1. **Checkout code** - Clone repository
2. **Set up SSH** - Configure SSH access to staging server
3. **Add to known hosts** - Trust staging server
4. **Pull Docker image** - Download latest staging image
5. **Run migrations** - Apply database schema changes
6. **Deploy new version** - Update running containers
7. **Health check** - Verify deployment success
8. **Run smoke tests** - Test critical endpoints
9. **Notify team** - Send Slack notification
10. **Rollback on failure** - Revert to previous version if deployment fails

**Required Secrets:**
- `STAGING_SSH_KEY` - SSH private key for server access
- `STAGING_SERVER_HOST` - Server hostname/IP
- `STAGING_SERVER_USER` - SSH username
- `STAGING_DATABASE_URL` - Database connection string
- `SLACK_WEBHOOK_URL` - Slack notification webhook

**Deployment Process:**
1. SSH into staging server
2. Pull latest Docker image
3. Run database migrations in container
4. Update docker-compose configuration
5. Restart backend service
6. Wait for health check
7. Verify endpoints

**Rollback:**
- Automatic rollback on deployment failure
- Restores previous Docker image
- Notifies team via Slack

---

### 4. Production Deployment (`.github/workflows/deploy-production.yml`)

**Triggers:**
- Manual workflow dispatch only

**Environment:** `production`  
**URL:** https://api.glowverse.com

**Approval Required:** Yes (2 team members)

**Steps:**

#### Job 1: Approval
- Require manual approval from authorized team members
- Log approver information

#### Job 2: Backup
1. **Set up SSH** - Configure SSH access
2. **Create database backup** - Full PostgreSQL dump
3. **Store backup** - Save to `/backups` directory

#### Job 3: Deploy
1. **Checkout code** - Clone repository
2. **Set up SSH** - Configure SSH access to production server
3. **Pull Docker image** - Download specified version
4. **Run migrations** - Apply database schema changes
5. **Blue-Green deployment** - Zero-downtime deployment
   - Scale up new version (green)
   - Wait for health checks
   - Scale down old version (blue)
6. **Monitor error rates** - Check Sentry for error spikes
7. **Run smoke tests** - Verify critical endpoints
8. **Create Sentry release** - Track deployment in Sentry
9. **Notify team** - Send Slack notification
10. **Rollback on failure** - Automatic rollback if deployment fails

**Required Secrets:**
- `PRODUCTION_SSH_KEY` - SSH private key
- `PRODUCTION_SERVER_HOST` - Server hostname/IP
- `PRODUCTION_SERVER_USER` - SSH username
- `PRODUCTION_DATABASE_URL` - Database connection string
- `SENTRY_AUTH_TOKEN` - Sentry API token
- `SENTRY_ORG` - Sentry organization
- `SLACK_WEBHOOK_URL` - Slack webhook

**Blue-Green Deployment:**
```bash
# Scale up new version (2 instances)
docker-compose up -d --scale backend=2 backend

# Wait for health checks (30s)
sleep 30

# Verify new instances are healthy
docker-compose exec backend curl -f http://localhost:5000/health

# Scale down to 1 instance (removes old version)
docker-compose up -d --scale backend=1 backend
```

**Rollback:**
- Automatic rollback on any failure
- Restores previous Docker image
- Verifies rollback success
- Sends critical alert to team

---

## GitHub Secrets Configuration

### Repository Secrets

Configure these secrets in GitHub repository settings:

**Docker Registry:**
- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub access token

**SSH Access:**
- `STAGING_SSH_KEY` - SSH private key for staging server
- `STAGING_SERVER_HOST` - Staging server hostname
- `STAGING_SERVER_USER` - Staging SSH username
- `PRODUCTION_SSH_KEY` - SSH private key for production server
- `PRODUCTION_SERVER_HOST` - Production server hostname
- `PRODUCTION_SERVER_USER` - Production SSH username

**Monitoring:**
- `SENTRY_AUTH_TOKEN` - Sentry API authentication token
- `SENTRY_ORG` - Sentry organization name
- `CODECOV_TOKEN` - Codecov upload token (optional)

**Notifications:**
- `SLACK_WEBHOOK_URL` - Slack incoming webhook URL

### Environment Secrets

Configure these secrets per environment (staging/production):

**Database:**
- `DATABASE_URL` - PostgreSQL connection string

**Caching:**
- `REDIS_URL` - Redis connection string
- `REDIS_TTL` - Default cache TTL

**Authentication:**
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - Refresh token secret
- `JWT_EXPIRES_IN` - Access token expiration
- `JWT_REFRESH_EXPIRES_IN` - Refresh token expiration

**File Storage:**
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

**External APIs:**
- `PERFECT_CORP_API_KEY` - Perfect Corp API key
- `PERFECT_CORP_API_SECRET` - Perfect Corp API secret

**Monitoring:**
- `SENTRY_DSN` - Sentry Data Source Name

**Security:**
- `RATE_LIMIT_WINDOW_MS` - Rate limit window
- `RATE_LIMIT_MAX` - Maximum requests per window
- `CORS_ORIGIN` - Allowed CORS origins

---

## Deployment Process

### Staging Deployment

**Automatic on push to `staging` branch:**

1. Developer merges PR to `staging` branch
2. Test workflow runs automatically
3. Build workflow creates Docker image
4. Deploy workflow triggers automatically
5. Database migrations run
6. New version deployed
7. Health checks verify deployment
8. Team notified via Slack

**Timeline:** ~10-15 minutes

### Production Deployment

**Manual process with approval:**

1. **Prepare deployment:**
   - Ensure staging deployment successful
   - Verify all tests passing
   - Review changes and migration scripts
   - Notify team of deployment window

2. **Trigger deployment:**
   - Go to GitHub Actions
   - Select "Deploy to Production" workflow
   - Click "Run workflow"
   - Enter version to deploy (commit SHA or tag)
   - Click "Run workflow"

3. **Approval gate:**
   - Workflow waits for approval
   - 2 authorized team members must approve
   - Approvers review deployment details

4. **Deployment executes:**
   - Database backup created
   - Docker image pulled
   - Migrations run
   - Blue-green deployment
   - Health checks
   - Smoke tests
   - Sentry release created

5. **Post-deployment:**
   - Monitor error rates for 30 minutes
   - Check Sentry for new errors
   - Verify critical user flows
   - Update deployment log

**Timeline:** ~20-30 minutes (including approval)

---

## Rollback Procedures

### Automatic Rollback

Both staging and production workflows include automatic rollback on failure:

**Triggers:**
- Health check failure
- Smoke test failure
- Migration failure
- Any deployment step failure

**Process:**
1. Detect failure
2. Stop deployment
3. Restore previous Docker image
4. Restart services
5. Verify health checks
6. Notify team with critical alert

### Manual Rollback

If issues are discovered after deployment:

**Staging:**
```bash
# SSH into staging server
ssh user@staging-server

# Navigate to project directory
cd /opt/glowverse/backend

# Restore previous version
docker-compose down
docker-compose up -d

# Verify health
curl http://localhost:5000/health
```

**Production:**
```bash
# SSH into production server
ssh user@production-server

# Navigate to project directory
cd /opt/glowverse/backend

# Pull previous image version
docker pull glowverse-backend:<previous-version>

# Update docker-compose
export IMAGE_TAG=<previous-version>

# Restart with previous version
docker-compose up -d

# Verify health
curl http://localhost:5000/health
```

**Database Rollback:**
```bash
# If migrations need to be rolled back
# Restore from backup
psql $DATABASE_URL < /backups/glowverse-<timestamp>.sql

# Or use Prisma rollback
npx prisma migrate resolve --rolled-back <migration-name>
```

---

## Monitoring Deployments

### Sentry

**Release Tracking:**
- Each production deployment creates a Sentry release
- Releases tagged with commit SHA
- Error tracking per release
- Performance monitoring per release

**Alerts:**
- High error rate (> 5% over 5 minutes)
- New error types
- Performance degradation

**Dashboard:** https://sentry.io/organizations/glowverse/

### Health Checks

**Endpoints:**
- `GET /health` - Basic health check
- `GET /api/v1/health` - API health with dependencies

**Monitoring:**
- Automated checks every 30 seconds during deployment
- Manual verification post-deployment
- Uptime monitoring (external service)

### Logs

**Access logs:**
```bash
# SSH into server
ssh user@server

# View container logs
docker-compose logs -f backend

# View last 100 lines
docker-compose logs --tail=100 backend
```

---

## Best Practices

### Before Deployment

- [ ] All tests passing on staging
- [ ] Code review completed
- [ ] Database migrations tested
- [ ] Rollback plan documented
- [ ] Team notified of deployment window
- [ ] Monitoring dashboards open

### During Deployment

- [ ] Monitor deployment progress
- [ ] Watch for errors in Sentry
- [ ] Check health endpoints
- [ ] Verify critical functionality
- [ ] Monitor server resources

### After Deployment

- [ ] Monitor for 30 minutes
- [ ] Check error rates
- [ ] Verify user flows
- [ ] Update deployment log
- [ ] Notify team of completion
- [ ] Document any issues

### Emergency Procedures

**If deployment fails:**
1. Automatic rollback will trigger
2. Verify rollback successful
3. Investigate failure cause
4. Fix issues
5. Re-deploy when ready

**If issues discovered post-deployment:**
1. Assess severity
2. If critical: Manual rollback immediately
3. If minor: Create hotfix
4. Document incident
5. Post-mortem analysis

---

## Troubleshooting

### Test Workflow Failures

**Linting errors:**
```bash
npm run lint
npm run lint -- --fix  # Auto-fix
```

**Type errors:**
```bash
npm run type-check
```

**Test failures:**
```bash
npm test
npm test -- --verbose  # Detailed output
```

### Build Workflow Failures

**Docker build errors:**
- Check Dockerfile syntax
- Verify all dependencies in package.json
- Check build logs in GitHub Actions

**Vulnerability scan failures:**
- Review Trivy scan results
- Update vulnerable dependencies
- Apply security patches

### Deployment Failures

**SSH connection issues:**
- Verify SSH key is correct
- Check server firewall rules
- Verify server is accessible

**Migration failures:**
- Check migration scripts
- Verify database connectivity
- Review migration logs
- Rollback if necessary

**Health check failures:**
- Check application logs
- Verify environment variables
- Check database/Redis connectivity
- Review Sentry errors

---

## Maintenance

### Weekly Tasks

- [ ] Review deployment logs
- [ ] Check for failed workflows
- [ ] Update dependencies
- [ ] Review security scan results

### Monthly Tasks

- [ ] Review and optimize workflows
- [ ] Update GitHub Actions versions
- [ ] Review secret rotation schedule
- [ ] Test rollback procedures

### Quarterly Tasks

- [ ] Full security audit
- [ ] Load testing
- [ ] Disaster recovery drill
- [ ] Update documentation

---

## Support

**GitHub Actions Documentation:** https://docs.github.com/en/actions  
**Docker Documentation:** https://docs.docker.com/  
**Sentry Documentation:** https://docs.sentry.io/

**Team Contacts:**
- DevOps Lead: [Contact Info]
- Backend Lead: [Contact Info]
- On-Call: [Rotation Schedule]
