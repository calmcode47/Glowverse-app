# Auto-Scaling Configuration

## Overview

This document describes the auto-scaling configuration for the Glowverse backend application, including scaling policies, resource allocation, and cost optimization strategies.

## Scaling Policies

### CPU-Based Scaling
- **Target:** 70% CPU utilization
- **Scale out:** When CPU > 70% for 1 minute
- **Scale in:** When CPU < 70% for 5 minutes
- **Min instances:** 2
- **Max instances:** 20

### Memory-Based Scaling
- **Target:** 80% memory utilization
- **Scale out:** When memory > 80% for 1 minute
- **Scale in:** When memory < 80% for 5 minutes

### Request-Based Scaling
- **Target:** 1000 requests per instance
- **Scale out:** When > 1000 req/instance for 1 minute
- **Scale in:** When < 1000 req/instance for 5 minutes

## Scheduled Scaling

### Peak Hours (8 AM - 8 PM UTC)
- **Min instances:** 5
- **Max instances:** 20
- **Trigger:** `cron(0 8 * * ? *)` - 8 AM UTC daily

### Off-Peak (8 PM - 8 AM UTC)
- **Min instances:** 2
- **Max instances:** 10
- **Trigger:** `cron(0 0 * * ? *)` - Midnight UTC daily

## Scaling Cooldown Periods

- **Scale-out cooldown:** 60 seconds
- **Scale-in cooldown:** 300 seconds (5 minutes)

This prevents rapid scaling oscillations and allows metrics to stabilize before making additional scaling decisions.

## Resource Allocation per Instance

| Environment | CPU (vCPU) | Memory (GB) | Cost/hour | Monthly (2 instances) |
|-------------|------------|-------------|-----------|----------------------|
| Production  | 2          | 4           | $0.12     | ~$175                |
| Staging     | 1          | 2           | $0.06     | ~$87                 |
| Development | 0.5        | 1           | $0.03     | ~$44                 |

## Database Connection Pool

Connection pool sizes are optimized per environment:

- **Production:** 20 connections
- **Staging:** 10 connections
- **Development:** 5 connections

The pool is monitored for exhaustion, with alerts triggered when queries are waiting for connections.

## Monitoring Scaling Events

### CloudWatch Alarms

Configure the following alarms:

- `HighCPU` - CPU > 80% for 5 minutes
- `HighMemory` - Memory > 90% for 5 minutes
- `ScaleOutEvent` - New instances launched
- `ScaleInEvent` - Instances terminated

### Viewing Scaling Activities

```bash
# ECS Scaling Activities
aws application-autoscaling describe-scaling-activities \
  --service-namespace ecs \
  --resource-id "service/glowverse-production/glowverse-backend" \
  --max-results 20

# Kubernetes Scaling Events
kubectl get hpa glowverse-backend-hpa -n production
kubectl describe hpa glowverse-backend-hpa -n production
```

## Cost Optimization

### Current Monthly Cost Estimate

| Scenario | Instances | Monthly Cost |
|----------|-----------|--------------|
| Baseline (2 instances) | 2 | ~$175 |
| Average (5 instances) | 5 | ~$438 |
| Peak (20 instances) | 20 | ~$1,752 |

### Optimization Strategies

1. **Reserved Instances for Baseline**
   - Purchase 1-year Reserved Instances for 2 baseline instances
   - Savings: ~40% ($70/month)

2. **Spot Instances for Burst Capacity**
   - Use Spot instances for instances beyond baseline
   - Savings: ~70% on burst capacity
   - Risk: Potential interruption (mitigated by multiple AZs)

3. **Aggressive Scale-In During Off-Peak**
   - Reduce to 2 instances during off-peak hours
   - Savings: ~$150/month

4. **Right-Size Instances**
   - Monitor actual CPU/Memory usage
   - Adjust instance types based on real utilization
   - Use `scripts/optimize-resources.sh` for analysis

### Total Potential Savings

- Reserved Instances: ~$50/month
- Spot Instances: ~$100/month
- Off-Peak Scaling: ~$150/month
- **Total: ~$300/month (45% reduction)**

## Testing Auto-Scaling

### Manual Testing

Use the provided test script:

```bash
./scripts/test-autoscaling.sh
```

This script:
1. Records current instance count
2. Generates load to trigger scale-out
3. Waits and verifies scale-out occurred
4. Waits for cooldown period
5. Verifies scale-in behavior

### Load Testing Integration

Auto-scaling is tested as part of load testing:

```bash
# Run load test that triggers scaling
npm run test:load

# Monitor scaling in real-time
watch -n 5 'aws ecs describe-services \
  --cluster glowverse-production \
  --services glowverse-backend \
  --query "services[0].desiredCount"'
```

## Deployment

### ECS (Terraform)

```bash
cd infrastructure
terraform init
terraform plan
terraform apply
```

### Kubernetes

```bash
kubectl apply -f infrastructure/k8s-hpa.yaml
kubectl get hpa -n production
```

## Troubleshooting

### Scale-Out Not Triggering

1. Check CloudWatch metrics are being published
2. Verify scaling policies are active
3. Check if already at max capacity
4. Review cooldown periods

### Scale-In Too Aggressive

1. Increase scale-in cooldown period
2. Adjust target utilization thresholds
3. Review scheduled scaling conflicts

### Connection Pool Exhaustion

1. Check database connection pool size
2. Review slow queries (may hold connections longer)
3. Consider increasing pool size or instance count

## Best Practices

1. **Monitor Continuously:** Set up CloudWatch dashboards for scaling metrics
2. **Test Regularly:** Run scaling tests monthly to verify behavior
3. **Review Costs:** Generate cost reports weekly
4. **Adjust Thresholds:** Fine-tune based on actual traffic patterns
5. **Document Changes:** Keep this document updated with configuration changes
