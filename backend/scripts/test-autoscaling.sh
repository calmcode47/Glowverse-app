#!/bin/bash

set -e

echo "🧪 Testing auto-scaling behavior..."
echo ""

# Configuration
CLUSTER_NAME="${ECS_CLUSTER:-glowverse-production}"
SERVICE_NAME="${ECS_SERVICE:-glowverse-backend}"
TEST_URL="${TEST_URL:-https://api.glowverse.com}"

# Check if running in AWS environment
if ! command -v aws &> /dev/null; then
    echo "⚠️  AWS CLI not installed. This script requires AWS CLI."
    echo "Install: https://aws.amazon.com/cli/"
    exit 1
fi

# Get current instance count
echo "📊 Checking current service state..."
CURRENT=$(aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --query 'services[0].desiredCount' \
  --output text 2>/dev/null || echo "N/A")

if [ "$CURRENT" = "N/A" ]; then
    echo "⚠️  ECS service not found: $CLUSTER_NAME/$SERVICE_NAME"
    echo ""
    echo "This script requires:"
    echo "  - AWS ECS cluster deployed"
    echo "  - Auto-scaling policies configured"
    echo "  - AWS credentials configured"
    echo ""
    echo "For local testing, set environment variables:"
    echo "  export ECS_CLUSTER=your-cluster-name"
    echo "  export ECS_SERVICE=your-service-name"
    echo "  export TEST_URL=https://your-api-url.com"
    exit 1
fi

echo "Current instances: $CURRENT"
echo ""

# Check if artillery is installed
if ! command -v artillery &> /dev/null; then
    echo "⚠️  Artillery not installed. Installing..."
    npm install -g artillery
fi

# Simulate load to trigger scale-out
echo "🔥 Generating load to trigger scale-out..."
echo "Target: $TEST_URL/api/v1/health"
echo "Load: 100 virtual users, 1000 requests each"
echo ""

artillery quick \
  --count 100 \
  --num 1000 \
  $TEST_URL/api/v1/health \
  2>/dev/null || {
    echo "⚠️  Load generation failed. Using alternative method..."
    
    # Fallback: Use curl in parallel
    echo "Running 500 concurrent requests..."
    for i in {1..500}; do
      curl -s $TEST_URL/api/v1/health > /dev/null &
    done
    wait
  }

# Wait for scaling
echo ""
echo "⏳ Waiting for scale-out (60 seconds)..."
sleep 60

# Check new count
NEW_COUNT=$(aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --query 'services[0].desiredCount' \
  --output text 2>/dev/null || echo "N/A")

echo "New instance count: $NEW_COUNT"
echo ""

if [ "$NEW_COUNT" != "N/A" ] && [ $NEW_COUNT -gt $CURRENT ]; then
    echo "✅ Scale-out triggered successfully"
    echo "   Before: $CURRENT instances"
    echo "   After:  $NEW_COUNT instances"
    echo "   Scaled: +$(($NEW_COUNT - $CURRENT)) instances"
else
    echo "⚠️  Scale-out did not trigger"
    echo "   This could be due to:"
    echo "   - Load not high enough to trigger scaling policy"
    echo "   - Already at maximum capacity"
    echo "   - Cooldown period active"
fi

# Wait for cool-down
echo ""
echo "⏳ Waiting for scale-in cooldown (5 minutes)..."
echo "   (You can Ctrl+C to skip this wait)"
sleep 300

# Check if scaled back in
FINAL_COUNT=$(aws ecs describe-services \
  --cluster $CLUSTER_NAME \
  --services $SERVICE_NAME \
  --query 'services[0].desiredCount' \
  --output text 2>/dev/null || echo "N/A")

echo ""
echo "Final instance count: $FINAL_COUNT"

if [ "$FINAL_COUNT" != "N/A" ] && [ $FINAL_COUNT -le $CURRENT ]; then
    echo "✅ Scale-in completed successfully"
    echo "   Peak:  $NEW_COUNT instances"
    echo "   Final: $FINAL_COUNT instances"
else
    echo "⚠️  Scale-in pending or not triggered"
    echo "   Current: $FINAL_COUNT instances"
    echo "   Scale-in may take longer depending on cooldown period"
fi

# Show recent scaling activities
echo ""
echo "📋 Recent Scaling Activities:"
aws application-autoscaling describe-scaling-activities \
  --service-namespace ecs \
  --resource-id "service/$CLUSTER_NAME/$SERVICE_NAME" \
  --max-results 5 \
  --query 'ScalingActivities[*].[ActivityId,Description,StartTime,StatusCode]' \
  --output table 2>/dev/null || echo "⚠️  Scaling activities not available"

echo ""
echo "✅ Auto-scaling test complete"
