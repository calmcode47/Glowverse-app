# Performance Monitoring Dashboard

## Sentry Performance

### Key Metrics to Monitor

1. **Transaction Duration**
   - P50, P95, P99 percentiles
   - Trend over time
   - Breakdown by endpoint

2. **Throughput**
   - Requests per minute
   - Peak load handling
   - Capacity planning

3. **Error Rate**
   - By transaction type
   - By user tier
   - Correlation with performance

4. **Database Performance**
   - Query duration
   - Connection pool usage
   - Slow query frequency

5. **Cache Performance**
   - Hit rate
   - Miss rate
   - Latency

## Custom Dashboards

### Business Metrics
- Order completion time
- Product search latency
- AR try-on duration
- Guide load time

### Infrastructure Metrics
- CPU utilization
- Memory usage
- Network I/O
- Disk I/O

## Alerting Rules

### Critical Alerts (PagerDuty)
- P95 > 500ms for 5 minutes
- Error rate > 5% for 2 minutes
- Database connections > 90%

### Warning Alerts (Slack)
- P95 > 300ms for 10 minutes
- Error rate > 2% for 5 minutes
- Cache hit rate < 60%
