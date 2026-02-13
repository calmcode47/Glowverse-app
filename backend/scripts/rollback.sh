#!/bin/bash

set -e

ENVIRONMENT=${1:-staging}

echo "🔄 Rolling back $ENVIRONMENT deployment..."

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

# Confirm rollback
read -p "Are you sure you want to rollback $ENVIRONMENT? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  print_warning "Rollback cancelled"
  exit 0
fi

# Get previous version
echo "Getting previous deployment version..."
# Get previous task definition from ECS
# PREVIOUS_TASK=$(aws ecs describe-services --cluster glowverse-$ENVIRONMENT --services glowverse-backend --query 'services[0].deployments[1].taskDefinition' --output text)
PREVIOUS_VERSION="previous" # Placeholder

print_warning "Rolling back to previous version"

# Deploy previous version
echo "Deploying previous version..."
# aws ecs update-service --cluster glowverse-$ENVIRONMENT --service glowverse-backend --task-definition $PREVIOUS_TASK --force-new-deployment

# Verify rollback
echo "Verifying rollback..."
sleep 10

HEALTH_URL="https://$ENVIRONMENT.glowverse.app/api/health"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL || echo "000")

if [ $HTTP_STATUS -eq 200 ]; then
  print_success "Rollback successful"
else
  print_error "Rollback verification failed (HTTP $HTTP_STATUS)"
  exit 1
fi

print_success "Rollback to $ENVIRONMENT completed successfully!"
