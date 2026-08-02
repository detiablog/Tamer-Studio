# SEC-01: Container and Deployment Security

## Scope

Docker container hardening, CI/CD pipeline security, and deployment best practices.

## Architecture

### Container Hardening

- Multi-stage Dockerfile to minimize attack surface
- Non-root user execution
- Read-only filesystem where possible
- No shell access in production images
- Minimal base image (Alpine or distroless)

### Image Security

- Base image pinned to specific digest
- Vulnerability scanning on build
- No secrets baked into images
- Image signing with cosign
- Private registry with access control

### CI/CD Pipeline Security

- Branch protection on main
- Signed commits required
- Dependency audit before merge
- Container vulnerability scan in pipeline
- Deployment requires approval from authorized reviewers

### Runtime Security

- Resource limits (CPU, memory) on containers
- Network policies restricting pod-to-pod communication
- Secrets mounted as volumes (not environment variables)
- Health checks for liveness and readiness

## Configuration

```
# Dockerfile security
USER node
READ_ONLY_ROOTFS=true
NO_NEW_PRIVILEGES=true
CAP_DROP=ALL

# CI/CD security
SIGN_COMMITS=true
SCAN_VULNERABILITIES=true
APPROVAL_REQUIRED=true
```

## Commands

```bash
# Scan container image for vulnerabilities
docker scan tamer-studio:latest

# Validate Dockerfile security
pnpm security:dockerfile-audit

# Check CI/CD pipeline configuration
pnpm security:cicd-audit

# Verify image signing
cosign verify tamer-studio:latest
```

## Verification

1. Confirm container runs as non-root user
2. Verify no secrets are baked into Docker image layers
3. Test resource limits prevent container exhaustion
4. Validate vulnerability scan passes with no critical findings
5. Confirm image signature verification succeeds
