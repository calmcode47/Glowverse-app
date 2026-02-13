# GitHub Secrets Configuration Guide

## Overview

This guide explains how to configure all required secrets and environment variables for the Glowverse backend CI/CD pipeline.

---

## Repository Secrets

Navigate to: **Settings → Secrets and variables → Actions → Repository secrets**

### Docker Registry

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `DOCKER_USERNAME` | Docker Hub username | `glowverse` |
| `DOCKER_PASSWORD` | Docker Hub access token | `dckr_pat_xxxxxxxxxxxxx` |

**How to get Docker Hub token:**
1. Log in to Docker Hub
2. Go to Account Settings → Security
3. Click "New Access Token"
4. Name it "GitHub Actions"
5. Copy the token (only shown once)

### SSH Access - Staging

| Secret Name | Description | How to Generate |
|------------|-------------|-----------------|
| `STAGING_SSH_KEY` | Private SSH key for staging server | `ssh-keygen -t ed25519 -C "github-actions-staging"` |
| `STAGING_SERVER_HOST` | Staging server hostname/IP | `staging.glowverse.com` or `192.168.1.100` |
| `STAGING_SERVER_USER` | SSH username | `deploy` or `ubuntu` |

**SSH Key Setup:**
```bash
# Generate SSH key pair
ssh-keygen -t ed25519 -C "github-actions-staging" -f staging_key

# Copy private key content to STAGING_SSH_KEY secret
cat staging_key

# Add public key to server
ssh-copy-id -i staging_key.pub user@staging-server
# OR manually: cat staging_key.pub >> ~/.ssh/authorized_keys
```

### SSH Access - Production

| Secret Name | Description | How to Generate |
|------------|-------------|-----------------|
| `PRODUCTION_SSH_KEY` | Private SSH key for production server | `ssh-keygen -t ed25519 -C "github-actions-production"` |
| `PRODUCTION_SERVER_HOST` | Production server hostname/IP | `api.glowverse.com` or `production-ip` |
| `PRODUCTION_SERVER_USER` | SSH username | `deploy` or `ubuntu` |

### Monitoring & Analytics

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `SENTRY_AUTH_TOKEN` | Sentry API authentication token | Sentry → Settings → Auth Tokens |
| `SENTRY_ORG` | Sentry organization slug | Sentry → Settings → Organization |
| `CODECOV_TOKEN` | Codecov upload token (optional) | Codecov.io → Repository Settings |

**Sentry Auth Token:**
1. Go to https://sentry.io/settings/account/api/auth-tokens/
2. Click "Create New Token"
3. Scopes: `project:read`, `project:write`, `project:releases`
4. Copy token

### Notifications

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `SLACK_WEBHOOK_URL` | Slack incoming webhook URL | Slack → Apps → Incoming Webhooks |

**Slack Webhook Setup:**
1. Go to https://api.slack.com/apps
2. Create new app or select existing
3. Enable "Incoming Webhooks"
4. Click "Add New Webhook to Workspace"
5. Select channel (e.g., `#deployments`)
6. Copy webhook URL

---

## Environment Secrets

Navigate to: **Settings → Environments → [Environment Name] → Environment secrets**

### Create Environments

Create two environments:
1. **staging** - For staging deployments
2. **production** - For production deployments (with protection rules)

### Staging Environment Secrets

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/glowverse_staging` |
| `REDIS_URL` | Redis connection string | `redis://host:6379` |
| `REDIS_TTL` | Default cache TTL (seconds) | `900` (15 minutes) |
| `JWT_SECRET` | JWT signing secret | Generate: `openssl rand -base64 32` |
| `JWT_REFRESH_SECRET` | Refresh token secret | Generate: `openssl rand -base64 32` |
| `JWT_EXPIRES_IN` | Access token expiration | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration | `7d` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `glowverse-staging` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | From Cloudinary dashboard |
| `PERFECT_CORP_API_KEY` | Perfect Corp API key | From Perfect Corp dashboard |
| `PERFECT_CORP_API_SECRET` | Perfect Corp API secret | From Perfect Corp dashboard |
| `SENTRY_DSN` | Sentry Data Source Name | From Sentry project settings |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 minutes) |
| `RATE_LIMIT_MAX` | Max requests per window | `1000` |
| `CORS_ORIGIN` | Allowed CORS origins | `https://staging.glowverse.com` |

### Production Environment Secrets

Same secrets as staging, but with production values:

| Secret Name | Production Value Example |
|------------|--------------------------|
| `DATABASE_URL` | `postgresql://user:pass@prod-host:5432/glowverse_production` |
| `REDIS_URL` | `redis://prod-redis:6379` |
| `CLOUDINARY_CLOUD_NAME` | `glowverse-production` |
| `SENTRY_DSN` | Production Sentry DSN |
| `CORS_ORIGIN` | `https://glowverse.com,https://www.glowverse.com` |

---

## Environment Protection Rules

### Production Environment

Navigate to: **Settings → Environments → production**

**Configure protection rules:**

1. **Required reviewers:** Add 2+ team members
   - Check "Required reviewers"
   - Add team members who can approve deployments

2. **Wait timer:** Optional delay before deployment
   - Useful for scheduled maintenance windows

3. **Deployment branches:** Limit to specific branches
   - Select "Selected branches"
   - Add rule: `main` only

---

## Generating Secrets

### JWT Secrets

```bash
# Generate strong random secrets
openssl rand -base64 32
# Output: e.g., "xK7mP9nQ2wR5tY8uI1oP3aS6dF9gH2jK4lZ7xC0vB5nM8="
```

### SSH Keys

```bash
# Generate Ed25519 key (recommended)
ssh-keygen -t ed25519 -C "github-actions" -f deploy_key

# Generate RSA key (if Ed25519 not supported)
ssh-keygen -t rsa -b 4096 -C "github-actions" -f deploy_key

# View private key (add to GitHub secret)
cat deploy_key

# View public key (add to server)
cat deploy_key.pub
```

---

## Verification Checklist

### Repository Secrets (8 required)

- [ ] `DOCKER_USERNAME`
- [ ] `DOCKER_PASSWORD`
- [ ] `STAGING_SSH_KEY`
- [ ] `STAGING_SERVER_HOST`
- [ ] `STAGING_SERVER_USER`
- [ ] `PRODUCTION_SSH_KEY`
- [ ] `PRODUCTION_SERVER_HOST`
- [ ] `PRODUCTION_SERVER_USER`

### Optional Repository Secrets

- [ ] `SENTRY_AUTH_TOKEN` (for release tracking)
- [ ] `SENTRY_ORG` (for release tracking)
- [ ] `CODECOV_TOKEN` (for coverage reports)
- [ ] `SLACK_WEBHOOK_URL` (for notifications)

### Staging Environment Secrets (17 required)

- [ ] `DATABASE_URL`
- [ ] `REDIS_URL`
- [ ] `REDIS_TTL`
- [ ] `JWT_SECRET`
- [ ] `JWT_REFRESH_SECRET`
- [ ] `JWT_EXPIRES_IN`
- [ ] `JWT_REFRESH_EXPIRES_IN`
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`
- [ ] `PERFECT_CORP_API_KEY`
- [ ] `PERFECT_CORP_API_SECRET`
- [ ] `SENTRY_DSN`
- [ ] `RATE_LIMIT_WINDOW_MS`
- [ ] `RATE_LIMIT_MAX`
- [ ] `CORS_ORIGIN`
- [ ] `STAGING_DATABASE_URL` (same as DATABASE_URL, for deployment workflow)

### Production Environment Secrets (17 required)

- [ ] All same secrets as staging (with production values)
- [ ] `PRODUCTION_DATABASE_URL` (for deployment workflow)

---

## Testing Secrets Configuration

### Test Repository Secrets

```bash
# Trigger test workflow
git push origin feature-branch

# Check workflow run in GitHub Actions
# Verify no "secret not found" errors
```

### Test Environment Secrets

```bash
# Trigger staging deployment
git push origin staging

# Check deployment logs
# Verify all environment variables loaded correctly
```

---

## Security Best Practices

### Secret Rotation

**Frequency:**
- JWT secrets: Every 90 days
- API keys: Every 180 days
- SSH keys: Every 365 days
- Database passwords: Every 90 days

**Process:**
1. Generate new secret
2. Update GitHub secret
3. Update server configuration
4. Test deployment
5. Revoke old secret

### Access Control

- Limit repository access to authorized team members
- Use environment protection rules for production
- Enable audit logging
- Review access logs monthly

### Monitoring

- Monitor failed workflow runs
- Alert on unauthorized access attempts
- Track secret usage in audit logs
- Review Sentry for configuration errors

---

## Troubleshooting

### "Secret not found" Error

**Cause:** Secret not configured or misspelled

**Solution:**
1. Check secret name matches exactly (case-sensitive)
2. Verify secret exists in correct scope (repository vs environment)
3. Check environment name matches workflow

### SSH Connection Failures

**Cause:** SSH key not authorized or incorrect

**Solution:**
1. Verify public key added to server `~/.ssh/authorized_keys`
2. Check private key format (should include `-----BEGIN` and `-----END`)
3. Verify server hostname/IP is correct
4. Check firewall allows SSH (port 22)

### Database Connection Errors

**Cause:** Invalid DATABASE_URL or network issues

**Solution:**
1. Test connection string locally
2. Verify database server allows connections from GitHub Actions IPs
3. Check username/password are correct
4. Verify database exists

---

## Support

**GitHub Secrets Documentation:** https://docs.github.com/en/actions/security-guides/encrypted-secrets

**Need Help?**
- Check workflow logs in GitHub Actions
- Review Sentry for runtime errors
- Contact DevOps team
