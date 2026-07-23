# Rollback Procedure

Version: 1.0

## Purpose
Provide a consistent rollback process after failed deployments.

## Steps
1. Detect failure
2. Stop rollout
3. Restore previous release
4. Verify service health
5. Record incident
6. Open postmortem

## Exit Criteria
System returns to a verified stable state.
