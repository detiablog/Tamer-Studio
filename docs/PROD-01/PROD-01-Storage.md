# PROD-01: Object Storage Setup

**Document ID:** PROD-01-Storage  
**Version:** 1.0  
**Last Updated:** 2026-08-02  
**Status:** Active

---

## Scope

This document defines the object storage configuration for Tamer Studio, including provider abstraction (R2/S3/MinIO), upload/download operations, signed URLs, retention policies, and cleanup procedures.

---

## Architecture

```
App/Worker --> StorageEngine --> Storage Provider
                                      |
                          +-----------+-----------+
                          |           |           |
                       Local      Cloudflare R2  AWS S3
                       (dev)       (prod)        (alt)
```

---

## Provider Abstraction

### Supported Providers

| Provider | Environment | Use Case |
|----------|-------------|----------|
| `local` | Development | Local filesystem |
| `r2` | Production | Cloudflare R2 (S3-compatible) |
| `s3` | Production | AWS S3 |
| `minio` | Self-hosted | MinIO (S3-compatible) |

### Configuration

```bash
# Storage provider selection
STORAGE_PROVIDER=local|r2|s3|minio

# Provider-specific credentials
STORAGE_ACCESS_KEY=<access-key>
STORAGE_SECRET_KEY=<secret-key>
STORAGE_ENDPOINT=<endpoint-url>
STORAGE_BUCKET=<bucket-name>
STORAGE_PUBLIC_URL=<public-url>

# Cloudflare R2 specific
R2_ACCOUNT_ID=<account-id>
R2_ACCESS_KEY_ID=<access-key>
R2_SECRET_ACCESS_KEY=<secret-key>
R2_BUCKET=<bucket-name>
R2_PUBLIC_URL=<public-url>

# Local storage
ASSET_STORAGE_DIR=/tmp/tamer-assets
```

---

## Storage Engine

### Core Operations

```typescript
// src/core/storage/storage-engine.ts

export class StorageEngine {
  // Upload file
  async upload(input: UploadInput): Promise<{
    id: string;
    storageKey: string;
    sizeBytes: number;
  }>

  // Download file
  async download(fileId: string): Promise<Buffer | null>

  // Get public URL
  async getUrl(fileId: string): Promise<string | null>

  // Delete file
  async delete(fileId: string): Promise<boolean>

  // Soft delete (mark as deleted)
  async softDelete(fileId: string): Promise<boolean>

  // Restore soft-deleted file
  async restore(fileId: string): Promise<boolean>

  // List files with filters
  async listFiles(userId: string, filters?: FileFilters)

  // Check storage quota
  async checkQuota(userId: string, additionalBytes: number): Promise<StorageQuotaCheck>

  // Get quota usage
  async getQuota(userId: string)

  // Get storage statistics
  async getStorageStats(userId: string)
}
```

### Upload Flow

```
1. Check user quota (checkQuota)
2. Generate unique file ID
3. Build storage key: files/{userId}/{id}/{filename}
4. Store file via provider
5. Create database record
6. Update user quota
7. Return file metadata
```

### Download Flow

```
1. Look up file record in database
2. Retrieve file from storage provider
3. Return file buffer
```

---

## Signed URLs

### Generation

```typescript
// For temporary access to private files
async function getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  // Cloudflare R2 / AWS S3
  const command = new GetObjectCommand({
    Bucket: process.env.STORAGE_BUCKET,
    Key: key,
    Expires: expiresIn,
  });
  return getSignedUrl(s3Client, command);
}
```

### Use Cases

| Use Case | Expiry | Permissions |
|----------|--------|-------------|
| Profile image upload | 15 min | PutObject |
| Document download | 1 hour | GetObject |
| Shared link | 24 hours | GetObject |
| Temporary access | 5 min | GetObject |

---

## File Organization

### Storage Key Structure

```
files/
  {userId}/
    {fileId}/
      {filename}
```

### Database Schema

```sql
-- storage_files table
id            TEXT PRIMARY KEY
userId        TEXT NOT NULL
storageKey    TEXT NOT NULL UNIQUE
originalName  TEXT NOT NULL
mimeType      TEXT NOT NULL
sizeBytes     INTEGER NOT NULL
provider      TEXT NOT NULL
status        TEXT DEFAULT 'ready'
kind          TEXT NOT NULL
metadata      JSONB DEFAULT '{}'
tags          TEXT[] DEFAULT '{}'
folderId      TEXT
expiresAt     TIMESTAMP
createdAt     TIMESTAMP DEFAULT NOW()
updatedAt     TIMESTAMP DEFAULT NOW()
deletedAt     TIMESTAMP
```

---

## Quota Management

### Default Quota

| Metric | Default |
|--------|---------|
| Total Storage | 1 GB |
| Image Storage | Unlimited |
| Video Storage | Unlimited |
| Document Storage | Unlimited |
| File Count | Unlimited |

### Quota Check

```typescript
async checkQuota(userId: string, additionalBytes: number): Promise<StorageQuotaCheck> {
  const quota = await getQuota(userId);
  const remaining = quota.totalBytes - quota.usedBytes;
  return {
    allowed: remaining >= additionalBytes,
    usedBytes: quota.usedBytes,
    totalBytes: quota.totalBytes,
    remainingBytes: remaining,
    usagePercent: (quota.usedBytes / quota.totalBytes) * 100,
  };
}
```

---

## Retention and Cleanup

### Retention Policy

| File Type | Retention | Cleanup |
|-----------|-----------|---------|
| User uploads | Permanent | Manual |
| Temp files | 24 hours | Automated |
| Soft-deleted | 30 days | Automated |
| Backups | 7 days | Automated |

### Cleanup Script

```bash
# Clean expired files
docker compose exec app node -e "
const { storageEngine } = require('./src/core/storage/storage-engine');
storageEngine.cleanupExpired().then(console.log);
"

# Clean soft-deleted files older than 30 days
docker compose exec app node -e "
const { storageEngine } = require('./src/core/storage/storage-engine');
storageEngine.cleanupDeleted(30).then(console.log);
"
```

---

## Commands

### Upload File

```bash
# Via API
curl -X POST http://localhost:3000/api/storage/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/file.jpg" \
  -F "kind=image"
```

### Download File

```bash
# Via API
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/storage/download/{fileId} \
  -o downloaded-file.jpg
```

### List Files

```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/api/storage/files?kind=image&page=1&limit=20"
```

### Check Quota

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/storage/quota
```

---

## Verification

| Check | Command | Expected |
|-------|---------|----------|
| Storage health | `curl http://localhost/api/health/storage` | HTTP 200 |
| Upload works | Upload test file via API | File stored, quota updated |
| Download works | Download test file via API | File retrieved |
| Signed URL works | Generate and access signed URL | File accessible |
| Quota enforced | Upload beyond quota | Error: quota exceeded |
| Cleanup runs | Check expired files removed | Files deleted |

---

## Troubleshooting

| Issue | Diagnosis | Resolution |
|-------|-----------|------------|
| Upload fails | Check storage provider logs | Verify credentials, bucket exists |
| Download fails | Check file exists in storage | Verify storage key, provider health |
| Quota exceeded | Check user quota | Increase quota, clean old files |
| Signed URL expired | Regenerate URL | Check expiry settings |
| Slow uploads | Check network/storage latency | Use resumable uploads, compress files |
| Storage full | Check provider storage usage | Clean old files, increase storage |
