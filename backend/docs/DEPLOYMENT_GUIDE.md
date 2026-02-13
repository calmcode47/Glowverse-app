# Deployment Guide

## Environments

### Staging
- **URL:** https://staging.glowverse.app
- **Auto-deploy:** On push to `main` branch
- **Manual deploy:** Via GitHub Actions workflow_dispatch
- **Database:** RDS PostgreSQL (staging instance)
- **Cache:** ElastiCache Redis (staging cluster)

### Production
- **URL:** https://api.glowverse.com
- **Auto-deploy:** On release tag (v*.*.*)
- **Manual deploy:** Requires approval from 2+ team members
- **Database:** RDS PostgreSQL (production instance with Multi-AZ)
- **Cache:** ElastiCache Redis (production cluster)

---

## Deployment Process

### Automated (Staging)

Triggered automatically on push to `main` branch:

1. **CI Tests Run** - All tests must pass
2. **Docker Image Built** - Multi-architecture build
3. **Deployment Workflow Triggers** - Auto-start
4. **Database Migrations Run** - Via ECS task
5. **Application Deployed** - ECS service update
6. **Health Checks** - 30 attempts over 5 minutes
7. **Smoke Tests** - Critical endpoints validated
8. **Notification Sent** - Slack message to #deployments

**Timeline:** ~10-15 minutes

### Manual Deployment

Use deployment script for manual deployments:

```bash
# Deploy to staging
./scripts/deploy.sh staging v1.2.3

# Deploy to production (requires AWS credentials)
export AWS_ACCESS_KEY_ID=xxx
export AWS_SECRET_ACCESS_KEY=xxx
./scripts/deploy.sh production v1.2.3
```

---

## Rollback Process

### Automatic Rollback

Triggers automatically on:
- Health check failure
- Smoke test failure
- Migration failure
- Any deployment step failure

**Process:**
1. Detect failure
2. Stop deployment
3. Revert to previous task definition
4. Restart services
5. Verify health checks
6. Send critical alert to Slack

### Manual Rollback

**Via Script:**
```bash
# Rollback staging
./scripts/rollback.sh staging

# Rollback production
./scripts/rollback.sh production
```

**Via GitHub Actions:**
```bash
# Trigger deployment with previous version
gh workflow run deploy-production.yml -f version=v1.2.2
```

**Via AWS CLI:**
```bash
# Get previous task definition
PREVIOUS_TASK=$(aws ecs describe-services \
  --cluster glowverse-production \
  --services glowverse-backend \
  --query 'services[0].deployments[1].taskDefinition' \
  --output text)

# Rollback
aws ecs update-service \
  --cluster glowverse-production \
  --service glowverse-backend \
  --task-definition $PREVIOUS_TASK \
  --force-new-deployment
```

---

## Health Checks

### Health Endpoint

**URL:** `/api/health`

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-02-13T12:00:00Z",
  "uptime": 3600,
  "version": "1.2.3",
  "database": {
    "status": "healthy",
    "latency": 15
  },
  "cache": {
    "status": "healthy",
    "latency": 5
  }
}
```

### Health Check Criteria

- HTTP 200 status code
- Response time < 1000ms
- Database status: "healthy"
- Cache status: "healthy"

---

## Smoke Tests

Critical endpoints tested after every deployment:

1. **Authentication**
   ```bash
   curl -X POST https://api.glowverse.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"testpass"}'
   ```

2. **Database Connectivity**
   ```bash
   curl https://api.glowverse.com/api/health | jq -r '.database.status'
   # Expected: "healthy"
   ```

3. **Redis Connectivity**
   ```bash
   curl https://api.glowverse.com/api/health | jq -r '.cache.status'
   # Expected: "healthy"
   ```

4. **External API (Perfect Corp)**
   ```bash
   curl https://api.glowverse.com/api/ar/products
   # Expected: HTTP 200
   ```

---

## Monitoring

### Real-time Monitoring

**Sentry** - Error tracking and performance
- URL: https://sentry.io
- Real-time error alerts
- Performance monitoring
- Release tracking

**CloudWatch** - Application logs
- Log group: `/ecs/glowverse-backend`
- Metrics: CPU, Memory, Network
- Alarms: Error rate, response time

**ECS Console** - Service health
- Cluster: glowverse-production
- Service: glowverse-backend
- Task definition versions

### Key Metrics

| Metric | Target | Alert Threshold |
|--------|--------|----------------|
| Error Rate | < 0.1% | > 1% |
| Response Time (p95) | < 500ms | > 1s |
| Response Time (p99) | < 1s | > 2s |
| CPU Utilization | < 70% | > 80% |
| Memory Utilization | < 80% | > 90% |
| Database Connections| < 80% of pool | > 90% of pool |
| Cache Hit Rate | > 70% | < 50% |

### Alerts

**Critical (🔴):**
- Error rate > 5%
- Database connection failures
- Service down
- Health check failures

**Warning (🟡):**
- Error rate > 1%
- Response time > 1s (p95)
- CPU > 80%
- Memory > 90%

---

## Troubleshooting

### Deployment Failed

**Symptoms:** Deployment workflow fails

**Diagnosis:**
1. Check GitHub Actions logs
2. Review error messages
3. Check ECS task logs in CloudWatch
4. Verify environment variables

**Common Causes:**
- Docker image not found
- Migration failure
- Health check timeout
- AWS credentials expired

**Resolution:**
1. Fix underlying issue
2. Re-trigger deployment
3. Monitor closely

### Health Check Failed

**Symptoms:** `/api/health` returns non-200 status

**Diagnosis:**
```bash
# Check application logs
aws logs tail /ecs/glowverse-backend --follow

# Test health endpoint
curl -v https://api.glowverse.com/api/health

# Check database connectivity
psql $DATABASE_URL -c "SELECT 1"

# Check Redis connectivity
redis-cli -u $REDIS_URL ping
```

**Common Causes:**
- Database connection timeout
- Redis connection timeout
- Missing environment variables
- Application crash on startup

**Resolution:**
1. Verify database/Redis connectivity
2. Check environment variables
3. Review Sentry errors
4. Rollback if necessary

### Database Migration Failed

**Symptoms:** Migration task fails in ECS

**Diagnosis:**
```bash
# Check migration logs
aws ecs describe-tasks --cluster glowverse-production \
  --tasks <task-id> | jq '.tasks[0].containers[0].exitCode'

# View migration logs
aws logs tail /ecs/glowverse-migration --follow
```

**Common Causes:**
- Syntax error in migration
- Schema conflict
- Foreign key constraint violation
- Insufficient database permissions

**Resolution:**
1. Review migration SQL
2. Test migration in staging
3. Fix migration script
4. Rollback if data corrupted
5. Restore from backup if necessary

---

## Pre-Deployment Checklist

Before deploying to production:

- [ ] All tests passing in staging
- [ ] Staging deployment successful (>24 hours uptime)
- [ ] Database migrations tested in staging
- [ ] No critical errors in Sentry (last 24 hours)
- [ ] Performance metrics acceptable
- [ ] Team notified of deployment window
- [ ] Monitoring dashboards open
- [ ] On-call engineer available
- [ ] Rollback plan documented
- [ ] Database backup verified

---

## Post-Deployment Checklist

After deploying to production:

**Immediate (First 10 minutes):**
- [ ] Health checks passing
- [ ] All smoke tests passed
- [ ] No errors in Sentry
- [ ] CloudWatch logs normal
- [ ] Response times acceptable

**Short-term (First hour):**
- [ ] Error rate < 0.1%
- [ ] Performance metrics stable
- [ ] No user-reported issues
- [ ] Cache hit rate normal
- [ ] Database load normal

**Long-term (First 24 hours):**
- [ ] Monitor error trends
- [ ] Review Sentry issues
- [ ] Analyze performance
- [ ] Collect user feedback
- [ ] Update deployment log

---

## Emergency Procedures

### Complete System Failure

1. **Immediate Response**
   - Execute rollback immediately
   - Enable maintenance mode if possible
   - Notify engineering team

2. **Incident Management**
   - Create incident in PagerDuty
   - Begin incident response protocol
   - Assign incident commander
   - Communicate with stakeholders

3. **Investigation**
   - Review recent changes
   - Analyze error logs
   - Check infrastructure status
   - Identify root cause

4. **Resolution**
   - Apply fix or maintain rollback
   - Test thoroughly in staging
   - Deploy fix when ready
   - Document incident

### Database Issues

1. **Stop New Writes**
   - Enable read-only mode
   - Return 503 for write operations

2. **Assess Damage**
   - Check database integrity
   - Identify affected data
   - Estimate recovery time

3. **Restore if Necessary**
   ```bash
   # Restore from RDS snapshot
   aws rds restore-db-instance-from-db-snapshot \
     --db-instance-identifier glowverse-recovery \
     --db-snapshot-identifier glowverse-prod-20260213
   ```

4. **Validate Data**
   - Run data validation queries
   - Compare against backup
   - Check referential integrity

5. **Resume Operations**
   - Update DATABASE_URL
   - Run migrations if needed
   - Remove read-only mode
   - Monitor closely

---

## Communication Plan

### Pre-Deployment

**24 Hours Before:**
- Slack announcement in #general
- Email to stakeholders
- Status page notice (if user-impacting)

**1 Hour Before:**
- Slack reminder in #deployments
- Ensure team availability

### During Deployment

- Real-time updates in #deployments
- Status page updates if needed
- Keep stakeholders informed

### Post-Deployment

**Success:**
- Slack notification with summary
- Email to stakeholders
- Status page update (if applicable)
- Document known issues

**Failure:**
- Immediate critical alert
- Detailed incident report
- Root cause analysis
- Prevention plan

---

## Deployment Scripts

### deploy.sh

Deploy to any environment:

```bash
./scripts/deploy.sh <environment> <image_tag>
```

**Features:**
- Pre-deployment validation
- Database backup
- Migration execution
- Health checks
- Colored output

### rollback.sh

Rollback deployment:

```bash
./scripts/rollback.sh <environment>
```

**Features:**
- Confirmation prompt
- Version retrieval
- Health verification
- Colored output

---

## Support Resources

**Documentation:**
- CI/CD Guide: `docs/CI_CD.md`
- Production Deployment: `docs/PRODUCTION_DEPLOYMENT.md`
- Environment Setup: `docs/ENVIRONMENT_SETUP.md`

**Monitoring:**
- Sentry: https://sentry.io
- CloudWatch: AWS Console
- ECS: AWS Console

**Team Contacts:**
- On-call: Check PagerDuty rotation
- DevOps Lead: [Contact Info]
- Engineering Lead: [Contact Info]
