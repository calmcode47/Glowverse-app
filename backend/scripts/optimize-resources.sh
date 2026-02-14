#!/bin/bash

set -e

echo "🔧 Optimizing application resources..."

# Analyze current resource usage
echo ""
echo "📊 Current Resource Usage:"

# Get ECS service metrics
echo "Fetching ECS service deployment info..."
aws ecs describe-services \
  --cluster glowverse-production \
  --services glowverse-backend \
  --query 'services[0].deployments[0]' \
  --output table || echo "⚠️  ECS service not found or AWS CLI not configured"

# Get task CPU/Memory allocation
echo ""
echo "💾 Task Resource Allocation:"
aws ecs describe-task-definition \
  --task-definition glowverse-backend \
  --query 'taskDefinition.containerDefinitions[0].[cpu,memory]' \
  --output table || echo "⚠️  Task definition not found"

# Analyze actual usage from CloudWatch
echo ""
echo "📈 Actual Usage (Last 7 days):"

# CPU utilization
CPU_AVG=$(aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=glowverse-backend \
               Name=ClusterName,Value=glowverse-production \
  --start-time $(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 86400 \
  --statistics Average \
  --query 'Datapoints[0].Average' \
  --output text 2>/dev/null || echo "N/A")

echo "Average CPU: ${CPU_AVG}%"

# Memory utilization
MEM_AVG=$(aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name MemoryUtilization \
  --dimensions Name=ServiceName,Value=glowverse-backend \
               Name=ClusterName,Value=glowverse-production \
  --start-time $(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 86400 \
  --statistics Average \
  --query 'Datapoints[0].Average' \
  --output text 2>/dev/null || echo "N/A")

echo "Average Memory: ${MEM_AVG}%"

# Recommendations
echo ""
echo "💡 Optimization Recommendations:"

if [ "$CPU_AVG" != "N/A" ] && [ "$CPU_AVG" != "None" ]; then
  if (( $(echo "$CPU_AVG < 40" | bc -l 2>/dev/null || echo 0) )); then
    echo "  - CPU is underutilized. Consider reducing CPU allocation."
  elif (( $(echo "$CPU_AVG > 75" | bc -l 2>/dev/null || echo 0) )); then
    echo "  - CPU is highly utilized. Consider increasing CPU allocation."
  else
    echo "  - CPU utilization is optimal."
  fi
else
  echo "  - CPU metrics not available. Ensure CloudWatch is configured."
fi

if [ "$MEM_AVG" != "N/A" ] && [ "$MEM_AVG" != "None" ]; then
  if (( $(echo "$MEM_AVG < 50" | bc -l 2>/dev/null || echo 0) )); then
    echo "  - Memory is underutilized. Consider reducing memory allocation."
  elif (( $(echo "$MEM_AVG > 80" | bc -l 2>/dev/null || echo 0) )); then
    echo "  - Memory is highly utilized. Consider increasing memory allocation."
  else
    echo "  - Memory utilization is optimal."
  fi
else
  echo "  - Memory metrics not available. Ensure CloudWatch is configured."
fi

echo ""
echo "✅ Resource analysis complete"
