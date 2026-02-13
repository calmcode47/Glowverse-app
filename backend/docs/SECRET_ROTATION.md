# Secret Rotation Procedure

## Overview
Regular secret rotation is a critical security practice. This document outlines procedures for rotating all sensitive credentials in the Glowverse backend.

## Rotation Schedule

| Secret Type | Rotation Frequency | Priority |
|-------------|-------------------|----------|
| JWT Secrets | Every 90 days | High |
| Database Credentials | Every 180 days | Critical |
| API Keys (3rd party) | Annually or on compromise | Medium |
| Session Secrets | Every 90 days | Medium |

## JWT Secret Rotation

### Impact
- **Downtime:** None (with proper procedure)
- **User Impact:** Users must re-authenticate after rotation

### Procedure

1. **Generate New Secret**
   ```bash
   openssl rand -base64 48
   ```

2. **Update Environment Variables**
   - Add new secret as `JWT_SECRET_NEW`
   - Keep old secret as `JWT_SECRET_OLD`

3. **Deploy Code Changes**
   Update JWT middleware to accept both secrets during transition:
   ```typescript
   // Verify with new secret first, fall back to old
   try {
     return jwt.verify(token, config.jwt.secret);
   } catch {
     return jwt.verify(token, config.jwt.secretOld);
   }
   ```

4. **Monitor**
   - Wait 24 hours (longer than max token lifetime)
   - Monitor error rates for authentication failures

5. **Complete Rotation**
   - Remove `JWT_SECRET_OLD`
   - Rename `JWT_SECRET_NEW` to `JWT_SECRET`
   - Deploy final changes

6. **Verify**
   - Confirm all users can authenticate
   - Check error logs for JWT verification failures

### Rollback
If issues occur, revert to old secret immediately.

## Database Credential Rotation

### Impact
- **Downtime:** ~5 minutes during connection pool refresh
- **User Impact:** Brief service interruption

### Procedure

1. **Create New Database User**
   ```sql
   CREATE USER glowverse_new WITH PASSWORD 'new_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE glowverse_prod TO glowverse_new;
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO glowverse_new;
   ```

2. **Update Connection String**
   - Update `DATABASE_URL` in secrets manager
   - Do NOT deploy yet

3. **Schedule Maintenance Window**
   - Notify users of brief downtime
   - Choose low-traffic period

4. **Deploy**
   - Deploy new environment variable
   - Application will restart and use new credentials

5. **Verify**
   - Check application logs for database connection success
   - Run health check: `curl https://api.glowverse.com/api/health`

6. **Remove Old User**
   Wait 24 hours, then:
   ```sql
   REVOKE ALL PRIVILEGES ON DATABASE glowverse_prod FROM glowverse_old;
   DROP USER glowverse_old;
   ```

### Rollback
1. Revert `DATABASE_URL` to old credentials
2. Redeploy application

## Third-Party API Keys

### Cloudinary

1. **Generate New API Key**
   - Log in to Cloudinary dashboard
   - Navigate to Settings → Security
   - Generate new API key/secret pair

2. **Update Environment**
   - Update `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`
   - Deploy changes

3. **Verify**
   - Test image upload: `POST /api/v1/upload`
   - Check Cloudinary dashboard for new requests

4. **Revoke Old Key**
   - Delete old API key from Cloudinary dashboard

### Perfect Corp

1. **Contact Perfect Corp Support**
   - Request new API key
   - Provide rotation reason and timeline

2. **Receive New Key**
   - Perfect Corp will provide new key with activation date

3. **Update Environment**
   - Update `PERFECTCORP_API_KEY` before activation date
   - Deploy changes

4. **Verify**
   - Test AR try-on: `POST /api/v1/perfect-corp/try-on`
   - Monitor Perfect Corp API usage dashboard

5. **Confirm Deactivation**
   - Verify old key is deactivated on scheduled date

## Emergency Rotation (Compromised Secrets)

### Immediate Actions (Within 1 Hour)

1. **Assess Scope**
   - Which secret was compromised?
   - What systems have access?
   - What data is at risk?

2. **Revoke Immediately**
   - For API keys: Revoke in provider dashboard
   - For database: Change password immediately
   - For JWT: Force all users to re-authenticate

3. **Generate New Secret**
   - Follow standard rotation procedure but skip waiting periods
   - Deploy immediately

4. **Monitor**
   - Watch for unauthorized access attempts
   - Check logs for suspicious activity
   - Alert security team

### Post-Incident (Within 24 Hours)

1. **Root Cause Analysis**
   - How was secret compromised?
   - What vulnerabilities exist?
   - Who had access?

2. **Remediation**
   - Fix vulnerability
   - Update access controls
   - Implement additional monitoring

3. **Documentation**
   - Document incident timeline
   - Update security procedures
   - Train team on lessons learned

## Automation

### Recommended Tools
- **AWS Secrets Manager:** Automatic rotation for RDS credentials
- **HashiCorp Vault:** Dynamic secrets with automatic rotation
- **Kubernetes Secrets:** Integration with external secret managers

### Rotation Script Example
```bash
#!/bin/bash
# rotate-jwt-secret.sh

# Generate new secret
NEW_SECRET=$(openssl rand -base64 48)

# Update in secrets manager (example: AWS)
aws secretsmanager update-secret \
  --secret-id production/jwt-secret \
  --secret-string "$NEW_SECRET"

# Trigger deployment
kubectl rollout restart deployment/glowverse-backend

echo "JWT secret rotated successfully"
```

## Verification Checklist

After any rotation:
- [ ] Application starts successfully
- [ ] Health check endpoint returns 200
- [ ] Authentication works for new users
- [ ] Existing sessions handled gracefully
- [ ] No increase in error rates
- [ ] Monitoring dashboards show normal metrics
- [ ] Old secret revoked/deleted
- [ ] Rotation documented in change log

## Contact

For questions or issues during rotation:
- **On-Call Engineer:** PagerDuty escalation
- **Security Team:** security@glowverse.com
- **DevOps Lead:** devops@glowverse.com
