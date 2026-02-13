#!/bin/bash

set -e

ENVIRONMENT=${1}
BACKUP_FILE=${2}

if [ -z "$ENVIRONMENT" ] || [ -z "$BACKUP_FILE" ]; then
  echo "Usage: ./restore-database.sh <environment> <backup-file>"
  echo "Example: ./restore-database.sh staging production-full-20260213-120000.sql.gz.gpg"
  exit 1
fi

echo "🔄 Restoring database for $ENVIRONMENT from $BACKUP_FILE..."

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

# Safety check for production
if [ "$ENVIRONMENT" == "production" ]; then
  print_warning "⚠️  WARNING: You are about to restore the PRODUCTION database!"
  echo "This will OVERWRITE all current data in the production database."
  read -p "Type 'RESTORE PRODUCTION' to continue: " CONFIRM
  
  if [ "$CONFIRM" != "RESTORE PRODUCTION" ]; then
    print_warning "Restore cancelled"
    exit 0
  fi
fi

# Configuration
RESTORE_DIR="/tmp/restore"
mkdir -p $RESTORE_DIR
S3_BUCKET="s3://glowverse-backups-production"

if [ "$ENVIRONMENT" == "production" ]; then
  DB_HOST=$PRODUCTION_DB_HOST
  DB_NAME=$PRODUCTION_DB_NAME
  DB_USER=$PRODUCTION_DB_USER
  DB_PASSWORD=$PRODUCTION_DB_PASSWORD
elif [ "$ENVIRONMENT" == "staging" ]; then
  DB_HOST=$STAGING_DB_HOST
  DB_NAME=$STAGING_DB_NAME
  DB_USER=$STAGING_DB_USER
  DB_PASSWORD=$STAGING_DB_PASSWORD
else
  print_error "Invalid environment: $ENVIRONMENT"
  exit 1
fi

# Download backup from S3
echo "Downloading backup from S3..."
aws s3 cp \
  $S3_BUCKET/$BACKUP_FILE \
  $RESTORE_DIR/$BACKUP_FILE

print_success "Backup downloaded: $BACKUP_FILE"

# Decrypt backup
echo "Decrypting backup..."
gpg --decrypt \
  --passphrase "$BACKUP_ENCRYPTION_KEY" \
  --batch \
  --yes \
  --output $RESTORE_DIR/${BACKUP_FILE%.gpg} \
  $RESTORE_DIR/$BACKUP_FILE

rm $RESTORE_DIR/$BACKUP_FILE
DECRYPTED_FILE=${BACKUP_FILE%.gpg}

print_success "Backup decrypted: $DECRYPTED_FILE"

# Decompress backup
echo "Decompressing backup..."
gunzip $RESTORE_DIR/$DECRYPTED_FILE
SQL_FILE=${DECRYPTED_FILE%.gz}

print_success "Backup decompressed: $SQL_FILE"

# Create pre-restore snapshot (production only)
if [ "$ENVIRONMENT" == "production" ] && command -v aws &> /dev/null; then
  echo "Creating pre-restore snapshot..."
  SNAPSHOT_ID="pre-restore-$(date +%Y%m%d-%H%M%S)"
  
  aws rds create-db-snapshot \
    --db-instance-identifier glowverse-production \
    --db-snapshot-identifier $SNAPSHOT_ID \
    --tags Key=Type,Value=pre-restore || true
  
  print_success "Pre-restore snapshot created: $SNAPSHOT_ID"
fi

# Restore database
echo "Restoring database..."
print_warning "This will overwrite the current database!"

export PGPASSWORD=$DB_PASSWORD

# Drop existing connections
psql \
  --host=$DB_HOST \
  --username=$DB_USER \
  --dbname=postgres \
  -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$DB_NAME' AND pid <> pg_backend_pid();" || true

# Restore from dump
pg_restore \
  --host=$DB_HOST \
  --username=$DB_USER \
  --dbname=$DB_NAME \
  --clean \
  --if-exists \
  --verbose \
  $RESTORE_DIR/$SQL_FILE

unset PGPASSWORD

print_success "Database restored successfully"

# Run data validation
echo "Running data validation..."

export PGPASSWORD=$DB_PASSWORD

# Check table counts
TABLE_COUNT=$(psql \
  --host=$DB_HOST \
  --username=$DB_USER \
  --dbname=$DB_NAME \
  --tuples-only \
  --command="SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" | xargs)

print_success "Tables restored: $TABLE_COUNT"

# Check critical data
USER_COUNT=$(psql \
  --host=$DB_HOST \
  --username=$DB_USER \
  --dbname=$DB_NAME \
  --tuples-only \
  --command="SELECT COUNT(*) FROM users;" | xargs)

print_success "Users: $USER_COUNT"

PRODUCT_COUNT=$(psql \
  --host=$DB_HOST \
  --username=$DB_USER \
  --dbname=$DB_NAME \
  --tuples-only \
  --command="SELECT COUNT(*) FROM products;" | xargs)

print_success "Products: $PRODUCT_COUNT"

unset PGPASSWORD

# Clean up
rm $RESTORE_DIR/$SQL_FILE

# Send notification
if command -v curl &> /dev/null && [ -n "$SLACK_WEBHOOK_URL" ]; then
  curl -X POST $SLACK_WEBHOOK_URL \
    -H 'Content-Type: application/json' \
    -d "{
      \"text\": \"✅ Database restore completed\",
      \"blocks\": [{
        \"type\": \"section\",
        \"text\": {
          \"type\": \"mrkdwn\",
          \"text\": \"*Database Restore Completed*\n\nEnvironment: \`$ENVIRONMENT\`\nBackup: \`$BACKUP_FILE\`\nTables: \`$TABLE_COUNT\`\nUsers: \`$USER_COUNT\`\nProducts: \`$PRODUCT_COUNT\`\"
        }
      }]
    }" || true
fi

print_success "Database restore completed successfully!"
