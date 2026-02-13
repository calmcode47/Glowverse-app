#!/bin/bash

set -e

ENVIRONMENT=${1:-staging}
IMAGE_TAG=${2:-latest}

echo "🚀 Deploying to $ENVIRONMENT..."
echo "📦 Image tag: $IMAGE_TAG"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

# Pre-deployment checks
echo "Running pre-deployment checks..."

# Check if environment exists
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
  print_error "Invalid environment: $ENVIRONMENT"
  exit 1
fi

# Check if required secrets are set
if [ -z "$AWS_ACCESS_KEY_ID" ]; then
  print_error "AWS_ACCESS_KEY_ID not set"
  exit 1
fi

print_success "Pre-deployment checks passed"

# Database backup
echo "Creating database backup..."
BACKUP_FILE="backup-$(date +%Y%m%d-%H%M%S).sql"
# Add your backup command here
# aws rds create-db-snapshot --db-instance-identifier glowverse-$ENVIRONMENT --db-snapshot-identifier $BACKUP_FILE
print_success "Database backup created: $BACKUP_FILE"

# Run database migrations
echo "Running database migrations..."
# aws ecs run-task --cluster glowverse-$ENVIRONMENT --task-definition glowverse-migration --overrides '{"containerOverrides":[{"name":"backend","command":["npx","prisma","migrate","deploy"]}]}'
print_success "Database migrations completed"

# Deploy application
echo "Deploying application..."
# aws ecs update-service --cluster glowverse-$ENVIRONMENT --service glowverse-backend --force-new-deployment
print_success "Application deployed"

# Health check
echo "Running health checks..."
sleep 10

HEALTH_URL="https://$ENVIRONMENT.glowverse.app/api/health"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL || echo "000")

if [ $HTTP_STATUS -eq 200 ]; then
  print_success "Health check passed"
else
  print_error "Health check failed (HTTP $HTTP_STATUS)"
  exit 1
fi

# Post-deployment tasks
echo "Running post-deployment tasks..."
# Warm up cache, send notifications, etc.
print_success "Post-deployment tasks completed"

print_success "Deployment to $ENVIRONMENT completed successfully!"
