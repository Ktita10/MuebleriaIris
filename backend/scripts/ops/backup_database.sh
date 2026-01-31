#!/bin/bash
#
# Database Backup Script for MuebleriaIris ERP
# Creates timestamped PostgreSQL backups with optional compression
#
# Usage:
#   ./backup_database.sh              # Create backup in default location
#   ./backup_database.sh /path/to/dir # Create backup in specified directory
#

set -e  # Exit on error

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Database connection details
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-muebleria_erp}"

# Backup configuration
BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_backup_${TIMESTAMP}.sql"
BACKUP_FILE_GZ="${BACKUP_FILE}.gz"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}Starting database backup...${NC}"
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "User: $DB_USER"
echo "Backup file: $BACKUP_FILE_GZ"
echo ""

# Check if pg_dump is available
if ! command -v pg_dump &> /dev/null; then
    echo -e "${RED}Error: pg_dump command not found!${NC}"
    echo "Please install PostgreSQL client tools:"
    echo "  Ubuntu/Debian: sudo apt-get install postgresql-client"
    echo "  MacOS: brew install postgresql"
    exit 1
fi

# Create backup using pg_dump
echo -e "${YELLOW}Creating database dump...${NC}"
export PGPASSWORD="$DB_PASSWORD"

if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --no-owner --no-acl --format=plain --verbose > "$BACKUP_FILE" 2>&1; then
    
    echo -e "${GREEN}✓ Database dump created successfully${NC}"
    
    # Get uncompressed size
    UNCOMPRESSED_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "Uncompressed size: $UNCOMPRESSED_SIZE"
    
    # Compress backup
    echo -e "${YELLOW}Compressing backup...${NC}"
    gzip -f "$BACKUP_FILE"
    
    COMPRESSED_SIZE=$(du -h "$BACKUP_FILE_GZ" | cut -f1)
    echo -e "${GREEN}✓ Backup compressed successfully${NC}"
    echo "Compressed size: $COMPRESSED_SIZE"
    echo ""
    
    # Calculate checksum
    CHECKSUM=$(sha256sum "$BACKUP_FILE_GZ" | cut -d' ' -f1)
    echo "SHA256 Checksum: $CHECKSUM"
    echo "$CHECKSUM" > "${BACKUP_FILE_GZ}.sha256"
    
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Backup completed successfully!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo "Backup file: $BACKUP_FILE_GZ"
    echo "Checksum file: ${BACKUP_FILE_GZ}.sha256"
    
    # List recent backups
    echo ""
    echo "Recent backups in $BACKUP_DIR:"
    ls -lht "$BACKUP_DIR"/*.sql.gz 2>/dev/null | head -5 || echo "  (no backups found)"
    
    # Cleanup old backups (keep last 10)
    echo ""
    echo -e "${YELLOW}Cleaning up old backups (keeping last 10)...${NC}"
    cd "$BACKUP_DIR"
    ls -t ${DB_NAME}_backup_*.sql.gz 2>/dev/null | tail -n +11 | xargs -r rm -f
    ls -t ${DB_NAME}_backup_*.sql.gz.sha256 2>/dev/null | tail -n +11 | xargs -r rm -f
    echo -e "${GREEN}✓ Cleanup completed${NC}"
    
else
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}Error: Backup failed!${NC}"
    echo -e "${RED}========================================${NC}"
    rm -f "$BACKUP_FILE"
    exit 1
fi

unset PGPASSWORD
