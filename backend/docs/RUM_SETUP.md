# Real User Monitoring Setup

## Frontend Integration

Add Sentry Browser SDK to frontend:

```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_FRONTEND_DSN",
  integrations: [
    new Sentry.BrowserTracing({
      tracingOrigins: ["api.glowverse.com"],
      tracePropagationTargets: [/^https:\/\/api\.glowverse\.com/],
    }),
    new Sentry.Replay(),
  ],
  
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

## Track Custom Metrics

```javascript
// Track page load time
Sentry.metrics.distribution(
  'page.load.time',
  performance.now(),
  { unit: 'millisecond' }
);

// Track API response time
const startTime = Date.now();
await fetch('/api/products');
const duration = Date.now() - startTime;

Sentry.metrics.distribution(
  'api.response.time',
  duration,
  { 
    unit: 'millisecond',
    tags: { endpoint: '/products' }
  }
);
```

## Monitor User Experience

- **Core Web Vitals:** LCP, FID, CLS
- **API Response Times:** Track per endpoint
- **Error Rates:** Track by screen/feature
- **User Flows:** Track completion rates
