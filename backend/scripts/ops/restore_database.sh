#!/bin/bash
#
# Database Restore Script for MuebleriaIris ERP
# Restores a PostgreSQL backup from a compressed SQL file
#
# Usage:
#   ./restore_database.sh <backup_file.sql.gz>
#
# Example:
#   ./restore_database.sh backups/muebleria_erp_backup_20260123_215500.sql.gz
#

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if backup file is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: No backup file specified!${NC}"
    echo ""
    echo "Usage: $0 <backup_file.sql.gz>"
    echo ""
    echo "Available backups:"
    ls -lht backups/*.sql.gz 2>/dev/null | head -10 || echo "  (no backups found)"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

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

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Database Restore${NC}"
echo -e "${YELLOW}========================================${NC}"
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "User: $DB_USER"
echo "Backup file: $BACKUP_FILE"
echo ""

# Verify checksum if exists
CHECKSUM_FILE="${BACKUP_FILE}.sha256"
if [ -f "$CHECKSUM_FILE" ]; then
    echo -e "${YELLOW}Verifying backup integrity...${NC}"
    EXPECTED_CHECKSUM=$(cat "$CHECKSUM_FILE")
    ACTUAL_CHECKSUM=$(sha256sum "$BACKUP_FILE" | cut -d' ' -f1)
    
    if [ "$EXPECTED_CHECKSUM" = "$ACTUAL_CHECKSUM" ]; then
        echo -e "${GREEN}✓ Checksum verification passed${NC}"
    else
        echo -e "${RED}✗ Checksum verification failed!${NC}"
        echo "Expected: $EXPECTED_CHECKSUM"
        echo "Actual:   $ACTUAL_CHECKSUM"
        echo ""
        read -p "Continue anyway? (yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            echo "Restore cancelled."
            exit 1
        fi
    fi
else
    echo -e "${YELLOW}⚠ No checksum file found, skipping verification${NC}"
fi

# Confirmation prompt
echo ""
echo -e "${RED}WARNING: This will DROP and RECREATE the database!${NC}"
echo -e "${RED}All current data will be lost!${NC}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: psql command not found!${NC}"
    echo "Please install PostgreSQL client tools:"
    echo "  Ubuntu/Debian: sudo apt-get install postgresql-client"
    echo "  MacOS: brew install postgresql"
    exit 1
fi

export PGPASSWORD="$DB_PASSWORD"

# Create backup of current database before restoring
echo ""
echo -e "${YELLOW}Creating safety backup of current database...${NC}"
SAFETY_BACKUP="./backups/${DB_NAME}_pre_restore_$(date +%Y%m%d_%H%M%S).sql.gz"
mkdir -p backups
if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --no-owner --no-acl --format=plain 2>/dev/null | gzip > "$SAFETY_BACKUP"; then
    echo -e "${GREEN}✓ Safety backup created: $SAFETY_BACKUP${NC}"
else
    echo -e "${YELLOW}⚠ Could not create safety backup (database may not exist yet)${NC}"
fi

# Disconnect all users from the database
echo ""
echo -e "${YELLOW}Disconnecting users from database...${NC}"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c \
    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();" \
    > /dev/null 2>&1 || true

# Drop and recreate database
echo -e "${YELLOW}Dropping database...${NC}"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" > /dev/null

echo -e "${YELLOW}Creating database...${NC}"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME;" > /dev/null

# Restore backup
echo -e "${YELLOW}Restoring backup...${NC}"
echo "This may take a few minutes depending on the database size..."
echo ""

if gunzip -c "$BACKUP_FILE" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Database restored successfully!${NC}"
    echo -e "${GREEN}========================================${NC}"
    
    # Show database statistics
    echo ""
    echo "Database statistics:"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c \
        "SELECT schemaname, tablename, n_live_tup as rows 
         FROM pg_stat_user_tables 
         ORDER BY n_live_tup DESC 
         LIMIT 10;" 2>/dev/null || true
    
else
    echo ""
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}Error: Restore failed!${NC}"
    echo -e "${RED}========================================${NC}"
    echo ""
    echo "You can restore from the safety backup:"
    echo "  $SAFETY_BACKUP"
    exit 1
fi

unset PGPASSWORD
