# BETA-01: Feature Requests

## Scope

The feature request system allows beta users to propose new features with business value justification. Requests are ranked by community votes and can be approved, rejected, or placed on the roadmap.

## Architecture

### Service Methods

```typescript
class FeatureRequestService {
  submitRequest(userId, data: { title, description?, businessValue?, useCase?, category? })
  listRequests(filters?: { status?, category?, search?, page?, limit? })
  getRequest(id: string)
  voteRequest(id: string)
  updateRequest(id: string, data: Record<string, unknown>)
  deleteRequest(id: string)
  getStats()
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/beta/features` | List feature requests sorted by votes |
| POST | `/api/beta/features` | Submit feature request |
| GET | `/api/beta/features/[id]` | Get feature detail |
| PUT | `/api/beta/features/[id]` | Update feature |
| DELETE | `/api/beta/features/[id]` | Delete feature |
| POST | `/api/beta/features/[id]/vote` | Upvote feature |

### Database Schema

Table: `beta_feature_request`

| Column | Type | Description |
|--------|------|-------------|
| id | text | Primary key (bfreq_xxx) |
| userId | text | Requester user ID |
| title | text | Feature title |
| description | text | Feature description |
| businessValue | text | Business justification |
| useCase | text | Use case description |
| category | text | Feature category |
| status | text | open/approved/rejected/implemented |
| votes | integer | Vote count |
| roadmapTag | text | Roadmap assignment |
| duplicateOf | text | Related request ID |
| createdAt | timestamp | Creation date |
| updatedAt | timestamp | Last update |

### Status Workflow

```
open -> approved -> implemented
open -> rejected
open -> open (with votes)
```

### Vote System

Each vote increments the `votes` counter. Features are sorted by vote count in descending order.

## Configuration

No additional configuration required.

## Commands

```bash
# No build commands required
```

## Verification

- Submit feature request
- Test voting increments count
- Verify list is sorted by votes
- Test status updates via PUT
- Verify stats return correct totals
