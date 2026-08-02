# BETA-01: User Satisfaction

## Scope

The user satisfaction module collects NPS (Net Promoter Score), CSAT (Customer Satisfaction), and overall experience ratings from beta users. Ratings are aggregated by type for analysis.

## Architecture

### Service Methods

```typescript
class BetaRatingService {
  submitRating(userId, data: { ratingType, entityType?, entityId?, rating, comment? })
  listRatings(filters?: { userId?, ratingType?, page?, limit? })
  getStats()
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/beta/ratings` | List ratings with filters |
| POST | `/api/beta/ratings` | Submit rating |

### Database Schema

Table: `beta_rating`

| Column | Type | Description |
|--------|------|-------------|
| id | text | Primary key (brat_xxx) |
| userId | text | Rater user ID |
| ratingType | text | nps/csat/overall |
| entityType | text | Related entity type |
| entityId | text | Related entity ID |
| rating | integer | 1-5 rating score |
| comment | text | Optional comment |
| createdAt | timestamp | Creation date |

### Rating Types

- `nps` - Net Promoter Score (likelihood to recommend)
- `csat` - Customer Satisfaction (satisfaction with specific feature)
- `overall` - Overall experience rating

### Aggregation

The `getStats()` method returns:
- Total ratings count
- Average rating across all types
- Breakdown by rating type with individual averages and counts

## Configuration

No additional configuration required.

## Commands

```bash
# No build commands required
```

## Verification

- Submit ratings of different types
- Verify average calculations
- Test type-based filtering
- Verify stats aggregation by type
