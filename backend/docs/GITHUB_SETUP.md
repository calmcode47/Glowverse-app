# GitHub Repository Setup

## Branch Protection Rules

### Main Branch

Navigate to: **Settings → Branches → Add rule**

**Branch name pattern:** `main`

**Protection rules:**
- ✅ Require a pull request before merging
  - Require approvals: 1
  - Dismiss stale pull request approvals when new commits are pushed
  - Require review from Code Owners (optional)
- ✅ Require status checks to pass before merging
  - Require branches to be up to date before merging
  - **Required status checks:**
    - `lint-and-typecheck`
    - `security-audit`
    - `test`
    - `build`
    - `summary`
- ✅ Require conversation resolution before merging
- ✅ Require linear history
- ✅ Do not allow bypassing the above settings
- ❌ Do not allow force pushes
- ❌ Do not allow deletions

### Develop Branch

**Branch name pattern:** `develop`

**Protection rules:**
- ✅ Require a pull request before merging
  - Require approvals: 1
- ✅ Require status checks to pass before merging
  - **Required status checks:**
    - `lint-and-typecheck`
    - `test`
    - `build`
- ✅ Require conversation resolution before merging
- ❌ Do not allow force pushes

---

## Required Secrets

Navigate to: **Settings → Secrets and variables → Actions → New repository secret**

### Repository Secrets

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `CODECOV_TOKEN` | Codecov upload token | https://codecov.io → Repository Settings → Copy token |
| `SNYK_TOKEN` | Snyk security scanning token | https://snyk.io → Account Settings → API Token |
| `DOCKER_USERNAME` | Docker Hub username | Your Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub password/token | Docker Hub → Account Settings → Security → New Access Token |
| `SENTRY_AUTH_TOKEN` | Sentry authentication token | Sentry → Settings → Auth Tokens → Create New Token |

### Optional Secrets

| Secret Name | Description | Purpose |
|------------|-------------|---------|
| `SLACK_WEBHOOK_URL` | Slack incoming webhook | Deployment notifications |

---

## Environment Variables

No environment variables needed for CI workflow (uses test database services).

---

## Codecov Setup

1. Go to https://codecov.io
2. Sign in with GitHub
3. Add your repository
4. Copy the upload token
5. Add as `CODECOV_TOKEN` secret in GitHub

**Optional:** Create `codecov.yml` in repository root:
```yaml
coverage:
  status:
    project:
      default:
        target: 70%
        threshold: 5%
    patch:
      default:
        target: 70%

comment:
  layout: "reach, diff, flags, files"
  behavior: default
```

---

## Snyk Setup

1. Go to https://snyk.io
2. Sign in with GitHub
3. Add your repository
4. Go to Account Settings → General
5. Copy your API token
6. Add as `SNYK_TOKEN` secret in GitHub

---

## Docker Hub Setup

1. Go to https://hub.docker.com
2. Sign in or create account
3. Go to Account Settings → Security
4. Click "New Access Token"
5. Name it "GitHub Actions"
6. Copy the token
7. Add `DOCKER_USERNAME` (your username) and `DOCKER_PASSWORD` (the token) as secrets

---

## Verification Checklist

### Branch Protection
- [ ] Main branch protection rules configured
- [ ] Develop branch protection rules configured
- [ ] Required status checks added
- [ ] Force push disabled

### Secrets
- [ ] `CODECOV_TOKEN` added
- [ ] `SNYK_TOKEN` added
- [ ] `DOCKER_USERNAME` added
- [ ] `DOCKER_PASSWORD` added
- [ ] `SENTRY_AUTH_TOKEN` added (optional)

### Testing
- [ ] Create test PR to verify CI runs
- [ ] Verify all status checks appear
- [ ] Confirm branch protection blocks merge if checks fail
- [ ] Test that approved PR can merge

---

## Troubleshooting

### Status checks not appearing

**Problem:** Required status checks don't show up in branch protection settings

**Solution:**
1. The workflow must run at least once before checks appear
2. Create a test PR to trigger the workflow
3. Wait for workflow to complete
4. Refresh branch protection settings page

### Codecov upload failing

**Problem:** Coverage upload step fails

**Solution:**
1. Verify `CODECOV_TOKEN` is set correctly
2. Check that coverage files exist: `./coverage/lcov.info`
3. Set `continue-on-error: true` to make it non-blocking

### Snyk scan failing

**Problem:** Snyk security scan fails

**Solution:**
1. Verify `SNYK_TOKEN` is set correctly
2. Check for high-severity vulnerabilities
3. Set `continue-on-error: true` to make it non-blocking
4. Review vulnerabilities and create exceptions if needed

---

## Additional Configuration

### CODEOWNERS File

Create `.github/CODEOWNERS`:
```
# Backend code owners
/backend/ @your-team/backend-team

# CI/CD workflows
/.github/workflows/ @your-team/devops-team

# Documentation
/docs/ @your-team/tech-writers
```

### Pull Request Template

Create `.github/pull_request_template.md`:
```markdown
## Description
<!-- Describe your changes -->

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Checklist
- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Added tests for new features
```

---

## Support

**GitHub Documentation:**
- Branch Protection: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches
- GitHub Actions Secrets: https://docs.github.com/en/actions/security-guides/encrypted-secrets
