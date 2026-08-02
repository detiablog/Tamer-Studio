# BETA-01: Feedback Center

## Scope

The feedback center collects, categorizes, and manages user feedback during the beta program. It supports category filtering, severity tracking, and status management.

## Architecture

### Service Methods

```typescript
class BetaFeedbackService {
  submitFeedback(userId, data: { category, severity?, title, description?, steps?, expectedResult?, actualResult?, screenshot?, attachments?, rating?, browser?, os?, version?, metadata? })
  listFeedback(filters?: { userId?, category?, status?, severity?, search?, page?, limit? })
  getFeedback(id: string)
  updateFeedback(id: string, data: Record<string, unknown>)
  deleteFeedback(id: string)
  getStats()
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/beta/feedback` | List feedback with filters |
| POST | `/api/beta/feedback` | Submit feedback |
| GET | `/api/beta/feedback/[id]` | Get feedback detail |
| PUT | `/api/beta/feedback/[id]` | Update feedback |
| DELETE | `/api/beta/feedback/[id]` | Delete feedback |

### Database Schema

Table: `beta_feedback`

| Column | Type | Description |
|--------|------|-------------|
| id | text | Primary key (bfdb_xxx) |
| userId | text | Submitter user ID |
| category | text | Feedback category |
| severity | text | low/medium/high/critical |
| title | text | Feedback title |
| description | text | Detailed description |
| steps | text | Reproduction steps |
| expectedResult | text | What was expected |
| actualResult | text | What actually happened |
| screenshot | text | Screenshot URL |
| attachments | jsonb | Attached files |
| rating | integer | 1-5 rating |
| browser | text | Browser info |
| os | text | OS info |
| version | text | App version |
| metadata | jsonb | Additional data |
| status | text | open/in_review/resolved |
| createdAt | timestamp | Creation date |

### Feedback Categories

- `ui` - User interface issues
- `performance` - Performance problems
- `feature` - Feature-related feedback
- `ux` - User experience
- `other` - General feedback

### Auto-Increment

When feedback is submitted, the user's `feedbackCount` is automatically incremented.

## Configuration

No additional configuration required.

## Commands

```bash
# No build commands required
```

## Verification

- Submit feedback via API
- Verify feedback count increments on user record
- Test filtering by category, severity, and status
- Verify stats return correct aggregations
