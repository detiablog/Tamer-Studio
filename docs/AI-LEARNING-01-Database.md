# AI-LEARNING-01 - Database

## Overview

The Continuous Learning Engine uses 9 database tables to store events, patterns, preferences, recommendations, feedback, goals, reports, settings, and history. All tables follow the project's Drizzle ORM conventions with PostgreSQL.

## Database Schema

### Table 1: learning_events

Stores raw user interaction events.

```sql
CREATE TABLE learning_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  type VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_learning_events_user_id ON learning_events(user_id);
CREATE INDEX idx_learning_events_workspace_id ON learning_events(workspace_id);
CREATE INDEX idx_learning_events_type ON learning_events(type);
CREATE INDEX idx_learning_events_category ON learning_events(category);
CREATE INDEX idx_learning_events_timestamp ON learning_events(timestamp);
```

### Table 2: learning_patterns

Stores discovered behavioral patterns.

```sql
CREATE TABLE learning_patterns (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL,
  confidence DECIMAL(3,2) NOT NULL DEFAULT 0.0,
  occurrences INTEGER NOT NULL DEFAULT 0,
  first_seen TIMESTAMPTZ NOT NULL,
  last_seen TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_learning_patterns_user_id ON learning_patterns(user_id);
CREATE INDEX idx_learning_patterns_workspace_id ON learning_patterns(workspace_id);
CREATE INDEX idx_learning_patterns_category ON learning_patterns(category);
CREATE INDEX idx_learning_patterns_status ON learning_patterns(status);
CREATE INDEX idx_learning_patterns_confidence ON learning_patterns(confidence);
```

### Table 3: learning_preferences

Stores inferred and explicit user preferences.

```sql
CREATE TABLE learning_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  key VARCHAR(100) NOT NULL,
  value TEXT NOT NULL,
  source VARCHAR(20) NOT NULL DEFAULT 'behavioral',
  confidence DECIMAL(3,2) NOT NULL DEFAULT 0.0,
  overridden BOOLEAN NOT NULL DEFAULT FALSE,
  inferred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_learning_preferences_user_id ON learning_preferences(user_id);
CREATE INDEX idx_learning_preferences_workspace_id ON learning_preferences(workspace_id);
CREATE INDEX idx_learning_preferences_key ON learning_preferences(key);
CREATE INDEX idx_learning_preferences_source ON learning_preferences(source);
CREATE UNIQUE INDEX idx_learning_preferences_user_key ON learning_preferences(user_id, key);
```

### Table 4: learning_recommendations

Stores generated recommendations.

```sql
CREATE TABLE learning_recommendations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  confidence DECIMAL(3,2) NOT NULL DEFAULT 0.0,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  reasoning TEXT,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_learning_recommendations_user_id ON learning_recommendations(user_id);
CREATE INDEX idx_learning_recommendations_workspace_id ON learning_recommendations(workspace_id);
CREATE INDEX idx_learning_recommendations_type ON learning_recommendations(type);
CREATE INDEX idx_learning_recommendations_status ON learning_recommendations(status);
CREATE INDEX idx_learning_recommendations_priority ON learning_recommendations(priority);
```

### Table 5: learning_feedback

Stores user feedback on the learning system.

```sql
CREATE TABLE learning_feedback (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'general',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_learning_feedback_user_id ON learning_feedback(user_id);
CREATE INDEX idx_learning_feedback_workspace_id ON learning_feedback(workspace_id);
CREATE INDEX idx_learning_feedback_category ON learning_feedback(category);
CREATE INDEX idx_learning_feedback_rating ON learning_feedback(rating);
```

### Table 6: learning_goals

Stores user learning goals and progress.

```sql
CREATE TABLE learning_goals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_value INTEGER NOT NULL DEFAULT 100,
  current_value INTEGER NOT NULL DEFAULT 0,
  unit VARCHAR(50) NOT NULL DEFAULT 'count',
  deadline TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_learning_goals_user_id ON learning_goals(user_id);
CREATE INDEX idx_learning_goals_workspace_id ON learning_goals(workspace_id);
CREATE INDEX idx_learning_goals_status ON learning_goals(status);
```

### Table 7: learning_reports

Stores generated learning reports.

```sql
CREATE TABLE learning_reports (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  summary TEXT NOT NULL,
  metrics JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_learning_reports_user_id ON learning_reports(user_id);
CREATE INDEX idx_learning_reports_workspace_id ON learning_reports(workspace_id);
CREATE INDEX idx_learning_reports_type ON learning_reports(type);
```

### Table 8: learning_settings

Stores learning engine configuration per user/workspace.

```sql
CREATE TABLE learning_settings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  learning_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  learning_paused BOOLEAN NOT NULL DEFAULT FALSE,
  privacy_mode BOOLEAN NOT NULL DEFAULT FALSE,
  anonymous_data BOOLEAN NOT NULL DEFAULT FALSE,
  share_insights BOOLEAN NOT NULL DEFAULT FALSE,
  retention_days INTEGER NOT NULL DEFAULT 90,
  confidence_threshold DECIMAL(3,2) NOT NULL DEFAULT 0.7,
  auto_recommendations BOOLEAN NOT NULL DEFAULT TRUE,
  max_patterns INTEGER NOT NULL DEFAULT 1000,
  max_preferences INTEGER NOT NULL DEFAULT 500,
  processing_interval INTEGER NOT NULL DEFAULT 30,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_learning_settings_user_workspace ON learning_settings(user_id, workspace_id);
```

### Table 9: learning_history

Stores a timeline of learning events for the history tab.

```sql
CREATE TABLE learning_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  event VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  details TEXT,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_learning_history_user_id ON learning_history(user_id);
CREATE INDEX idx_learning_history_workspace_id ON learning_history(workspace_id);
CREATE INDEX idx_learning_history_category ON learning_history(category);
CREATE INDEX idx_learning_history_timestamp ON learning_history(timestamp);
```

## Relationships

```
users ──1:N── learning_events
users ──1:N── learning_patterns
users ──1:N── learning_preferences
users ──1:N── learning_recommendations
users ──1:N── learning_feedback
users ──1:N── learning_goals
users ──1:N── learning_reports
users ──1:1── learning_settings
users ──1:N── learning_history

workspaces ──1:N── learning_events
workspaces ──1:N── learning_patterns
workspaces ──1:N── learning_preferences
workspaces ──1:N── learning_recommendations
workspaces ──1:N── learning_feedback
workspaces ──1:N── learning_goals
workspaces ──1:N── learning_reports
workspaces ──1:1── learning_settings
workspaces ──1:N── learning_history
```

## Indexes

All tables include indexes on:

- `user_id` for per-user queries
- `workspace_id` for workspace-scoped queries
- Relevant filter columns (type, category, status, etc.)
- Timestamp columns for temporal queries
- Confidence columns for threshold filtering

## Data Retention

Old data is purged based on the `retention_days` setting:

```sql
DELETE FROM learning_events
WHERE timestamp < NOW() - INTERVAL '1 day' * $retention_days;
```

Retention runs as a scheduled background job.
