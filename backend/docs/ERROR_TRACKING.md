# Error Tracking with Sentry

## Overview
Sentry is integrated for real-time error tracking, performance monitoring, and release tracking across the Glowverse backend.

## Configuration

### Environment Variables
```env
# Required for production
SENTRY_DSN=https://your-key@sentry.io/project-id

# Optional
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

### Initialization
Sentry is initialized in `src/config/sentry.ts` with:
- **Environment tracking**: Errors tagged with `development`, `staging`, or `production`
- **Release tracking**: Automatically tagged with package version
- **Performance monitoring**: 10% sample rate in production, 100% in development
- **Integrations**: Express, Prisma, HTTP, Console

## Error Levels

| Level | Description | Examples |
|-------|-------------|----------|
| **Error** | 5xx errors, unhandled exceptions | Database connection failures, uncaught errors |
| **Warning** | Business logic failures | Payment failures, AR try-on errors |
| **Info** | Business events | Order creation, user registration |

## Automatic Error Capture

All errors are automatically captured by Sentry middleware:
- **Request context**: URL, method, headers, correlation ID
- **User context**: User ID, email, name (if authenticated)
- **Stack traces**: Full error stack for debugging
- **Breadcrumbs**: Recent events leading to the error

## Business Event Tracking

Use the `tracking` utility for business-critical events:

```typescript
import { tracking } from '../utils/tracking';

// Order events
tracking.trackOrderCreated(orderId, userId, amount);
tracking.trackPaymentFailed(orderId, userId, error);

// AR events
tracking.trackARTryonSuccess(userId, productId);
tracking.trackARTryonFailed(userId, productId, error);

// User events
tracking.trackUserRegistered(userId, email);

// Critical errors
tracking.trackCriticalError('payment-processing', error, { orderId, amount });
```

## Correlation IDs

Every error includes a correlation ID for tracing requests across services:
- Automatically added to Sentry context
- Visible in error details under "correlationId"
- Use to correlate errors with application logs

## Release Tracking

Errors are tagged with release version from `package.json`:
- Track which version introduced bugs
- Monitor error rates across releases
- Identify regressions quickly

## Performance Monitoring

Sentry tracks:
- **HTTP requests**: Response times, status codes
- **Database queries**: Prisma query performance
- **Custom transactions**: Business-critical operations

Sample rate:
- Production: 10% (to reduce overhead)
- Development: 100% (full visibility)

## Alert Configuration

### Recommended Alerts

1. **High Error Rate**
   - Condition: Error rate > 5% over 5 minutes
   - Severity: Critical
   - Action: Page on-call engineer

2. **New Error Type**
   - Condition: First occurrence of new error
   - Severity: Warning
   - Action: Slack notification

3. **Payment Failures**
   - Condition: "Payment Failed" message
   - Severity: High
   - Action: Email finance team

4. **AR Service Degradation**
   - Condition: AR try-on failure rate > 10%
   - Severity: Medium
   - Action: Slack notification

### Setting Up Alerts

1. Go to Sentry dashboard → Alerts
2. Create new alert rule
3. Set conditions (error rate, specific errors, etc.)
4. Configure actions (email, Slack, PagerDuty)
5. Test alert before enabling

## Integration with Incident Response

When Sentry alert fires:
1. **Check Sentry dashboard** for error details
2. **Find correlation ID** in error context
3. **Search application logs** using correlation ID
4. **Follow incident response runbook** (see `docs/runbooks/INCIDENT_RESPONSE.md`)

## Filtering Errors

Errors are filtered before sending to Sentry:
- Development: Only `error` level events sent
- Production: All levels sent
- 4xx errors: Not sent (client errors)
- 5xx errors: Always sent (server errors)

## User Privacy

Sentry respects user privacy:
- Passwords never logged
- Sensitive headers filtered
- PII sanitized before sending
- User context only includes: ID, email, name

## Troubleshooting

### Sentry Not Capturing Errors
1. Check `SENTRY_DSN` is set
2. Verify initialization in startup logs: "✓ Sentry initialized successfully"
3. Test with `/test-sentry` endpoint (development only)

### Too Many Events
1. Adjust `tracesSampleRate` in `src/config/sentry.ts`
2. Add filters in `beforeSend` hook
3. Review alert thresholds

### Missing Context
1. Ensure `sentryContextMiddleware` is registered
2. Check correlation ID middleware runs before Sentry
3. Verify user authentication middleware sets `req.user`

## Best Practices

1. **Use tracking utilities** for business events
2. **Add breadcrumbs** before critical operations
3. **Set user context** after authentication
4. **Tag errors** with relevant metadata
5. **Review errors daily** to catch trends
6. **Update alerts** as application evolves

## Resources

- [Sentry Dashboard](https://sentry.io)
- [Sentry Node.js Docs](https://docs.sentry.io/platforms/node/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Alert Configuration](https://docs.sentry.io/product/alerts/)
