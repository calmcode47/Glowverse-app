# Production Deployment Runbook

## Overview

Production deployments require manual approval and follow a strict blue-green deployment strategy with comprehensive monitoring. This runbook provides step-by-step procedures for safe production deployments.

---

## Deployment Triggers

### Automatic (Recommended)
- Creating a GitHub release with semantic version tag (v1.2.3)
- Workflow automatically triggers after release publication

### Manual
- Via GitHub Actions `workflow_dispatch`
- Requires specifying version tag
- Use for hotfixes or rollbacks

---

## Pre-Deployment Checklist

Complete this checklist before initiating any production deployment:

**Code Quality:**
- [ ] All tests passing in staging (100% pass rate)
- [ ] Code reviewed and approved by 2+ team members
- [ ] No merge conflicts
- [ ] Database migrations tested in staging

**Staging Validation:**
- [ ] Staging deployment successful (>24 hours uptime)
- [ ] No critical errors in Sentry (last 24 hours)
- [ ] Performance metrics acceptable
- [ ] User acceptance testing complete

**Team Readiness:**
- [ ] Team notified 24 hours in advance
- [ ] Deployment window approved
- [ ] On-call engineer available
- [ ] War room channel created (#deployment-v123)

**Infrastructure:**
- [ ] Database backup verified
- [ ] Monitoring dashboards open
- [ ] Rollback plan documented
- [ ] Incident response team ready

**Communication:**
- [ ] Stakeholders notified
- [ ] Status page prepared (if user-impacting)
- [ ] Support team briefed

---

## Deployment Process

### Step 1: Pre-Deployment Validation (Automated)

**What happens:**
- Version tag format validation (v1.2.3)
- Docker image existence check
- Security checks
- Migration validation

**Duration:** ~2 minutes

**Monitor:**
- GitHub Actions workflow logs

**Action Required:** None (automated)

---

### Step 2: Approval Gate (Manual)

**What happens:**
- GitHub environment protection requires approval
- Designated approvers notified via email
- Approval required to proceed

**Duration:** Varies (depends on approver availability)

**Designated Approvers:**
- Engineering Lead
- DevOps Lead
- CTO (for major versions)

**Approval Criteria:**
- All automated checks passed
- Staging deployment successful
- No outstanding critical issues
- Business sign-off obtained

**Action Required:** Approve in GitHub Actions UI

---

### Step 3: Database Backup (Automated)

**What happens:**
- RDS snapshot created
- Tagged with deployment version
- Verification of snapshot completion

**Duration:** ~5-10 minutes

**Monitor:**
```bash
# Check snapshot status
aws rds describe-db-snapshots \
  --db-snapshot-identifier glowverse-prod-20260213
```

**Rollback Impact:** Snapshot available for emergency restore

---

### Step 4: Database Migrations (Automated)

**What happens:**
- Migrations run via ECS task
- Zero-downtime compatible migrations
- Logged and monitored

**Duration:** ~2-5 minutes

**Monitor:**
```bash
# View migration logs
aws logs tail /ecs/glowverse-migration --follow
```

**Failure Handling:** Automatic rollback initiated

---

### Step 5: Application Deployment (Automated)

**What happens:**
- Blue-green deployment strategy
- ECS updates service with new task definition
- Maintains 100% availability during rollout
- Circuit breaker enabled for auto-rollback

**Duration:** ~5-8 minutes

**Deployment Strategy:**
- `maximumPercent: 200` - Allows double capacity during deployment
- `minimumHealthyPercent: 100` - Ensures no downtime
- Circuit breaker auto-rollback on failure

**Monitor:**
```bash
# Watch deployment progress
aws ecs describe-services \
  --cluster glowverse-production \
  --services glowverse-backend
```

---

### Step 6: Health Checks (Automated)

**What happens:**
- Comprehensive health endpoint verification
- Database connectivity check
- Cache connectivity check
- Maximum 60 attempts (5 minutes)

**Duration:** ~1-5 minutes

**Health Check Criteria:**
✅ HTTP 200 status code
✅ Response time < 1000ms
✅ Database status: "healthy"
✅ Cache status: "healthy"

**Monitor:**
```bash
# Manual health check
curl -v https://api.glowverse.com/api/health | jq .
```

---

### Step 7: Smoke Tests (Automated)

**What happens:**
- Critical endpoint validation
- Response code verification
- Error rate monitoring

**Duration:** ~2-3 minutes

**Endpoints Tested:**
- `/api/health` - Health check
- `/api/products` - Product listing
- `/api/guides` - Guides listing
- `/api/auth/login` - Authentication

**Failure Threshold:** Any 5xx response triggers rollback

---

### Step 8: Post-Deployment (Automated)

**What happens:**
- Cache warming
- Sentry release tracking
- GitHub deployment record
- Team notification (Slack)

**Duration:** ~2 minutes

**Verification:**
- Sentry release visible: https://sentry.io
- Slack notification received
- GitHub deployment status updated

---

## Monitoring During Deployment

### Required Dashboards

Open these dashboards before starting deployment:

1. **CloudWatch** - Application logs
   - Navigate to: CloudWatch → Log groups → `/ecs/glowverse-backend`
   - Set to live tail mode

2. **Sentry** - Real-time errors
   - Navigate to: https://sentry.io/organizations/glowverse/issues/
   - Filter by: `environment:production`

3. **ECS Console** - Service deployment
   - Navigate to: ECS → Clusters → glowverse-production → glowverse-backend
   - Watch: Deployments tab

4. **RDS Console** - Database metrics
   - Navigate to: RDS → Databases → glowverse-production
   - Watch: Monitoring tab

### Key Metrics to Watch

| Metric | Normal Range | Alert Threshold |
|--------|-------------|----------------|
| Error Rate | < 0.1% | > 1% |
| Response Time (p95) | < 500ms | > 1s |
| Response Time (p99) | < 1s | > 2s |
| Active Connections | < 80% pool | > 90% pool |
| CPU Utilization | < 70% | > 80% |
| Memory Utilization | < 80% | > 90% |
| Cache Hit Rate | > 70% | < 50% |

### Alert Thresholds

**🔴 Critical - Immediate Action Required:**
- Error rate > 5%
- Database connection failures
- Service completely down
- Health checks failing

**🟡 Warning - Monitor Closely:**
- Error rate > 1%
- Response time > 1s (p95)
- CPU > 80%
- Memory > 90%
- Cache hit rate < 50%

---

## Rollback Procedures

### Automatic Rollback

**Triggers:**
- Health check failure
- Smoke test failure
- ECS circuit breaker activation
- Migration failure

**Process:**
1. Deployment automatically stopped
2. Previous task definition restored
3. ECS updates service
4. Health checks verify rollback
5. Critical alert sent to team

**Timeline:** ~3-5 minutes

---

### Manual Rollback

**When to Use:**
- Post-deployment issues discovered
- Performance degradation
- User-reported critical bugs
- Data integrity concerns

**Procedure:**

1. **Assess Situation**
   ```bash
   # Check current deployment status
   aws ecs describe-services \
     --cluster glowverse-production \
     --services glowverse-backend
   
   # Check error rates
   # Sentry → Production → Last 15 minutes
   ```

2. **Initiate Rollback**
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

3. **Verify Rollback**
   ```bash
   # Wait for deployment to stabilize
   aws ecs wait services-stable \
     --cluster glowverse-production \
     --services glowverse-backend
   
   # Verify health
   curl https://api.glowverse.com/api/health
   ```

4. **Communicate**
   - Post in #deployments channel
   - Notify stakeholders
   - Update status page

5. **Post-Mortem**
   - Document what went wrong
   - Identify root cause
   - Create action items
   - Update runbook

---

## Post-Deployment Verification

### Immediate (First 10 minutes)

**Monitor:**
- [ ] Sentry error rate < 0.1%
- [ ] CloudWatch logs show no errors
- [ ] All smoke tests passing
- [ ] Response times normal

**Test Critical Flows:**
```bash
# Test authentication
curl -X POST https://api.glowverse.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass"}'

# Test product search
curl https://api.glowverse.com/api/products?search=foundation

# Test checkout flow (if applicable)
# Manual testing recommended
```

---

### Short-term (First Hour)

**Monitor:**
- [ ] Error rate remains < 0.1%
- [ ] Performance metrics stable
- [ ] No user complaints
- [ ] Cache hit rate > 70%
- [ ] Database load normal

**Actions:**
- Review Sentry for new issues
- Check user feedback channels
- Monitor social media (if applicable)
- Verify external integrations (Perfect Corp)

---

### Long-term (First 24 Hours)

**Monitor:**
- [ ] Error trends normal
- [ ] Resource utilization stable
- [ ] No gradual performance degradation
- [ ] User satisfaction unchanged

**Actions:**
- Full error log review
- Performance trend analysis
- User feedback compilation
- Update deployment log

---

## Emergency Procedures

### Complete System Failure

**Scenario:** Application completely unresponsive

**Immediate Actions:**
1. Execute immediate rollback
2. Enable maintenance mode if possible
3. Notify engineering team
4. Create P0 incident in PagerDuty

**Incident Management:**
1. Assign incident commander
2. Create war room (#incident-response)
3. Begin incident response protocol
4. Communicate with stakeholders every 30 minutes

**Investigation:**
1. Review recent changes
2. Analyze error logs
3. Check infrastructure status
4. Identify root cause

**Resolution:**
1. Apply fix or maintain rollback
2. Test thoroughly in staging
3. Deploy fix when ready
4. Conduct post-mortem

---

### Database Issues

**Scenario:** Database corruption or connectivity issues

**Immediate Actions:**
1. Enable read-only mode to prevent further damage
   ```sql
   ALTER DATABASE glowverse SET default_transaction_read_only = on;
   ```

2. Assess damage
   ```sql
   -- Check database integrity
   \dt+ -- List all tables with sizes
    -- Check for constraint violations
   ```

3. If restoration needed:
   ```bash
   # Restore from snapshot
   aws rds restore-db-instance-from-db-snapshot \
     --db-instance-identifier glowverse-recovery \
     --db-snapshot-identifier glowverse-prod-20260213-140000
   ```

4. Validate restored data

5. Update connection string and resume operations

---

## Communication Plan

### Pre-Deployment Announcement

**24 Hours Before:**

**Slack (#general):**
```
🚀 Production Deployment Scheduled

Version: v1.2.3
Scheduled: Tomorrow at 2:00 PM EST
Duration: ~30 minutes
Impact: None expected (zero-downtime deployment)

What's new:
- Enhanced AR try-on features
- Performance improvements
- Bug fixes

Contact: @devops-team with questions
```

**Email (Stakeholders):**
- Subject: Production Deployment - v1.2.3 - [Date]
- Include: What's being deployed, timing, expected impact
- Link to release notes

---

### During Deployment Updates

**Every 10 minutes in #deployments:**
```
✅ [2:00 PM] Deployment started - v1.2.3
✅ [2:05 PM] Pre-checks passed
⏳ [2:10 PM] Awaiting approval
✅ [2:15 PM] Approved - proceeding
✅ [2:20 PM] Database backup complete
✅ [2:25 PM] Migrations complete
✅ [2:30 PM] Application deployed
✅ [2:35 PM] Health checks passed
✅ [2:40 PM] Deployment complete!
```

---

### Post-Deployment Notification

**Success:**

**Slack (#deployments):**
```
✅ Production Deployment Successful

Version: v1.2.3
Deployed: 2:40 PM EST
Duration: 40 minutes
Status: All systems operational

Sentry: https://sentry.io/.../releases/v1.2.3
Metrics: All green ✅

Thank you to the team!
```

**Failure:**

**Slack (#deployments):**
```
❌ Production Deployment Failed - ROLLED BACK

Version: v1.2.3 (attempted)
Status: Rolled back to v1.2.2
Reason: Health checks failed
Impact: None (rollback successful)

Incident: #INC-2345
War room: #deployment-incident
Next steps: Root cause analysis

DO NOT attempt redeployment without approval.
```

---

## Troubleshooting

### Deployment Stuck at "Waiting for Approval"

**Cause:** Approvers haven't been notified or are unavailable

**Resolution:**
1. Check approver list in GitHub environment settings
2. Manually notify approvers in Slack
3. If urgent, execute manual deployment after obtaining verbal approval

---

### Health Checks Timing Out

**Cause:** Application slow to start or database connectivity issues

**Diagnosis:**
```bash
# Check ECS task logs
aws logs tail /ecs/glowverse-backend --follow

# Check database connectivity
psql $DATABASE_URL -c "SELECT 1"

# Check environment variables
aws ecs describe-task-definition \
  --task-definition glowverse-backend | \
  jq '.taskDefinition.containerDefinitions[0].environment'
```

**Resolution:**
1. Verify database is accessible from ECS tasks
2. Check security group rules
3. Verify environment variables are correct
4. Increase health check timeout if necessary

---

### High Error Rate Post-Deployment

**Cause:** Code bugs, configuration issues, or external API failures

**Diagnosis:**
1. Check Sentry for error patterns
2. Review recent code changes
3. Check external API status
4. Verify configuration

**Resolution:**
1. If error rate > 5%: Immediate rollback
2. If error rate 1-5%: Investigate and decide
3. If error rate < 1%: Monitor closely

---

## Deployment Log Template

Document every deployment in `docs/deployments/`:

```markdown
# Deployment Log - v1.2.3

**Date:** 2026-02-13  
**Version:** v1.2.3  
**Deployed By:** John Doe  
**Duration:** 40 minutes

## Pre-Deployment
- Staging validated: ✅
- Team notified: ✅
- Approvers: Jane Smith, Bob Johnson

## Deployment Timeline
- 2:00 PM - Started
- 2:15 PM - Approved
- 2:30 PM - Application deployed
- 2:40 PM - Complete

## Post-Deployment
- Health checks: ✅ Passed
- Smoke tests: ✅ Passed
- Error rate: 0.05%
- Response time (p95): 320ms

## Issues
- None

## Lessons Learned
- Deployment process smooth
- Consider automating cache warming
```

---

## Success Metrics

**Deployment Success:**
- Zero downtime achieved
- Error rate < 0.1%
- Response time impact < 10%
- No rollback required

**Team Efficiency:**
- Deployment duration < 1 hour
- All checks automated
- Clear communication maintained

---

## Support Resources

**Documentation:**
- Deployment Guide: `docs/DEPLOYMENT_GUIDE.md`
- Environment Setup: `docs/ENVIRONMENT_SETUP.md`
- Release Management: `docs/RELEASE_MANAGEMENT.md`

**Monitoring:**
- Sentry: https://sentry.io
- CloudWatch: AWS Console → CloudWatch
- ECS: AWS Console → ECS

**Team:**
- On-call rotation: PagerDuty
- DevOps Lead: [Contact]
- Engineering Lead: [Contact]
- CTO: [Contact]
