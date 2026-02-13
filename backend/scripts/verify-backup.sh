#!/bin/bash

set -e

BACKUP_FILE=${1}

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: ./verify-backup.sh <backup-file>"
  echo "Example: ./verify-backup.sh production-full-20260213-020000.sql.gz.gpg"
  exit 1
fi

echo "🔍 Verifying backup: $BACKUP_FILE"

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

VERIFY_DIR="/tmp/verify"
mkdir -p $VERIFY_DIR

# Download backup
echo "Downloading backup from S3..."
aws s3 cp s3://glowverse-backups-production/$BACKUP_FILE $VERIFY_DIR/$BACKUP_FILE

print_success "Backup downloaded"

# Decrypt
echo "Decrypting backup..."
gpg --decrypt \
  --passphrase "$BACKUP_ENCRYPTION_KEY" \
  --batch \
  --yes \
  --output $VERIFY_DIR/${BACKUP_FILE%.gpg} \
  $VERIFY_DIR/$BACKUP_FILE

rm $VERIFY_DIR/$BACKUP_FILE
DECRYPTED_FILE=${BACKUP_FILE%.gpg}

print_success "Backup decrypted"

# Decompress
echo "Decompressing backup..."
gunzip $VERIFY_DIR/$DECRYPTED_FILE
SQL_FILE=${DECRYPTED_FILE%.gz}

print_success "Backup decompressed"

# Verify SQL dump structure
echo "Verifying backup structure..."
pg_restore --list $VERIFY_DIR/$SQL_FILE > $VERIFY_DIR/backup_structure.txt

print_success "Backup structure extracted"

# Check for critical tables
echo "Checking for critical tables..."
CRITICAL_TABLES=("users" "products" "orders" "carts" "guides" "promotions" "fitness_logs")

ALL_FOUND=true

for table in "${CRITICAL_TABLES[@]}"; do
  if grep -q "TABLE DATA.*$table" $VERIFY_DIR/backup_structure.txt; then
    print_success "Table $table found in backup"
  else
    print_error "Table $table missing from backup!"
    ALL_FOUND=false
  fi
done

# Check backup file size
BACKUP_SIZE=$(stat -f%z $VERIFY_DIR/$SQL_FILE 2>/dev/null || stat -c%s $VERIFY_DIR/$SQL_FILE)
BACKUP_SIZE_MB=$(echo "scale=2; $BACKUP_SIZE / 1024 / 1024" | bc)

echo "Backup size: ${BACKUP_SIZE_MB}MB"

# Validate minimum size (should be at least 1MB)
if [ $(echo "$BACKUP_SIZE_MB < 1" | bc) -eq 1 ]; then
  print_warning "Backup suspiciously small: ${BACKUP_SIZE_MB}MB"
else
  print_success "Backup size acceptable: ${BACKUP_SIZE_MB}MB"
fi

# Count tables in backup
TABLE_COUNT=$(grep -c "TABLE DATA" $VERIFY_DIR/backup_structure.txt)
print_success "Total tables in backup: $TABLE_COUNT"

# Clean up
rm -rf $VERIFY_DIR

if [ "$ALL_FOUND" = true ]; then
  print_success "✅ Backup verification successful!"
  exit 0
else
  print_error "❌ Backup verification failed - missing critical tables"
  exit 1
fi
