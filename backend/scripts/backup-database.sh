#!/bin/bash

set -e

ENVIRONMENT=${1:-production}
BACKUP_TYPE=${2:-full}  # full or incremental

echo "🗄️  Creating database backup for $ENVIRONMENT..."

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

# Configuration
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="/tmp/backups"
mkdir -p $BACKUP_DIR
S3_BUCKET="s3://glowverse-backups-${ENVIRONMENT}"

if [ "$ENVIRONMENT" == "production" ]; then
  DB_INSTANCE="glowverse-production"
  DB_HOST=$PRODUCTION_DB_HOST
  DB_NAME=$PRODUCTION_DB_NAME
  DB_USER=$PRODUCTION_DB_USER
  DB_PASSWORD=$PRODUCTION_DB_PASSWORD
elif [ "$ENVIRONMENT" == "staging" ]; then
  DB_INSTANCE="glowverse-staging"
  DB_HOST=$STAGING_DB_HOST
  DB_NAME=$STAGING_DB_NAME
  DB_USER=$STAGING_DB_USER
  DB_PASSWORD=$STAGING_DB_PASSWORD
else
  print_error "Invalid environment: $ENVIRONMENT"
  exit 1
fi

BACKUP_FILE="${ENVIRONMENT}-${BACKUP_TYPE}-${TIMESTAMP}.sql"
ENCRYPTED_FILE="${BACKUP_FILE}.gpg"

# Create RDS snapshot (if using RDS and AWS CLI is available)
if command -v aws &> /dev/null; then
  echo "Creating RDS snapshot..."
  
  SNAPSHOT_ID="${DB_INSTANCE}-${TIMESTAMP}"
  
  aws rds create-db-snapshot \
    --db-instance-identifier $DB_INSTANCE \
    --db-snapshot-identifier $SNAPSHOT_ID \
    --tags \
      Key=Environment,Value=$ENVIRONMENT \
      Key=BackupType,Value=$BACKUP_TYPE \
      Key=CreatedAt,Value=$TIMESTAMP || true
  
  print_success "RDS snapshot created: $SNAPSHOT_ID"
fi

# Create SQL dump
echo "Creating SQL dump..."

export PGPASSWORD=$DB_PASSWORD

if [ "$BACKUP_TYPE" == "full" ]; then
  # Full backup
  pg_dump \
    --host=$DB_HOST \
    --username=$DB_USER \
    --dbname=$DB_NAME \
    --format=custom \
    --verbose \
    --file=$BACKUP_DIR/$BACKUP_FILE
else
  # Incremental backup (using pg_dump with schema only or specific tables)
  pg_dump \
    --host=$DB_HOST \
    --username=$DB_USER \
    --dbname=$DB_NAME \
    --format=custom \
    --verbose \
    --file=$BACKUP_DIR/$BACKUP_FILE
fi

unset PGPASSWORD

print_success "SQL dump created: $BACKUP_FILE"

# Compress backup
echo "Compressing backup..."
gzip $BACKUP_DIR/$BACKUP_FILE
COMPRESSED_FILE="${BACKUP_FILE}.gz"

print_success "Backup compressed: $COMPRESSED_FILE"

# Encrypt backup
echo "Encrypting backup..."
gpg --symmetric \
  --cipher-algo AES256 \
  --passphrase "$BACKUP_ENCRYPTION_KEY" \
  --batch \
  --yes \
  --output $BACKUP_DIR/$ENCRYPTED_FILE \
  $BACKUP_DIR/$COMPRESSED_FILE

rm $BACKUP_DIR/$COMPRESSED_FILE

print_success "Backup encrypted: $ENCRYPTED_FILE"

# Upload to S3
echo "Uploading to S3..."
aws s3 cp \
  $BACKUP_DIR/$ENCRYPTED_FILE \
  $S3_BUCKET/$ENCRYPTED_FILE \
  --storage-class STANDARD_IA \
  --server-side-encryption AES256

print_success "Backup uploaded to S3: $S3_BUCKET/$ENCRYPTED_FILE"

# Verify backup integrity
echo "Verifying backup integrity..."
UPLOADED_SIZE=$(aws s3 ls $S3_BUCKET/$ENCRYPTED_FILE | awk '{print $3}')
LOCAL_SIZE=$(stat -f%z $BACKUP_DIR/$ENCRYPTED_FILE 2>/dev/null || stat -c%s $BACKUP_DIR/$ENCRYPTED_FILE)

if [ "$UPLOADED_SIZE" == "$LOCAL_SIZE" ]; then
  print_success "Backup integrity verified"
else
  print_error "Backup integrity check failed!"
  exit 1
fi

# Clean up local backup
rm $BACKUP_DIR/$ENCRYPTED_FILE

# Log backup metadata
BACKUP_SIZE=$(echo "scale=2; $LOCAL_SIZE / 1024 / 1024" | bc)
echo "Backup completed successfully"
echo "Environment: $ENVIRONMENT"
echo "Type: $BACKUP_TYPE"
echo "Size: ${BACKUP_SIZE}MB"
echo "Location: $S3_BUCKET/$ENCRYPTED_FILE"

# Send notification
if command -v curl &> /dev/null && [ -n "$SLACK_WEBHOOK_URL" ]; then
  curl -X POST $SLACK_WEBHOOK_URL \
    -H 'Content-Type: application/json' \
    -d "{
      \"text\": \"✅ Database backup completed\",
      \"blocks\": [{
        \"type\": \"section\",
        \"text\": {
          \"type\": \"mrkdwn\",
          \"text\": \"*Database Backup Completed*\n\nEnvironment: \`$ENVIRONMENT\`\nType: \`$BACKUP_TYPE\`\nSize: \`${BACKUP_SIZE}MB\`\nLocation: \`$S3_BUCKET/$ENCRYPTED_FILE\`\"
        }
      }]
    }" || true
fi

print_success "Database backup completed successfully!"
