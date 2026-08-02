#!/bin/bash
set -e

BACKUP_DIR="/app/data/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "Starting database backup..."
pg_dump -U "${POSTGRES_USER:-tamer}" -d "${POSTGRES_DB:-tamer_studio}" | gzip > "$BACKUP_FILE"
echo "Backup created: $BACKUP_FILE"

find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +7 -delete
echo "Old backups cleaned up."
