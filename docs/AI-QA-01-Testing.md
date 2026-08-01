# AI Quality Assurance - Testing Guide

## Overview

The AI QA system requires comprehensive testing across validators, scoring, recommendations, recovery, and API endpoints. This document outlines test coverage areas and testing strategies.

## Test Coverage Areas

### 1. Unit Tests - Validators

#### Image Validator Tests

- Resolution scoring at boundary values (640, 1024, 2048)
- Blur/sharpness threshold detection (blur > 30)
- Noise detection (noise > 40)
- Lighting range validation (below 30, above 95)
- Contrast threshold (below 20)
- Cropping threshold (below 40)
- Composition threshold (below 40)
- Subject visibility threshold (below 40)
- Watermark penalty calculation (0.98 multiplier)
- Overall score weighted calculation
- Default values when asset properties are missing

#### Video Validator Tests

- Resolution scoring at boundary values (720, 1280, 1920)
- FPS scoring at boundary values (24, 30, 60)
- Frame consistency threshold (below 50)
- Scene continuity threshold (below 50)
- Audio presence detection
- Rendering error penalty calculation
- Thumbnail availability scoring
- Overall score weighted calculation

#### Brand Validator Tests

- Active brand profile loading
- Color match calculation (exact match, partial match, no match)
- Typography comparison (match vs mismatch)
- Tone comparison (match vs mismatch)
- CTA comparison (match vs mismatch)
- Logo presence scoring
- Watermark presence scoring
- Fallback scoring when no brand profile exists

#### Story Validator Tests

- Timeline consistency scoring
- Character consistency threshold (below 50)
- Episode continuity threshold (below 50)
- Rule compliance threshold (below 50)
- Overall score weighted calculation
- Default values for all metrics

#### Publishing Validator Tests

- Caption quality detection
- Hashtag quality detection
- Thumbnail quality detection
- Aspect ratio validation
- Overall score weighted calculation

### 2. Unit Tests - Scoring Engine

- Weight assignment for all categories
- Default weight for unknown categories
- Overall score calculation with single category
- Overall score calculation with multiple categories
- Score capping at 100
- Default score (70) for missing categories
- Explanation generation for all score ranges

### 3. Unit Tests - Recommendation Engine

- Image score below 60 triggers regeneration recommendation
- Video score below 60 triggers regeneration recommendation
- Brand score below 60 triggers brand fix recommendation
- Story score below 60 triggers story fix recommendation
- Publishing score below 60 triggers publishing fix recommendation
- Prompt score below 60 triggers prompt improvement recommendation
- Issue-based recommendations (up to 5)
- Impact score assignment per type
- Severity assignment per type

### 4. Unit Tests - Auto Recovery

- Approve when score >= minScore
- Regenerate when score < minScore and retries available
- Manual review when max retries reached
- Stop as fallback case
- Retry count increment
- Retry history recording

### 5. Unit Tests - Quality Rules

- Rule CRUD operations
- Rule listing with filters
- Rule toggle (enable/disable)
- Settings upsert (create and update)
- Threshold upsert (create and update)
- Default settings creation

### 6. Unit Tests - Quality Reports

- Report creation with all fields
- Report retrieval (single and full)
- Report listing with filters (projectId, assetType, status, passed, search)
- Pagination (page, limit, offset)
- Report update
- Report deletion with cascading deletes
- Score addition
- Validation addition
- Recommendation addition
- Retry history addition
- Audit log creation
- Statistics aggregation (totalReports, passedReports, failedReports, avgOverallScore, approvalRate, typeBreakdown)

### 7. Integration Tests - API Endpoints

#### GET /api/quality

- Returns paginated reports for authenticated user
- Filters by projectId, assetType, status, passed
- Search in summary and assetId
- Returns 401 for unauthenticated requests

#### POST /api/quality

- Creates report with valid body
- Returns 401 for unauthenticated requests
- Returns 400 for missing required fields

#### POST /api/quality/validate

- Runs full validation pipeline
- Returns scores, validators, recommendations, recovery
- Handles missing assetType/moduleType/asset
- Returns 401 for unauthenticated requests

#### GET /api/quality/[id]

- Returns full report with all relations
- Returns 404 for non-existent report
- Returns 401 for unauthenticated requests

#### DELETE /api/quality/[id]

- Deletes report and all child records
- Returns 401 for unauthenticated requests

#### PUT /api/quality/[id]/recommendations/[recId]

- Updates recommendation status
- Returns 404 for non-existent recommendation
- Returns 401 for unauthenticated requests

#### GET /api/quality/stats

- Returns aggregated statistics
- Returns 401 for unauthenticated requests

#### GET /api/quality/analytics

- Returns analytics with date range filtering
- Returns daily trend data
- Returns type breakdown
- Returns 401 for unauthenticated requests

#### GET /api/quality/rules

- Returns paginated rules
- Filters by category, isEnabled, search
- Returns 401 for unauthenticated requests

#### POST /api/quality/rules

- Creates rule with valid body
- Returns 400 for missing name
- Returns 401 for unauthenticated requests

#### GET/PUT/DELETE /api/quality/rules/[id]

- CRUD operations on single rule
- Returns 404 for non-existent rule
- Returns 401 for unauthenticated requests

#### POST /api/quality/rules/[id]/toggle

- Toggles rule enabled state
- Returns 404 for non-existent rule
- Returns 401 for unauthenticated requests

#### GET/POST /api/quality/settings

- Returns user settings (creates defaults if missing)
- Upserts settings with partial data
- Returns 401 for unauthenticated requests

#### GET /api/quality/thresholds

- Returns all thresholds
- Returns 401 for unauthenticated requests

### 8. Security Tests

- User A cannot access User B's reports
- User A cannot modify User B's rules
- User A cannot see User B's settings
- Unauthenticated requests are rejected
- Audit logs are created for all mutations

### 9. Edge Cases

- Empty asset metadata
- All validators failing
- Score exactly at minScore boundary
- Max retry count of 0
- Concurrent report creation
- Report deletion during active validation
- Very large number of recommendations
- Unicode in rule names and descriptions
