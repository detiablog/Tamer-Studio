# BETA-01: Readiness Score

## Scope

The readiness score system calculates a composite score (0-100) representing the beta program's readiness for general availability (GA) release. It aggregates multiple quality dimensions into a single actionable metric.

## Architecture

### Service Methods

```typescript
class ReadinessService {
  calculateReadiness()  // Calculate and store new readiness score
  getLatestReadiness()  // Get most recent score
  getHistory(limit?)    // Get historical scores
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/beta/readiness` | Get latest readiness score |
| POST | `/api/beta/readiness` | Calculate new readiness score |
| GET | `/api/beta/readiness/history` | Get readiness history |

### Database Schema

Table: `beta_readiness`

| Column | Type | Description |
|--------|------|-------------|
| id | text | Primary key (bredy_xxx) |
| overallScore | integer | 0-100 composite score |
| bugSeverity | integer | Bug severity score |
| crashRate | integer | Crash rate score |
| userSatisfaction | integer | User satisfaction score |
| performance | integer | Performance score |
| security | integer | Security score |
| localization | integer | Localization score |
| accessibility | integer | Accessibility score |
| aiSuccessRate | integer | AI success rate score |
| status | text | not_ready/needs_improvement/beta_stable/ga_ready |
| notes | text | Calculation notes |
| calculatedAt | timestamp | Calculation timestamp |

### Scoring Formula

```
overallScore = bugSeverityScore * 0.25
             + satisfactionScore * 0.2
             + performanceScore * 0.1
             + securityScore * 0.1
             + localizationScore * 0.1
             + accessibilityScore * 0.1
             + aiSuccessRate * 0.15
```

### Status Thresholds

| Score Range | Status | Description |
|-------------|--------|-------------|
| 0-49 | `not_ready` | Not ready for release |
| 50-69 | `needs_improvement` | Requires improvements |
| 70-84 | `beta_stable` | Stable for beta |
| 85-100 | `ga_ready` | Ready for general availability |

### Score Components

- **Bug Severity (25%)**: Based on critical bug count and open bugs
- **User Satisfaction (20%)**: Derived from average rating (rating * 20)
- **Performance (10%)**: Static baseline (80)
- **Security (10%)**: Static baseline (90)
- **Localization (10%)**: Static baseline (85)
- **Accessibility (10%)**: Static baseline (80)
- **AI Success Rate (15%)**: Static baseline (85)

## Configuration

Score weights and thresholds are defined in `readiness.service.ts`. Modify the weights array to adjust scoring priorities.

## Commands

```bash
# No build commands required
```

## Verification

- POST to `/api/beta/readiness` and verify score is calculated
- Check score components are within expected ranges
- Verify status is assigned correctly based on score
- Test history endpoint returns previous calculations
