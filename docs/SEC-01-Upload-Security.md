# SEC-01: Upload Security

## Scope

Security controls for file uploads including validation, scanning, storage isolation, and access control.

## Architecture

### Upload Pipeline

1. Client-side file type pre-validation
2. Server-side MIME type verification (magic bytes)
3. File size limit enforcement
4. Malware scanning integration point
5. Content inspection for steganography indicators
6. Storage in isolated bucket with no public access
7. Signed URL generation for controlled access

### File Validation Rules

- Maximum file size: 50MB for images, 500MB for video
- Allowed MIME types: image/png, image/jpeg, image/webp, video/mp4, audio/mpeg, application/pdf
- Magic byte verification against declared MIME type
- Filename sanitization (no path traversal, no special characters)
- Duplicate detection via content hash

### Storage Security

- Files stored in separate S3 bucket from application assets
- No public bucket access; all access via signed URLs
- Bucket encryption enabled (AES-256)
- Lifecycle policies for temporary uploads
- Access logging enabled

## Configuration

```
UPLOAD_MAX_SIZE_MB=50
UPLOAD_ALLOWED_MIMES=image/png,image/jpeg,image/webp,video/mp4,audio/mpeg,application/pdf
UPLOAD_SIGNING_EXPIRY=3600
UPLOAD_VIRUS_SCAN_ENABLED=false
UPLOAD_STEGANOGRAPHY_CHECK=false
STORAGE_BUCKET=uploads
STORAGE_ENCRYPTION=AES256
```

## Commands

```bash
# Audit upload security
pnpm security:upload-audit

# Test file validation
pnpm security:upload-validation-test

# Verify storage isolation
pnpm security:storage-isolation-check

# Scan existing uploads
pnpm security:upload-scan
```

## Verification

1. Confirm oversized files are rejected with 413 status
2. Test MIME type validation rejects executables disguised as images
3. Verify path traversal attempts in filenames are sanitized
4. Confirm stored files are not publicly accessible without signed URLs
5. Validate bucket encryption is enabled
