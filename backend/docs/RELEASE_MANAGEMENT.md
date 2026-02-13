# Release Management Guide

## Semantic Versioning

We follow [Semantic Versioning](https://semver.org/) 2.0.0

**Format:** `vMAJOR.MINOR.PATCH`

- **MAJOR** (v2.0.0) - Incompatible API changes, breaking changes
- **MINOR** (v1.2.0) - New features, backward compatible
- **PATCH** (v1.1.1) - Bug fixes, backward compatible

### Examples

```
v1.0.0 → v1.0.1  # Bug fix
v1.0.0 → v1.1.0  # New feature
v1.0.0 → v2.0.0  # Breaking change
```

---

## Release Process

### 1. Prepare Release

**Update Version:**
```bash
# Update version in package.json
npm version patch  # for bug fixes (1.0.0 → 1.0.1)
npm version minor  # for new features (1.0.0 → 1.1.0)
npm version major  # for breaking changes (1.0.0 → 2.0.0)
```

**Update CHANGELOG.md:**
```markdown
## [1.2.0] - 2026-02-13

### Added
- AR try-on for makeup products (#123)
- Referral reward system (#145)

### Changed
- Improved cache hit rate by 30% (#167)
- Optimized database queries (#178)

### Fixed
- Cart total calculation with promotions (#190)
- Image upload timeout issues (#201)

### Security
- Updated all dependencies to latest versions
- Enhanced rate limiting on auth endpoints
```

**Commit Version Bump:**
```bash
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore: bump version to v1.2.0"
git push origin main
```

---

### 2. Create Release Tag

```bash
# Create annotated tag
git tag -a v1.2.0 -m "Release version 1.2.0"

# Push tag to origin
git push origin v1.2.0
```

---

### 3. Create GitHub Release

**Via GitHub UI:**

1. Navigate to: **Repository → Releases → Draft new release**
2. Click **Choose a tag** → Select `v1.2.0`
3. Release title: `Version 1.2.0`
4. Description: Copy from CHANGELOG.md
5. Mark as pre-release (if beta/RC)
6. Click **Publish release**

**Via GitHub CLI:**
```bash
# Create release from tag
gh release create v1.2.0 \
  --title "Version 1.2.0" \
  --notes-file CHANGELOG.md \
  --latest
```

---

### 4. Monitor Deployment

Release publication automatically triggers production deployment workflow.

**Monitor:**
1. GitHub Actions → Watch deployment progress
2. Approve deployment when prompted
3. Monitor health checks
4. Verify deployment success

**Timeline:** ~30-45 minutes

---

## Release Notes Template

Use this template for consistent release notes:

```markdown
## Version 1.2.0 - February 13, 2026

### 🚀 New Features

- **AR Try-On for Makeup**: Users can now virtually try on makeup products using their camera (#123)
  - Powered by Perfect Corp AI
  - Real-time rendering
  - Save and share looks

- **Referral Rewards**: Earn points by referring friends (#145)
  - 100 points per successful referral
  - Redeemable for discounts
  - Track referrals in profile

### 🐛 Bug Fixes

- Fixed cart total calculation when promotions applied (#190)
- Resolved image upload timeout for large files (#201)
- Fixed pagination in product search (#215)

### 🔧 Improvements

- Improved cache hit rate by 30% through intelligent caching strategy (#167)
- Optimized database queries reducing response time by 25% (#178)
- Enhanced error messages for better user experience (#192)

### 📚 Documentation

- Added deployment runbook for production deployments
- Updated API documentation with new endpoints
- Created troubleshooting guide for common issues

### ⚠️ Breaking Changes

**None** - This is a backward-compatible release

### 🔐 Security

- Updated all dependencies to latest versions
- Enhanced rate limiting on authentication endpoints
- Improved input validation and sanitization

### 📊 Performance

- Response time (p95): 450ms → 320ms
- Cache hit rate: 54% → 78%
- Database query time: -25%

### 🙏 Contributors

Thank you to all contributors who made this release possible!
- @johndoe - Feature implementation
- @janedoe - Bug fixes
- @bobsmith - Performance optimizations
```

---

## Hotfix Process

For critical production issues requiring immediate fixes:

### 1. Create Hotfix Branch

```bash
# Create hotfix branch from production tag
git checkout -b hotfix/v1.2.1 v1.2.0
```

---

### 2. Make Minimal Fix

```bash
# Make the fix (keep changes minimal!)
# Edit files...

# Commit fix
git add .
git commit -m "fix: critical bug description"
```

---

### 3. Create Hotfix Release

```bash
# Update version (patch)
npm version patch

# Create tag
git tag -a v1.2.1 -m "Hotfix: critical bug description"

# Push branch and tag
git push origin hotfix/v1.2.1
git push origin v1.2.1
```

---

### 4. Deploy Hotfix

**Fast-track approval process:**

1. Create GitHub release for v1.2.1
2. Notify team in #deployments
3. Get emergency approval (1 approver)
4. Monitor deployment closely

---

### 5. Merge Back to Main

```bash
# Merge hotfix back to main
git checkout main
git merge hotfix/v1.2.1
git push origin main

# Delete hotfix branch
git branch -d hotfix/v1.2.1
git push origin --delete hotfix/v1.2.1
```

---

## Release Schedule

### Regular Releases

**Minor Releases:** Every 2 weeks (Sprint boundary)
- Scheduled for Wednesday
- Deployed 2:00 PM EST
- Announced 24 hours in advance

**Major Releases:** Quarterly
- Scheduled for first Wednesday of quarter
- Deployed 3:00 PM EST
- Announced 1 week in advance

### Emergency Releases (Hotfixes)

**As needed** for critical issues:
- Security vulnerabilities
- Data integrity issues
- Complete feature breakage
- Critical performance degradation

---

## Pre-Release Checklist

Before creating any production release:

**Code Quality:**
- [ ] All tests passing (100%)
- [ ] Code reviewed and approved
- [ ] No known critical bugs
- [ ] Performance benchmarks met

**Documentation:**
- [ ] CHANGELOG.md updated
- [ ] API documentation updated (if applicable)
- [ ] Migration guide created (if breaking changes)
- [ ] Release notes drafted

**Testing:**
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Manual QA completed
- [ ] Tested in staging (>24 hours)

**Infrastructure:**
- [ ] Database migrations tested
- [ ] Rollback plan documented
- [ ] Monitoring alerts configured
- [ ] Backup verified

**Communication:**
- [ ] Team notified (24 hours)
- [ ] Stakeholders informed
- [ ] Support team briefed
- [ ] Status page prepared

---

## Post-Release Checklist

After every production release:

**Immediate (First Hour):**
- [ ] Deployment successful
- [ ] Health checks passing
- [ ] No errors in Sentry
- [ ] Performance metrics normal
- [ ] User flows tested

**Short-term (First 24 Hours):**
- [ ] Error rate monitored
- [ ] Performance trends reviewed
- [ ] User feedback collected
- [ ] Support tickets reviewed

**Long-term (First Week):**
- [ ] Deployment log completed
- [ ] Post-mortem (if issues)
- [ ] Lessons learned documented
- [ ] Next release planned

---

## Version History

Maintain version history in `CHANGELOG.md`:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Feature XYZ in development

## [1.2.0] - 2026-02-13

### Added
- AR try-on for makeup
- Referral reward system

### Fixed
- Cart calculation bug
- Upload timeout issue

## [1.1.0] - 2026-01-30

### Added
- User profiles
- Favorites functionality

## [1.0.0] - 2026-01-15

### Added
- Initial release
- Product catalog
- User authentication
- Shopping cart

[Unreleased]: https://github.com/org/repo/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/org/repo/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/org/repo/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/org/repo/releases/tag/v1.0.0
```

---

## Release Communications

### Internal Announcement (Slack)

**24 Hours Before:**
```
📢 Release Announcement

Version: v1.2.0
Date: Tomorrow, February 13 at 2:00 PM EST
Duration: ~45 minutes

What's New:
✨ AR try-on for makeup products
🎁 Referral reward system
⚡ 25% faster database queries
🐛 Multiple bug fixes

Impact: Zero-downtime deployment
Status Page: https://status.glowverse.com

Questions? Ask in #deployments
```

**Day Of:**
```
🚀 Release Starting Now

Version: v1.2.0
Time: 2:00 PM EST
Monitor: https://github.com/org/repo/actions

Follow updates in this thread 👇
```

### External Communication (Users/Customers)

**Email to Users:**
```
Subject: New Features Available - Version 1.2.0

Hello Glowverse Community!

We're excited to announce new features now available:

🎨 AR Try-On for Makeup
Experience virtual makeup try-on using your device's camera!

🎁 Referral Rewards
Earn points by inviting friends to Glowverse.

⚡ Performance Improvements
Enjoy 25% faster page loads and smoother experience.

Visit our blog for full release notes:
https://blog.glowverse.com/release-v1-2-0

Thank you for using Glowverse!
```

**Social Media:**
```
🎉 New Update Available!

We just released v1.2.0 with:
• AR makeup try-on 💄
• Referral rewards 🎁
• Faster performance ⚡

Try it now: glowverse.com

#Beauty #Technology #AR
```

---

## Rollback Strategy

### When to Rollback

Immediate rollback if:
- Error rate > 5%
- Complete feature breakage
- Data integrity issues
- Security vulnerability introduced

Consider rollback if:
- Error rate 1-5%
- Performance degradation >50%
- User complaints spike
- External dependency failure

### How to Rollback

**Via GitHub CLI:**
```bash
# Trigger deployment with previous version
gh workflow run deploy-production.yml \
  -f version=v1.1.9
```

**Via AWS ECS:**
```bash
# Get previous task definition
PREVIOUS=$(aws ecs describe-services \
  --cluster glowverse-production \
  --services glowverse-backend \
  --query 'services[0].deployments[1].taskDefinition' \
  --output text)

# Rollback
aws ecs update-service \
  --cluster glowverse-production \
  --service glowverse-backend \
  --task-definition $PREVIOUS \
  --force-new-deployment
```

---

## Beta/RC Releases

For testing before production:

### Release Candidate (RC)

```bash
# Create RC tag
git tag -a v1.2.0-rc.1 -m "Release candidate 1"
git push origin v1.2.0-rc.1

# Create GitHub release (mark as pre-release)
gh release create v1.2.0-rc.1 \
  --title "Version 1.2.0 RC1" \
  --notes "Release candidate for testing" \
  --prerelease
```

**Deploy to Staging:**
- Extended testing period (1 week)
- User acceptance testing
- Performance testing
- Security testing

---

## Deprecation Policy

When deprecating features or APIs:

### 1. Announce Deprecation

**3 months before removal:**
```markdown
## Deprecation Notice

The following endpoints will be removed in v2.0.0:

- `GET /api/v1/old-endpoint`
  - Use: `GET /api/v2/new-endpoint`
  - Migration guide: docs/migration-v2.md

Timeline:
- v1.8.0 (Feb 2026): Deprecation warning added
- v1.9.0 (Mar 2026): Last version with deprecated endpoints
- v2.0.0 (Apr 2026): Deprecated endpoints removed
```

### 2. Add Warnings

```typescript
// Add deprecation warning in code
router.get('/api/v1/old-endpoint', (req, res) => {
  res.setHeader('X-API-Warn', 'Deprecated: Use /api/v2/new-endpoint');
  logger.warn('Deprecated endpoint accessed', {
    endpoint: '/api/v1/old-endpoint',
    user: req.user.id
  });
  
  // ... handle request
});
```

### 3. Provide Migration Path

Create detailed migration guide:
```markdown
# Migration Guide: v1 → v2

## Breaking Changes

### Authentication Endpoints

**Old (Removed):**
```http
POST /api/v1/auth/login
```

**New:**
```http
POST /api/v2/auth/signin
```

**Changes:**
- Request body unchanged
- Response format changed (see below)

## Migration Steps

1. Update all API calls to v2 endpoints
2. Update response parsing logic
3. Test thoroughly in staging
4. Deploy to production
```

---

## Support

**Documentation:**
- Changelog: `CHANGELOG.md`
- Version History: `docs/VERSIONS.md`
- Migration Guides: `docs/migrations/`

**Tools:**
- GitHub CLI: https://cli.github.com/
- Semantic Release: https://github.com/semantic-release/semantic-release
- Conventional Commits: https://www.conventionalcommits.org/

**Team Contacts:**
- Release Manager: [Contact]
- Engineering Lead: [Contact]
- DevOps Lead: [Contact]
