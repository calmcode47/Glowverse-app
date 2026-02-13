#!/bin/bash

echo "🔒 Running Security Audit..."
echo ""

# NPM audit
echo "📦 Checking npm dependencies for vulnerabilities..."
npm audit --audit-level=moderate

if [ $? -ne 0 ]; then
  echo "⚠️  Vulnerabilities found. Run 'npm audit fix' to resolve."
else
  echo "✅ No vulnerabilities found in dependencies"
fi

echo ""

# Check for sensitive data in environment files
echo "🔍 Checking for exposed secrets..."
if grep -r "API_KEY\|SECRET\|PASSWORD" .env* 2>/dev/null | grep -v ".example"; then
  echo "⚠️  Potential secrets found in environment files"
else
  echo "✅ No exposed secrets detected"
fi

echo ""

# Check CORS configuration
echo "🌐 Checking CORS configuration..."
if grep -q "CORS_ORIGIN=\*" .env* 2>/dev/null; then
  echo "⚠️  CORS is set to allow all origins (not recommended for production)"
else
  echo "✅ CORS configuration looks secure"
fi

echo ""

# Check for hardcoded secrets in code
echo "🔑 Scanning for hardcoded secrets in source code..."
if grep -r "password.*=.*['\"]" src/ --include="*.ts" --include="*.js" 2>/dev/null | grep -v "password:" | grep -v "// "; then
  echo "⚠️  Potential hardcoded passwords found"
else
  echo "✅ No hardcoded secrets detected in source code"
fi

echo ""

# Check security headers
echo "🛡️  Checking security middleware..."
if grep -q "helmet" src/app.ts 2>/dev/null; then
  echo "✅ Helmet security headers configured"
else
  echo "⚠️  Helmet security headers not found"
fi

echo ""

# Check rate limiting
echo "⏱️  Checking rate limiting..."
if grep -q "rate-limit" src/app.ts 2>/dev/null || grep -q "rateLimit" src/app.ts 2>/dev/null; then
  echo "✅ Rate limiting configured"
else
  echo "⚠️  Rate limiting not found"
fi

echo ""

# Check CSRF protection
echo "🔐 Checking CSRF protection..."
if grep -q "csrf" src/app.ts 2>/dev/null; then
  echo "✅ CSRF protection configured"
else
  echo "⚠️  CSRF protection not found"
fi

echo ""

echo "Security audit complete!"
echo ""
echo "📋 Summary:"
echo "  - Run 'npm audit fix' to resolve dependency vulnerabilities"
echo "  - Review any warnings above"
echo "  - Ensure all environment variables are properly secured"
echo "  - Test security headers: https://securityheaders.com"
