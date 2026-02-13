# Database Backup & Recovery Guide

## Overview

The Glowverse backend implements a comprehensive automated backup system with encryption, cross-region replication, and tested recovery procedures to ensure data durability and business continuity.

**Key Features:**
- Automated daily backups
- 30-day retention policy
- Encrypted storage (AES-256)
- Cross-region replication
- Point-in-time recovery
- Tested restoration procedures

---

## Backup Types

### Full Backup

**Description:** Complete database snapshot

**Schedule:** Daily at 2:00 AM UTC

**Retention:** 30 days

**Size:** ~500MB (compressed & encrypted)

**Use Cases:**
- Daily routine backups
- Pre-deployment backups
- Disaster recovery

### Incremental Backup

**Description:** Changes since last full backup

**Schedule:** Every 6 hours (8:00, 14:00, 20:00 UTC)

**Retention:** 7 days

**Size:** ~50MB (compressed & encrypted)

**Use Cases:**
- Frequent change capture
- Point-in-time recovery
- Minimizing backup duration

---

## Backup Schedule

| Time (UTC) | Type | Retention | Frequency |
|------------|------|-----------|-----------|
| 02:00 | Full | 30 days | Daily |
| 08:00 | Incremental | 7 days | Daily |
| 14:00 | Incremental | 7 days | Daily |
| 20:00 | Incremental | 7 days | Daily |

**RPO (Recovery Point Objective):** 6 hours maximum data loss

**RTO (Recovery Time Objective):** 1 hour for full database restore

---

## Storage Locations

### Primary Storage (S3)

**Bucket:** `s3://glowverse-backups-production`

**Region:** us-east-1

**Features:**
- Server-side encryption (AES-256)
- Versioning enabled
- Lifecycle policies configured
- Access logging enabled

### Replica Storage (Cross-Region)

**Bucket:** `s3://glowverse-backups-dr`

**Region:** us-west-2

**Features:**
- Cross-region replication from primary
- Same encryption and security settings
- Disaster recovery failover capability

### RDS Automated Snapshots

**Schedule:** Daily at 03:00 UTC

**Retention:** 7 days (automated)

**Manual Snapshots:** Before each production deployment (indefinite retention)

---

## Manual Backup Procedures

### Via Backup Script

**Full backup:**
```bash
# Production full backup
./scripts/backup-database.sh production full

# Staging backup
./scripts/backup-database.sh staging full
```

**Incremental backup:**
```bash
./scripts/backup-database.sh production incremental
```

### Via GitHub Actions

1. Navigate to: **Actions → Automated Database Backup**
2. Click **Run workflow**
3. Select:
   - Environment: `production` or `staging`
   - Backup type: `full` or `incremental`
4. Click **Run workflow**
5. Monitor progress in Actions tab

### Via AWS Console (RDS Snapshots)

1. Navigate to: **RDS → Databases**
2. Select database instance
3. Click **Actions → Take snapshot**
4. Enter snapshot identifier (e.g., `manual-backup-20260213`)
5. Add tags:
   - `Environment`: `production`
   - `Type`: `manual`
   - `Purpose`: `description`
6. Click **Take snapshot**

---

## Recovery Procedures

### Full Database Restore

**When to Use:**
- Complete database loss
- Data corruption across entire database
- Disaster recovery scenario
- Restore to previous state

**Prerequisites:**
- Backup file name or timestamp
- Database credentials
- Team lead approval (for production)

**Steps:**

1. **Identify backup:**
   ```bash
   # List available backups
   aws s3 ls s3://glowverse-backups-production/ | sort | tail -n 10
   ```

2. **Run restore script:**
   ```bash
   # Restore to staging (for testing)
   ./scripts/restore-database.sh staging production-full-20260213-020000.sql.gz.gpg
   
   # Restore to production (requires confirmation)
   ./scripts/restore-database.sh production production-full-20260213-020000.sql.gz.gpg
   ```

3. **Verify restoration:**
   ```bash
   # Connect to database
   psql -h $DB_HOST -U $DB_USER -d $DB_NAME
   
   # Check table counts
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM products;
   SELECT COUNT(*) FROM orders;
   
   # Verify recent data
   SELECT * FROM users ORDER BY created_at DESC LIMIT 10;
   ```

4. **Test application:**
   ```bash
   # Health check
   curl https://api.glowverse.com/api/health
   
   # Test critical endpoints
   curl https://api.glowverse.com/api/products
   curl https://api.glowverse.com/api/auth/login -X POST \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"testpass"}'
   ```

---

### Point-in-Time Recovery (RDS)

**When to Use:**
- Need to restore to specific timestamp
- Data corruption within known timeframe
- Accidental data deletion

**Steps:**

1. **Navigate to RDS Console:**
   - Go to: **RDS → Automated backups**
   - Select production database

2. **Restore to point in time:**
   - Click **Actions → Restore to point in time**
   - Select timestamp (within last 7 days)
   - Configure new instance settings:
     - DB instance identifier: `glowverse-recovery-YYYYMMDD`
     - Instance class: Same as production
     - VPC and security groups: Same as production

3. **Wait for restore:** (~20-30 minutes)

4. **Verify restored data:**
   ```bash
   # Connect to recovery instance
   psql -h glowverse-recovery.xxxxx.rds.amazonaws.com -U postgres -d glowverse
   
   # Verify data at specific timestamp
   SELECT * FROM orders WHERE created_at <= '2026-02-13 14:30:00';
   ```

5. **Update application configuration:**
   - Update `DATABASE_URL` to point to recovery instance
   - Restart application
   - Test thoroughly

6. **Make permanent (if successful):**
   - Rename recovery instance to production
   - Or migrate data back to original instance

---

### Partial Data Recovery

**When to Use:**
- Specific table(s) corrupted
- Accidental deletion of specific records
- Selective data restoration needed

**Restore specific table:**
```bash
# Download and decrypt backup
aws s3 cp s3://glowverse-backups-production/production-full-20260213-020000.sql.gz.gpg /tmp/
gpg --decrypt /tmp/production-full-20260213-020000.sql.gz.gpg | gunzip > /tmp/backup.sql

# Restore only the users table
pg_restore \
  --host=$DB_HOST \
  --username=$DB_USER \
  --dbname=$DB_NAME \
  --table=users \
  /tmp/backup.sql

# Verify
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) FROM users;"
```

**Restore specific records:**
```bash
# Extract data to temporary table
pg_restore \
  --host=$DB_HOST \
  --username=$DB_USER \
  --dbname=$DB_NAME \
  --table=users \
  --schema=temp \
  /tmp/backup.sql

# Insert specific records back
psql -h $DB_HOST -U $DB_USER -d $DB_NAME <<SQL
INSERT INTO users 
SELECT * FROM temp.users 
WHERE id IN (123, 456, 789)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  updated_at = NOW();
SQL
```

---

## Recovery Time & Point Objectives

### Production Environment

| Scenario | RTO | RPO | Method |
|----------|-----|-----|--------|
| Full database restore | 1 hour | 6 hours | S3 backup |
| Point-in-time recovery | 2 hours | 5 minutes | RDS automated backup |
| Partial data recovery | 30 minutes | 6 hours | Table-level restore |
| Disaster recovery | 4 hours | 6 hours | Cross-region failover |

### Staging Environment

| Scenario | RTO | RPO | Method |
|----------|-----|-----|--------|
| Full database restore | 2 hours | 24 hours | S3 backup |
| Point-in-time recovery | 3 hours | 24 hours | RDS automated backup |

---

## Testing Backup Integrity

### Monthly Backup Verification (Required)

**Schedule:** First Monday of each month

**Procedure:**

1. **Select random backup:**
   ```bash
   # List backups from last 30 days
   aws s3 ls s3://glowverse-backups-production/ | sort | tail -n 30 | shuf -n 1
   ```

2. **Verify backup integrity:**
   ```bash
   BACKUP_FILE="production-full-20260201-020000.sql.gz.gpg"
   ./scripts/verify-backup.sh $BACKUP_FILE
   ```

3. **Restore to test database:**
   ```bash
   # Create test database
   psql -h $DB_HOST -U postgres -c "CREATE DATABASE glowverse_test_restore;"
   
   # Restore backup
   ./scripts/restore-database.sh test $BACKUP_FILE
   ```

4. **Run validation queries:**
   ```sql
   -- Check total records
   SELECT 'users' as table_name, COUNT(*) FROM users
   UNION ALL
   SELECT 'products', COUNT(*) FROM products
   UNION ALL
   SELECT 'orders', COUNT(*) FROM orders;
   
   -- Check data integrity
   SELECT COUNT(*) FROM users WHERE email IS NULL; -- Should be 0
   SELECT COUNT(*) FROM products WHERE price < 0; -- Should be 0
   
   -- Verify foreign key relationships
   SELECT COUNT(*) FROM orders o 
   LEFT JOIN users u ON o.user_id = u.id 
   WHERE u.id IS NULL; -- Should be 0
   ```

5. **Document results:**
   ```markdown
   ## Backup Verification Report - 2026-02-13
   
   **Backup File:** production-full-20260213-020000.sql.gz.gpg
   **Test Date:** 2026-02-13
   **Tested By:** John Doe
   
   **Results:**
   - ✅ Backup integrity verified
   - ✅ All critical tables present
   - ✅ Data validation passed
   - ✅ Foreign key relationships intact
   
   **Statistics:**
   - Users: 15,234
   - Products: 3,456
   - Orders: 45,678
   - Restore time: 25 minutes
   ```

---

## Disaster Recovery Plan

### Scenario 1: Complete Database Loss

**Impact:** Critical - Complete service outage

**Immediate Actions (First 15 minutes):**

1. **Activate incident response:**
   - Create P0 incident in PagerDuty
   - Notify engineering team
   - Create war room (#incident-db-loss)
   - Enable maintenance mode on frontend

2. **Assess situation:**
   - Verify database is truly unavailable
   - Check RDS console for instance status
   - Review CloudWatch logs
   - Identify last known good backup

3. **Communicate:**
   - Update status page
   - Notify stakeholders
   - Set expectations for recovery time

**Recovery Steps (15-60 minutes):**

1. **Provision new database:**
   ```bash
   # Restore from latest RDS snapshot
   aws rds restore-db-instance-from-db-snapshot \
     --db-instance-identifier glowverse-production-recovery \
     --db-snapshot-identifier latest-snapshot-id \
     --db-instance-class db.r5.large \
     --multi-az
   ```

2. **Restore application data:**
   ```bash
   # Get latest backup
   LATEST_BACKUP=$(aws s3 ls s3://glowverse-backups-production/ | sort | tail -n 1 | awk '{print $4}')
   
   # Restore to new instance
   ./scripts/restore-database.sh production $LATEST_BACKUP
   ```

3. **Verify data integrity:**
   - Run validation queries
   - Check critical tables
   - Verify recent data

4. **Update application:**
   - Update DATABASE_URL in environment
   - Restart application services
   - Run smoke tests

5. **Return to service:**
   - Disable maintenance mode
   - Monitor error rates
   - Update status page

**Post-Recovery (After resolution):**

1. **Root cause analysis:**
   - Document what happened
   - Identify preventive measures
   - Update incident playbook

2. **Review and improve:**
   - Test backup/restore procedures
   - Update documentation
   - Review RTO/RPO targets

---

### Scenario 2: Data Corruption

**Impact:** High - Partial service degradation

**Detection:**
- User reports of incorrect data
- Data validation checks failing
- Referential integrity errors
- Sentry alerts for database errors

**Response:**

1. **Isolate corruption:**
   ```sql
   -- Identify corrupted tables
   SELECT tablename, schemaname 
   FROM pg_tables 
   WHERE schemaname = 'public';
   
   -- Check specific table
   SELECT COUNT(*) FROM suspicious_table 
   WHERE expected_condition_fails;
   ```

2. **Enable read-only mode:**
   ```sql
   -- Prevent further writes
   ALTER DATABASE glowverse SET default_transaction_read_only = on;
   ```

3. **Assess scope:**
   - Which tables affected?
   - When did corruption occur?
   - Can we restore specific tables?

4. **Selective restore:**
   ```bash
   # Restore only affected table(s)
   pg_restore \
     --host=$DB_HOST \
     --username=$DB_USER \
     --dbname=$DB_NAME \
     --table=affected_table \
     $BACKUP_FILE
   ```

5. **Validate and resume:**
   ```sql
   -- Verify data integrity
   SELECT * FROM affected_table LIMIT 100;
   
   -- Re-enable writes
   ALTER DATABASE glowverse SET default_transaction_read_only = off;
   ```

---

## Monitoring & Alerts

### Backup Monitoring

**Metrics Tracked:**
- Backup success/failure rate
- Backup duration
- Backup file size
- S3 storage usage
- Last successful backup age

**Dashboards:**
- CloudWatch: Backup workflow metrics
- Slack: Daily backup notifications
- Internal dashboard: Backup health status

### Alerts

**Critical (🔴) - Immediate Action:**
- Backup failed for >24 hours
- Backup verification failed
- S3 storage approaching quota (>90%)
- Backup size anomaly (>100% deviation)

**Warning (🟡) - Review Required:**
- Backup duration exceeded 2 hours
- Backup size deviation >50%
- Old backups not cleaned up
- Backup verification not run this month

**Notification Channels:**
- Slack: #alerts-database
- PagerDuty: Database on-call
- Email: DevOps team

---

## Security

### Encryption

**In-Transit:**
- TLS 1.3 for all database connections
- HTTPS for S3 uploads
- Encrypted connections to AWS services

**At-Rest:**
- S3 server-side encryption (AES-256)
- RDS encryption enabled
- Backup files encrypted with GPG (AES-256)

**Key Management:**
- Encryption keys stored in AWS Secrets Manager
- Keys rotated quarterly
- Access restricted to authorized personnel

### Access Control

**S3 Bucket Policies:**
- Private buckets (no public accessallowed)
- IAM role-based access only
- MFA required for deletion operations
- Access logging enabled

**Database Access:**
- Credentials rotated monthly
- Least privilege principle
- Access audited quarterly
- Connection from specific IPs only

### Compliance

**Data Retention:**
- Production: 30 days
- Compliance: Extended retention as required
- Deletion: Secure permanent deletion after retention

**Audit Logs:**
- All backup operations logged
- S3 access logs retained for 1 year
- Quarterly compliance reviews

---

## Troubleshooting

### Backup Failed

**Symptoms:** GitHub Actions workflow fails, no new backup in S3

**Diagnosis:**
```bash
# Check workflow logs
gh run list --workflow=database-backup.yml

# Check S3 for recent backups
aws s3 ls s3://glowverse-backups-production/ | tail -n 5

# Test database connectivity
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "SELECT 1;"
```

**Common Causes:**
- Database credentials expired
- Network connectivity issues
- S3 bucket permissions incorrect
- Disk space insufficient

**Resolution:**
1. Verify database credentials in GitHub Secrets
2. Check network/security group rules
3. Verify S3 bucket policies and IAM roles
4. Re-run workflow manually

---

### Restore Failed

**Symptoms:** Restore script fails, data not appearing in database

**Diagnosis:**
```bash
# Check backup file integrity
gpg --decrypt backup.sql.gz.gpg | gunzip | head -n 100

# Verify database connectivity
psql -h $DB_HOST -U $DB_USER -d $DB_NAME -c "\dt"

# Check database logs
aws logs tail /rds/glowverse-production/postgresql --follow
```

**Common Causes:**
- Corrupted backup file
- Insufficient database disk space
- Schema conflicts
- Permissions issues

**Resolution:**
1. Try a different backup file
2. Increase database storage if needed
3. Review schema differences
4. Verify database user permissions

---

## Best Practices

1. **Test backups monthly** - Never trust untested backups
2. **Monitor backup health** - Set up alerts for failures
3. **Document recoveries** - Learn from each incident
4. **Practice recovery** - Run disaster recovery drills
5. **Automate everything** - Reduce human error
6. **Encrypt everything** - Protect data in transit and at rest
7. **Multiple locations** - Cross-region replication for DR
8. **Version control** - Keep backup scripts in git

---

## Scripts Reference

### backup-database.sh

**Purpose:** Create encrypted database backup and upload to S3

**Usage:**
```bash
./scripts/backup-database.sh <environment> <backup_type>
```

**Required Environment Variables:**
- `PRODUCTION_DB_HOST`, `PRODUCTION_DB_NAME`, `PRODUCTION_DB_USER`, `PRODUCTION_DB_PASSWORD`
- `STAGING_DB_HOST`, `STAGING_DB_NAME`, `STAGING_DB_USER`, `STAGING_DB_PASSWORD`
- `BACKUP_ENCRYPTION_KEY`
- `SLACK_WEBHOOK_URL` (optional)

### restore-database.sh

**Purpose:** Restore database from encrypted S3 backup

**Usage:**
```bash
./scripts/restore-database.sh <environment> <backup_file>
```

**Safety Features:**
- Production requires typed confirmation
- Creates pre-restore snapshot
- Validates restored data
- Sends notifications

### verify-backup.sh

**Purpose:** Verify backup file integrity and structure

**Usage:**
```bash
./scripts/verify-backup.sh <backup_file>
```

**Checks:**
- File can be decrypted
- File can be decompressed
- Critical tables present
- File size reasonable

---

## Support

**Documentation:**
- Deployment Guide: `docs/DEPLOYMENT_GUIDE.md`
- Production Runbook: `docs/PRODUCTION_DEPLOYMENT.md`
- Environment Setup: `docs/ENVIRONMENT_SETUP.md`

**Team Contacts:**
- Database Administrator: [Contact]
- On-call Engineer: Check PagerDuty rotation
- DevOps Lead: [Contact]

**Emergency:**
- Create P0 incident in PagerDuty
- Post in #incident-response Slack channel
- Email: devops-emergency@glowverse.com
