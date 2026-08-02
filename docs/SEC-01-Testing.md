# SEC-01: Security Testing

## Scope

Security testing methodology, automated scanning, penetration testing, and vulnerability assessment.

## Architecture

### Testing Layers

1. **Static Analysis (SAST)**: Code-level vulnerability detection in CI pipeline
2. **Dynamic Analysis (DAST)**: Runtime vulnerability scanning against staging
3. **Software Composition Analysis (SCA)**: Dependency vulnerability scanning
4. **Container Scanning**: Image vulnerability assessment
5. **Penetration Testing**: Manual and automated pen testing
6. **Configuration Audit**: Infrastructure security review

### Automated Testing

- **Pre-commit**: Secret detection, linting
- **CI Pipeline**: SAST, SCA, container scan, dependency audit
- **Pre-deploy**: DAST baseline scan, configuration validation
- **Post-deploy**: Smoke tests, health checks, regression scan

### Penetration Testing Schedule

- Quarterly external pen test
- Annual red team exercise
- Continuous bug bounty program (planned)

### Vulnerability Management

- All findings tracked in vulnerability management system
- Severity-based SLA for remediation
- Verification testing after fix deployment
- False positive tracking and tuning

## Configuration

```
SAST_ENABLED=true
DAST_ENABLED=true
SCA_ENABLED=true
CONTAINER_SCAN_ENABLED=true
PEN_TEST_SCHEDULE=quarterly
VULN_SLA_CRITICAL=1
VULN_SLA_HIGH=7
VULN_SLA_MEDIUM=30
```

## Commands

```bash
# Run full security test suite
pnpm security:test-all

# Static analysis
pnpm security:sast

# Dynamic analysis
pnpm security:dast

# Dependency scan
pnpm security:sca

# Container scan
pnpm security:container-scan

# Configuration audit
pnpm security:config-audit

# Generate test report
pnpm security:test-report
```

## Verification

1. Confirm SAST scan completes in CI pipeline
2. Test DAST scan against staging environment
3. Verify SCA finds no critical dependency vulnerabilities
4. Validate container scan passes with no high/critical findings
5. Confirm pen test findings are tracked and remediated
