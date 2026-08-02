# BETA-01: Bug Reporting

## Scope

The bug reporting system allows beta users to submit detailed bug reports with severity classification, priority levels, environment details, and reproduction steps. Reports can be voted on and resolved.

## Architecture

### Service Methods

```typescript
class BugReportService {
  submitBug(userId, data: { title, description, reproductionSteps?, severity?, priority?, category?, browser?, os?, screenSize?, version?, buildNumber?, traceId?, correlationId?, screenshots?, attachments?, consoleLogs?, environment? })
  listBugs(filters?: { userId?, status?, severity?, priority?, search?, page?, limit? })
  getBug(id: string)
  updateBug(id: string, data: Record<string, unknown>)
  resolveBug(id: string, resolution: string)
  voteBug(id: string)
  deleteBug(id: string)
  getStats()
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/beta/bugs` | List bug reports with filters |
| POST | `/api/beta/bugs` | Submit bug report |
| GET | `/api/beta/bugs/[id]` | Get bug detail |
| PUT | `/api/beta/bugs/[id]` | Update bug |
| DELETE | `/api/beta/bugs/[id]` | Delete bug |
| POST | `/api/beta/bugs/[id]/resolve` | Resolve bug |
| POST | `/api/beta/bugs/[id]/vote` | Upvote bug |

### Database Schema

Table: `beta_bug_report`

| Column | Type | Description |
|--------|------|-------------|
| id | text | Primary key (bbug_xxx) |
| userId | text | Reporter user ID |
| title | text | Bug title |
| description | text | Detailed description |
| reproductionSteps | text | Steps to reproduce |
| severity | text | critical/high/medium/low |
| priority | text | P0/P1/P2/P3 |
| category | text | Bug category |
| status | text | open/in_progress/resolved/closed |
| browser | text | Browser info |
| os | text | OS info |
| screenSize | text | Screen resolution |
| version | text | App version |
| buildNumber | text | Build number |
| traceId | text | Error trace ID |
| correlationId | text | Correlation ID |
| screenshots | jsonb | Screenshot URLs |
| attachments | jsonb | Attached files |
| consoleLogs | text | Console output |
| environment | jsonb | Environment details |
| votes | integer | Vote count |
| resolution | text | Resolution description |
| resolvedAt | timestamp | Resolution date |
| createdAt | timestamp | Creation date |

### Severity Levels

- `critical` - System crash, data loss, security breach
- `high` - Major functionality broken
- `medium` - Partial functionality impacted
- `low` - Minor issue, cosmetic

### Vote System

Users can upvote bugs to indicate impact. Vote count is used for prioritization.

## Configuration

No additional configuration required.

## Commands

```bash
# No build commands required
```

## Verification

- Submit bug report with all fields
- Verify user's bug count increments
- Test resolve workflow
- Test voting increments vote count
- Verify stats by severity
