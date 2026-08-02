# BETA-01: Database

## Scope

This document describes the database schema for all beta program tables, including relationships, indexes, and migration considerations.

## Architecture

### Schema Location

All beta tables are defined in: `src/lib/db/schema/beta.ts`

### Tables

#### beta_invitation

| Column | Type | Constraints |
|--------|------|-------------|
| id | text | PRIMARY KEY |
| email | text | NOT NULL |
| code | text | UNIQUE NOT NULL |
| status | text | DEFAULT 'pending' |
| invitedBy | text | |
| maxUses | integer | DEFAULT 1 |
| currentUses | integer | DEFAULT 0 |
| expiresAt | timestamp | |
| acceptedAt | timestamp | |
| createdAt | timestamp | DEFAULT NOW |
| updatedAt | timestamp | |

#### beta_user

| Column | Type | Constraints |
|--------|------|-------------|
| id | text | PRIMARY KEY |
| userId | text | UNIQUE NOT NULL |
| invitationId | text | FK -> beta_invitation |
| role | text | DEFAULT 'tester' |
| status | text | DEFAULT 'active' |
| metadata | jsonb | |
| feedbackCount | integer | DEFAULT 0 |
| bugCount | integer | DEFAULT 0 |
| joinedAt | timestamp | DEFAULT NOW |
| lastActiveAt | timestamp | |
| updatedAt | timestamp | |

#### beta_feedback

| Column | Type | Constraints |
|--------|------|-------------|
| id | text | PRIMARY KEY |
| userId | text | NOT NULL |
| category | text | NOT NULL |
| severity | text | |
| title | text | NOT NULL |
| description | text | |
| steps | text | |
| expectedResult | text | |
| actualResult | text | |
| screenshot | text | |
| attachments | jsonb | |
| rating | integer | |
| browser | text | |
| os | text | |
| version | text | |
| metadata | jsonb | |
| status | text | DEFAULT 'open' |
| createdAt | timestamp | DEFAULT NOW |

#### beta_bug_report

| Column | Type | Constraints |
|--------|------|-------------|
| id | text | PRIMARY KEY |
| userId | text | NOT NULL |
| title | text | NOT NULL |
| description | text | NOT NULL |
| reproductionSteps | text | |
| severity | text | |
| priority | text | |
| category | text | |
| status | text | DEFAULT 'open' |
| browser | text | |
| os | text | |
| screenSize | text | |
| version | text | |
| buildNumber | text | |
| traceId | text | |
| correlationId | text | |
| screenshots | jsonb | |
| attachments | jsonb | |
| consoleLogs | text | |
| environment | jsonb | |
| votes | integer | DEFAULT 0 |
| resolution | text | |
| resolvedAt | timestamp | |
| createdAt | timestamp | DEFAULT NOW |

#### beta_feature_request

| Column | Type | Constraints |
|--------|------|-------------|
| id | text | PRIMARY KEY |
| userId | text | NOT NULL |
| title | text | NOT NULL |
| description | text | |
| businessValue | text | |
| useCase | text | |
| category | text | |
| status | text | DEFAULT 'open' |
| votes | integer | DEFAULT 0 |
| roadmapTag | text | |
| duplicateOf | text | |
| createdAt | timestamp | DEFAULT NOW |
| updatedAt | timestamp | |

#### beta_rating

| Column | Type | Constraints |
|--------|------|-------------|
| id | text | PRIMARY KEY |
| userId | text | NOT NULL |
| ratingType | text | NOT NULL |
| entityType | text | |
| entityId | text | |
| rating | integer | NOT NULL |
| comment | text | |
| createdAt | timestamp | DEFAULT NOW |

#### beta_readiness

| Column | Type | Constraints |
|--------|------|-------------|
| id | text | PRIMARY KEY |
| overallScore | integer | NOT NULL |
| bugSeverity | integer | |
| crashRate | integer | |
| userSatisfaction | integer | |
| performance | integer | |
| security | integer | |
| localization | integer | |
| accessibility | integer | |
| aiSuccessRate | integer | |
| status | text | NOT NULL |
| notes | text | |
| calculatedAt | timestamp | DEFAULT NOW |

#### beta_announcement

| Column | Type | Constraints |
|--------|------|-------------|
| id | text | PRIMARY KEY |
| title | text | NOT NULL |
| content | text | NOT NULL |
| type | text | DEFAULT 'info' |
| target | text | |
| isPublished | boolean | DEFAULT false |
| publishedAt | timestamp | |
| expiresAt | timestamp | |
| createdAt | timestamp | DEFAULT NOW |

#### beta_settings

| Column | Type | Constraints |
|--------|------|-------------|
| id | text | PRIMARY KEY |
| betaEnabled | boolean | DEFAULT false |
| maxUsers | integer | DEFAULT 100 |
| requireInvitation | boolean | DEFAULT true |
| autoApprove | boolean | DEFAULT false |
| feedbackEnabled | boolean | DEFAULT true |
| bugReportingEnabled | boolean | DEFAULT true |
| featureRequestsEnabled | boolean | DEFAULT true |
| announcementsEnabled | boolean | DEFAULT true |
| createdAt | timestamp | DEFAULT NOW |
| updatedAt | timestamp | |

### Relationships

- `beta_user.invitationId` -> `beta_invitation.id`
- `beta_feedback.userId` references user
- `beta_bug_report.userId` references user
- `beta_feature_request.userId` references user
- `beta_rating.userId` references user

## Configuration

Database uses Drizzle ORM. Schema changes require running migrations.

## Commands

```bash
# Generate migration after schema changes
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit push
```

## Verification

- Verify all tables exist in database
- Test foreign key relationships
- Verify indexes on frequently queried columns
