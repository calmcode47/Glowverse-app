# Rate Limiting & DDoS Protection

## User Tier Limits

| Tier | Standard (15min) | Burst (1min) | Expensive (1hr) | Cost |
|------|------------------|--------------|-----------------|------|
| Free | 100 | 20 | 10 | $0/mo |
| Premium | 1,000 | 100 | 100 | $29/mo |
| Enterprise | 10,000 | 1,000 | 1,000 | Custom |

## Endpoint Costs

| Endpoint Category | Cost Multiplier |
|-------------------|----------------|
| Read Operations | 1x |
| Write Operations | 2x |
| Search Operations | 3x |
| AR/AI Operations | 5x |
| File Uploads | 10x |

## DDoS Protection

### Automatic Blocking

IPs are automatically blocked for:
- 100+ requests in 10 seconds (5 minute block)
- 5+ failed auth in 60 seconds (15 minute block)
- 20+ invalid requests in 60 seconds (10 minute block)

### IP Reputation System

- New IPs start at Neutral (50)
- Good behavior increases score (max 100)
- Bad behavior decreases score (min 0)
- IPs below 25 are blocked
- Scores decay after 7 days

## Rate Limit Headers

```
X-RateLimit-Tier: Premium
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1645123456
```

## Error Responses

### 429 Too Many Requests

```json
{
  "success": false,
  "error": {
    "message": "Rate limit exceeded for your tier",
    "statusCode": 429,
    "retryAfter": 300,
    "tier": "Free",
    "limit": 100,
    "upgrade": "/pricing"
  }
}
```

## Admin Tools

### View Blocked IPs
```
GET /api/v1/admin/rate-limits/blocked-ips
```

### Unblock IP
```
DELETE /api/v1/admin/rate-limits/blocked-ips/:ip
```

### Rate Limit Stats
```
GET /api/v1/admin/rate-limits/stats
```
