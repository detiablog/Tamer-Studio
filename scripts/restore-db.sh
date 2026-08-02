#!/bin/bash
set -e

BACKUP_FILE=$1
if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_file.sql.gz>"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "Restoring database from: $BACKUP_FILE"
gunzip -c "$BACKUP_FILE" | psql -U "${POSTGRES_USER:-tamer}" -d "${POSTGRES_DB:-tamer_studio}"
echo "Database restored successfully."
