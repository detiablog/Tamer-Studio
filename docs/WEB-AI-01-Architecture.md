# WEB-AI-01 — Architecture

## Execution Flow

User Request → AI Runtime API → Validation → Credit Check → Provider Router → Queue → Provider Adapter → AI Provider → Result Processor → Asset Storage → Notification → Audit Log

## Provider Abstraction

All providers implement: execute, estimateCost, healthCheck, listModels.

The ProviderRouter selects providers based on:
1. User preference (if specified and healthy)
2. Health-based auto-selection
3. Fallback to first available

## Health Monitoring

Every success/failure is recorded in ai_provider_health table.
Routing uses health data to avoid unhealthy providers.

## Credit Flow

1. Validate sufficient credits
2. Reserve estimated credits in wallet
3. Execute generation
4. Reconcile actual vs estimated credits
5. Refund on failure
