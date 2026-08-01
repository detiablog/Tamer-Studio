# AI-LEARNING-01 - Analytics

## Overview

The Analytics module provides comprehensive metrics, visualizations, and reporting capabilities for the Continuous Learning Engine. It aggregates learning data into actionable insights for both individual users and administrators.

## Analytics Architecture

```
Learning Data --> Aggregation Engine --> Metric Computation --> Cache --> API --> Dashboard
```

## User-Level Analytics

### Dashboard Metrics

The user dashboard displays key metrics:

| Metric | Description | Calculation |
|--------|-------------|-------------|
| Total Events | Number of learning events collected | COUNT(events) |
| Total Patterns | Number of discovered patterns | COUNT(patterns) |
| Total Preferences | Number of inferred preferences | COUNT(preferences) |
| Total Recommendations | Number of generated recommendations | COUNT(recommendations) |
| Avg Confidence | Average confidence across all outputs | AVG(confidence) |
| Acceptance Rate | Percentage of accepted recommendations | accepted / total |
| Goal Progress | Average progress across active goals | AVG(progress) |

### Event Analytics

Event data provides insights into user behavior:

- Events by type (creation, editing, publishing, etc.)
- Events over time (daily, weekly, monthly)
- Peak activity hours and days
- Session duration patterns
- Feature usage distribution

### Pattern Analytics

Pattern data reveals behavioral trends:

- Patterns by category (behavior, content, workflow, temporal)
- Pattern confidence distribution
- Pattern discovery rate over time
- Most frequent patterns
- Pattern stability metrics

### Preference Analytics

Preference data shows inference quality:

- Preferences by source (behavioral, explicit, feedback)
- Confidence distribution
- Override rate
- Most common preferences
- Preference stability

### Recommendation Analytics

Recommendation data measures effectiveness:

- Recommendations by type (workflow, content, feature, settings)
- Acceptance rate by type
- Confidence vs. acceptance correlation
- Recommendation effectiveness over time
- Feedback ratings distribution

## Admin-Level Analytics

### System Overview

Admin dashboard provides system-wide metrics:

- Total events across all users
- Total patterns discovered system-wide
- Total preferences inferred
- Total recommendations generated
- System-wide acceptance rate
- Average confidence across users

### Event Distribution

Analyze event distribution across the platform:

- Events by user (top users, distribution)
- Events by workspace
- Events by type (system-wide)
- Event volume trends
- Peak usage periods

### Pattern Distribution

Analyze pattern discovery across the platform:

- Patterns by category (system-wide)
- Pattern confidence distribution
- Discovery rate by user segment
- Pattern type popularity
- Correlation with user engagement

### Recommendation Performance

Measure recommendation effectiveness:

- System-wide acceptance rate
- Acceptance rate by recommendation type
- Confidence vs. acceptance analysis
- User segment performance
- Recommendation impact metrics

## Report Types

### Summary Report

High-level overview of learning activity:

- Key metrics snapshot
- Trend analysis (week-over-week, month-over-month)
- Top patterns and preferences
- Recommendation performance summary
- Goal progress overview

### Pattern Report

Detailed pattern analysis:

- All discovered patterns with metadata
- Confidence distribution
- Category breakdown
- Temporal trends
- Correlation analysis

### Recommendation Report

Recommendation performance analysis:

- All recommendations with status
- Acceptance rate analysis
- Type distribution
- Priority distribution
- Feedback summary

### Goal Report

Goal progress and completion:

- All goals with progress
- Completion rate
- Average time to completion
- Goal category distribution
- Progress trends

## Metric Computation

### Real-Time Metrics

Metrics computed in real-time:

- Total counts (events, patterns, preferences, recommendations)
- Current goal progress
- Recent activity feed

### Aggregated Metrics

Metrics computed from aggregated data:

- Average confidence
- Acceptance rate
- Pattern distribution
- Recommendation performance

### Cached Metrics

Metrics cached for performance:

- Dashboard summary stats
- Historical trend data
- Report data

## Analytics API

### Get Stats

```
GET /api/learning/stats
```

Returns aggregated learning statistics for the authenticated user.

### Get History

```
GET /api/learning/history
```

Returns learning event history with pagination.

### Generate Report

```
POST /api/learning/reports
```

Generates a learning report of the specified type.

### Get Report

```
GET /api/learning/reports/[id]
```

Retrieves a generated report by ID.

### Delete Report

```
DELETE /api/learning/reports/[id]
```

Removes a generated report.

## Performance

- Stats are cached with SWR for client-side performance
- Aggregated metrics use database indexes
- Reports are generated asynchronously
- Pagination prevents memory issues
- Background processing minimizes API latency
