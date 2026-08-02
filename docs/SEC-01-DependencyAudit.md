# SEC-01: Dependency and Supply Chain Security

## Scope

Dependency vulnerability management, lock file integrity, and supply chain attack prevention.

## Architecture

### Dependency Management

- pnpm with strict lock file (pnpm-lock.yaml)
 - No automatic major version updates
- Direct dependency auditing via `pnpm audit`
- Transitive dependency scanning
- Renovate/Dependabot for automated security patches

### Supply Chain Protections

- Lock file committed and verified in CI
- Package integrity verification (checksums)
- Scoped registries for internal packages
- No post-install scripts from untrusted sources
- SBOM generation for compliance

### Vulnerability Response

- Critical: Patch within 24 hours
- High: Patch within 7 days
- Medium: Patch within 30 days
- Low: Patch in next scheduled release

## Configuration

```
# pnpm configuration
strict-peer-dependencies=true
auto-install-peers=false

# Audit configuration
audit-level=critical
ignore-advisories=[]
```

## Commands

```bash
# Full dependency audit
pnpm audit

# Audit with specific severity
pnpm audit --audit-level=critical

# Generate SBOM
pnpm security:sbom-generate

# Check lock file integrity
pnpm security:lockfile-verify

# Update vulnerable dependencies
pnpm audit --fix
```

## Verification

1. Confirm `pnpm audit` returns no critical vulnerabilities
2. Verify lock file is committed and matches node_modules
3. Test CI pipeline blocks PRs with critical audit findings
4. Validate SBOM generation includes all dependencies
5. Confirm automated security patches are applied within SLA