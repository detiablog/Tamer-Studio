# BETA-01: Architecture

## Scope

This document describes the architectural design of the Closed Beta program module in Tamer Studio. The beta program provides invitation-based access control, feedback collection, bug reporting, feature requests, user satisfaction tracking, and readiness scoring for pre-release testing.

## Architecture

### Module Structure

```
src/core/beta-program/
  index.ts                    - Barrel exports
  invitation.service.ts       - Invitation lifecycle management
  beta-user.service.ts        - Beta user registration and status
  feedback.service.ts         - Feedback collection and categorization
  bug-report.service.ts       - Bug report submission and tracking
  feature-request.service.ts  - Feature request voting and roadmap
  rating.service.ts           - NPS/CSAT rating collection
  readiness.service.ts        - Readiness score calculation
  announcement.service.ts     - Beta announcement management
  overview.service.ts         - Aggregate overview statistics
  settings.service.ts         - Beta program settings
```

### API Layer

```
src/app/api/beta/
  overview/route.ts           - GET aggregate overview
  invitations/route.ts        - GET list, POST create
  invitations/[id]/route.ts   - GET detail, DELETE
  invitations/[id]/revoke/    - POST revoke
  users/route.ts              - GET list, POST register
  users/[id]/route.ts         - GET, PUT status, DELETE
  feedback/route.ts           - GET list, POST submit
  feedback/[id]/route.ts      - GET, PUT, DELETE
  bugs/route.ts               - GET list, POST submit
  bugs/[id]/route.ts          - GET, PUT, DELETE
  bugs/[id]/resolve/          - POST resolve
  bugs/[id]/vote/             - POST vote
  features/route.ts           - GET list, POST submit
  features/[id]/route.ts      - GET, PUT, DELETE
  features/[id]/vote/         - POST vote
  ratings/route.ts            - GET list, POST submit
  announcements/route.ts      - GET list, POST create
  announcements/[id]/route.ts - DELETE
  announcements/[id]/publish/ - POST publish
  readiness/route.ts          - GET latest, POST calculate
  readiness/history/route.ts  - GET history
  settings/route.ts           - GET, POST upsert
  stats/route.ts              - GET aggregate stats
```

### Dashboard

```
src/app/admin/(protected)/beta/
  page.tsx       - Server page wrapper
  pageClient.tsx - Client component with 10 tabs
```

### Database Tables

All beta tables are defined in `src/lib/db/schema/beta.ts`:

- `beta_invitation` - Invitation codes and status
- `beta_user` - Registered beta users
- `beta_feedback` - User feedback submissions
- `beta_bug_report` - Bug reports with severity tracking
- `beta_feature_request` - Feature requests with voting
- `beta_rating` - NPS/CSAT ratings
- `beta_readiness` - Readiness score snapshots
- `beta_announcement` - Beta announcements
- `beta_settings` - Program configuration

### Data Flow

1. Admin creates invitations via dashboard
2. Users accept invitations and register as beta users
3. Beta users submit feedback, bug reports, feature requests, and ratings
4. System calculates readiness scores from aggregated data
5. Admin reviews, resolves, and manages the beta program

## Configuration

No additional configuration required. The beta program uses existing database and authentication infrastructure.

## Commands

```bash
# No build commands required - routes and pages are auto-discovered by Next.js
```

## Verification

- Navigate to `/admin/beta` in the dashboard
- Verify all 10 tabs load correctly
- Test API endpoints via browser or curl
- Verify localization loads in both English and Indonesian
