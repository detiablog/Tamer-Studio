# PROD-01: Backup Strategy

**Document ID:** PROD-01-Backups  
**Version:** 1.0  
**Last Updated:** 2026-08-02  
**Status:** Active

---

## Scope

This document defines the backup strategy for Tamer Studio, including database backups, asset backups, configuration backups, retention policies, encryption, and verification procedures.

---

## Backup Architecture

```
Backup Scheduler --> Database Backup (pg_dump)
                   Asset Backup (tar)
                   Configuration Backup (git)
                   |
                   v
              Local Storage (/app/data/backups)
                   |
                   v
              Off-site Storage (optional)
```

---

## Backup Types

### 1. Database Backup

**Script:** `scripts/backup-db.sh`

```bash
#!/bin/bash
set -e

BACKUP_DIR="/app/data/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"

mkdir -p "$BACKUP_DIR"

pg_dump -U "${POSTGRES_USER:-tamer}" -d "${POSTGRES_DB:-tamer_studio}" | gzip > "$BACKUP_FILE"
echo "Backup created: $BACKUP_FILE"

# Retention: 7 days
find "$BACKUP_DIR" -name "db_backup_*.sql.gz" -mtime +7 -delete
echo "Old backups cleaned up."
```

**Schedule:**
| Type | Frequency | Time | Retention |
|------|-----------|------|-----------|
| Automated | Daily | 02:00 UTC | 7 days |
| Manual | On demand | - | 30 days |
| Pre-deploy | On deploy | - | Until verified |

### 2. Asset Backup

**Scope:** User-uploaded files, images, documents

```bash
# Backup assets
tar czf /app/data/backups/assets_$(date +%Y%m%d).tar.gz \
  -C /app/data \
  uploads/ \
  --exclude="*.tmp"

# Restore assets
tar xzf /app/data/backups/assets_20260802.tar.gz -C /app/data
```

### 3. Configuration Backup

**Scope:** Environment files, Nginx config, Docker Compose

```bash
# Configuration is in git
git archive --format=tar.gz --prefix=config-backup/ HEAD \
  docker-compose.yml \
  config/ \
  .env.example \
  > /app/data/backups/config_$(date +%Y%m%d).tar.gz
```

---

## Retention Policy

| Backup Type | Local Retention | Off-site Retention | Storage |
|-------------|----------------|-------------------|---------|
| Database | 7 days | 30 days | /app/data/backups |
| Assets | 30 days | 90 days | /app/data/backups |
| Configuration | Git history | Indefinite | Git repository |
| Pre-deploy | Until verified | 7 days | /app/data/backups |

### Retention Commands

```bash
# Clean old database backups (7 days)
find /app/data/backups -name "db_backup_*.sql.gz" -mtime +7 -delete

# Clean old asset backups (30 days)
find /app/data/backups -name "assets_*.tar.gz" -mtime +30 -delete

# List all backups
ls -lah /app/data/backups/
```

---

## Encryption

### Database Backup Encryption

```bash
# Encrypt backup
gpg --symmetric --cipher-algo AES256 db_backup_20260802_020000.sql.gz

# Decrypt backup
gpg --decrypt db_backup_20260802_020000.sql.gz.gpg > db_backup_decrypted.sql.gz
```

### Asset Backup Encryption

```bash
# Encrypt
tar czf - /app/data/uploads | gpg --symmetric --cipher-algo AES256 > assets_encrypted.tar.gz.gpg

# Decrypt
gpg --decrypt assets_encrypted.tar.gz.gpg | tar xzf - -C /app/data
```

### Encryption Keys

- Store encryption keys in a secure key management system
- Never commit encryption keys to version control
- Rotate encryption keys quarterly
- Maintain key backup in separate secure location

---

## Backup Verification

### Automated Verification

```bash
#!/bin/bash
# verify-backup.sh

BACKUP_FILE=$1

# Check file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo "FAIL: Backup file not found"
  exit 1
fi

# Check file is not empty
if [ ! -s "$BACKUP_FILE" ]; then
  echo "FAIL: Backup file is empty"
  exit 1
fi

# Check gzip integrity
if ! gzip -t "$BACKUP_FILE" 2>/dev/null; then
  echo "FAIL: Backup file is corrupted"
  exit 1
fi

# Check SQL content (for database backups)
if gunzip -c "$BACKUP_FILE" | head -1 | grep -q "PostgreSQL database dump"; then
  echo "PASS: Valid PostgreSQL backup"
else
  echo "WARN: Cannot verify backup format"
fi
```

### Manual Verification

```bash
# Test restore to temporary database
docker compose exec db createdb -U tamer tamer_studio_test
gunzip -c db_backup_20260802_020000.sql.gz | docker compose exec -T db psql -U tamer -d tamer_studio_test

# Verify tables exist
docker compose exec db psql -U tamer -d tamer_studio_test -c "\dt"

# Cleanup test database
docker compose exec db dropdb -U tamer tamer_studio_test
```

---

## Scheduled Backups

### Cron Configuration

```bash
# Add to crontab or scheduler.sh
# Daily backup at 02:00 UTC
0 2 * * * /app/scripts/backup-db.sh >> /var/log/backup.log 2>&1

# Weekly cleanup at 03:00 UTC on Sundays
0 3 * * 0 find /app/data/backups -name "*.sql.gz" -mtime +7 -delete
```

### Docker Compose Scheduler

```yaml
# Add scheduler service
scheduler:
  image: alpine:latest
  container_name: tamer-scheduler
  restart: unless-stopped
  command: /bin/sh -c "while true; do /scripts/backup-db.sh; sleep 86400; done"
  volumes:
    - ./scripts:/scripts:ro
    - app-data:/app/data
  networks:
    - tamer-network
```

---

## Disaster Recovery Backups

### Off-site Backup

```bash
# Sync to remote storage (e.g., S3, R2)
aws s3 sync /app/data/backups/ s3://tamer-studio-backups/ --exclude "*.tmp"

# Or using rclone
rclone sync /app/data/backups remote:tamer-studio-backups/
```

### Backup Verification Schedule

| Check | Frequency | Method |
|-------|-----------|--------|
| File integrity | Daily | Automated |
| Restore test | Weekly | Manual |
| Full DR test | Monthly | Manual |

---

## Commands

### Create Backup

```bash
# Database backup
docker compose exec db pg_dump -U tamer tamer_studio | gzip > backup_$(date +%Y%m%d).sql.gz

# Full backup
./scripts/backup-db.sh
```

### Restore Backup

```bash
# Database restore
./scripts/restore-db.sh /app/data/backups/db_backup_20260802_020000.sql.gz

# Manual restore
gunzip -c backup.sql.gz | docker compose exec -T db psql -U tamer -d tamer_studio
```

### List Backups

```bash
ls -lah /app/data/backups/
```

### Verify Backup

```bash
./scripts/verify-backup.sh /app/data/backups/db_backup_20260802_020000.sql.gz
```

---

## Verification

| Check | Command | Expected |
|-------|---------|----------|
| Backup created | `ls -la /app/data/backups/` | Recent backup file |
| Backup valid | `gzip -t backup.sql.gz` | No error |
| Restore works | Restore to test DB | Tables created |
| Retention working | Check old files deleted | Files > 7 days removed |
| Off-site sync | Check remote storage | Files synced |

---

## Troubleshooting

| Issue | Diagnosis | Resolution |
|-------|-----------|------------|
| Backup fails | Check disk space, permissions | Free space, fix permissions |
| Restore fails | Check backup file integrity | Verify file, check PostgreSQL version |
| Disk full | `df -h /app/data` | Clean old backups, increase storage |
| Encryption fails | Check GPG key | Verify key exists, permissions |
| Off-site sync fails | Check network, credentials | Verify remote access |
