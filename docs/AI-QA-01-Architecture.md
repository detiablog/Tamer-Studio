# AI Quality Assurance - Overall Architecture

## System Overview

The AI Quality Assurance (AI QA) system is an automated quality control pipeline for AI-generated assets within Tamer Studio. It evaluates images, videos, stories, publishing content, and affiliate materials against configurable quality rules, brand guidelines, and platform requirements. The system produces quality scores, recommendations, and recovery decisions to ensure only publishable content reaches production.

## Purpose

- Automate quality validation for AI-generated content
- Enforce brand consistency across all asset types
- Maintain story continuity for narrative-driven content
- Ensure platform compliance for publishing workflows
- Provide actionable recommendations for content improvement
- Support automatic retry and recovery for suboptimal assets

## Architecture Diagram

```
+-------------------+
| Generated Asset   |
| (Image/Video/     |
|  Story/Publishing)|
+--------+----------+
         |
         v
+--------+----------+
| Quality           |
| Orchestrator      |
| Service           |
+--------+----------+
         |
         +------+--------+--------+--------+
         |      |        |        |        |
         v      v        v        v        v
     +------+ +------+ +------+ +------+ +------+
     |Image | |Video | |Brand | |Story | |Publ. |
     |Valid.| |Valid.| |Valid.| |Valid.| |Valid.|
     +--+---+ +--+---+ +--+---+ +--+---+ +--+---+
        |        |        |        |        |
        +--------+--------+--------+--------+
                     |
                     v
            +--------+---------+
            | Scoring Engine   |
            | (Weighted Calc)  |
            +--------+---------+
                     |
                     v
            +--------+---------+
            | Recommendation   |
            | Engine           |
            +--------+---------+
                     |
                     v
            +--------+---------+
            | Auto Recovery    |
            | Service          |
            +--------+---------+
                     |
                     v
            +--------+---------+
            | Quality Report   |
            | Service (DB)     |
            +------------------+
                     |
                     v
            +------------------+
            | Analytics &      |
            | Audit Logging    |
            +------------------+
```

## Core Components

### 1. Image Validator Service

**File:** `src/core/quality-assurance/image-validator.service.ts`

Evaluates image assets on resolution, sharpness, noise, lighting, exposure, contrast, cropping, composition, subject visibility, text readability, and watermark presence. Produces a weighted overall score (0-100).

### 2. Video Validator Service

**File:** `src/core/quality-assurance/video-validator.service.ts`

Validates video assets against resolution, FPS, frame consistency, scene continuity, audio presence, subtitle timing, rendering errors, transition quality, ending quality, and thumbnail availability.

### 3. Brand Validator Service

**File:** `src/core/quality-assurance/brand-validator.service.ts`

Checks assets against the user's active `creativeBrandProfile`. Validates logo presence, color palette matching, typography alignment, tone consistency, watermark, and CTA placement. Falls back to generic scoring when no brand profile exists.

### 4. Story Validator Service

**File:** `src/core/quality-assurance/story-validator.service.ts`

Validates narrative content for timeline consistency, character consistency, relationship consistency, location consistency, object consistency, dialogue style, episode continuity, and rule compliance.

### 5. Publishing Validator Service

**File:** `src/core/quality-assurance/publishing-validator.service.ts`

Ensures content meets platform requirements including aspect ratio, duration, caption quality, hashtag quality, thumbnail availability, title quality, description quality, and localization readiness.

### 6. Scoring Engine Service

**File:** `src/core/quality-assurance/scoring-engine.service.ts`

Calculates weighted scores across all validation categories. Produces category-level scores with explanations and a final overall score.

### 7. Recommendation Engine Service

**File:** `src/core/quality-assurance/recommendation-engine.service.ts`

Generates actionable recommendations based on score thresholds and detected issues. Each recommendation includes type, title, description, severity, impact score, and suggested action.

### 8. Auto Recovery Service

**File:** `src/core/quality-assurance/auto-recovery.service.ts`

Makes approve/regenerate/manual_review/stop decisions based on overall score, minimum threshold, retry threshold, and retry count. Tracks retry history in the database.

### 9. Quality Rules Service

**File:** `src/core/quality-assurance/quality-rule.service.ts`

Manages quality rules, thresholds, and user settings. Supports CRUD operations for rules, threshold configuration, and per-user settings management.

### 10. Quality Report Service

**File:** `src/core/quality-assurance/quality-report.service.ts`

Handles CRUD operations for quality reports and related entities (scores, validations, recommendations, retry history, audit logs). Provides statistics aggregation.

### 11. Quality Orchestrator Service

**File:** `src/core/quality-assurance/quality-orchestrator.service.ts`

Entry point that coordinates the entire validation pipeline. Runs applicable validators, calculates scores, generates recommendations, and determines recovery actions.

## Data Flow

```
1. Asset Generation
   - AI generates an asset (image, video, story, etc.)
   - Asset metadata is collected

2. Validation Request
   - POST /api/quality/validate
   - Payload: { assetType, moduleType, asset, projectId?, assetId?, minScore? }

3. Orchestrator Execution
   - QualityOrchestratorService.runValidation()
   - Loads user settings for thresholds
   - Selects validators based on assetType

4. Parallel Validation
   - ImageValidatorService.validateImage()      (if image)
   - VideoValidatorService.validateVideo()      (if video)
   - BrandValidatorService.validateBrand()      (always)
   - StoryValidatorService.validateStory()      (if story/drama)
   - PublishingValidatorService.validatePublishing() (if publishing/affiliate)

5. Score Calculation
   - ScoringEngineService.calculateScores() -> ScoreCategory[]
   - ScoringEngineService.calculateOverall() -> number (0-100)

6. Report Creation
   - QualityReportService.createReport()
   - QualityReportService.addScore() for each category

7. Recommendation Generation
   - RecommendationEngineService.generateRecommendations()

8. Recovery Decision
   - AutoRecoveryService.decide() -> { action, reason, retryCount? }

9. Report Finalization
   - Status updated based on recovery action
   - Audit log entry created

10. Response
    - Returns { reportId, overallScore, passed, minScore, scores, validators, recommendations, recovery }
```

## Integration Points

### Creative Memory (Brand Profiles)

- **Table:** `creative_brand_profile`
- **Usage:** Brand Validator reads active brand profile per user
- **Schema:** `src/lib/db/schema/creative-memory.ts`

### Authentication Middleware

- **Middleware:** `userAuthentication()`
- **Usage:** All API routes require authenticated user session
- **Location:** `src/core/middleware/`

### Database Layer

- **ORM:** Drizzle ORM with PostgreSQL
- **Schema:** `src/lib/db/schema/quality-assurance.ts`
- **Connection:** `src/lib/db/client.ts`

### Response Mappers

- **Functions:** `successResponse()`, `errorResponse()`, `mapErrorToResponse()`
- **Location:** `src/app/api/mappers/`

## File Structure

```
src/
  core/quality-assurance/
    index.ts                          # Barrel exports
    quality-orchestrator.service.ts   # Main orchestrator
    quality-report.service.ts         # Report CRUD + stats
    quality-rule.service.ts           # Rules, thresholds, settings
    image-validator.service.ts        # Image quality validation
    video-validator.service.ts        # Video quality validation
    brand-validator.service.ts        # Brand consistency validation
    story-validator.service.ts        # Story/narrative validation
    publishing-validator.service.ts   # Publishing readiness validation
    scoring-engine.service.ts         # Weighted score calculation
    recommendation-engine.service.ts  # Recommendation generation
    auto-recovery.service.ts          # Recovery decisions + retry tracking

  app/api/quality/
    route.ts                          # GET (list), POST (create report)
    validate/route.ts                 # POST (run validation)
    [id]/route.ts                     # GET (full report), DELETE
    [id]/recommendations/[recId]/route.ts  # PUT (update rec status)
    stats/route.ts                    # GET (user statistics)
    analytics/route.ts                # GET (analytics with date range)
    settings/route.ts                 # GET, POST (user settings)
    rules/route.ts                    # GET, POST (list/create rules)
    rules/[id]/route.ts               # GET, PUT, DELETE (single rule)
    rules/[id]/toggle/route.ts        # POST (toggle rule enabled)

  lib/db/schema/quality-assurance.ts  # Database schema (9 tables)
```
