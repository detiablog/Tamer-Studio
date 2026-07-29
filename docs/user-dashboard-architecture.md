# User Dashboard Architecture

**Date:** 2026-07-29  
**Sprint:** USER-01  

---

## Architecture Overview

The User Dashboard is a server-rendered Next.js application with client-side interactivity.

### Auth Flow
```
Request → (dashboard)/layout.tsx
  → getServerSession() — reads better-auth session cookie
  → If no session → redirect /login
  → If workspace cookie exists → check hasActiveAccess()
  → If inactive → redirect /pricing
  → Otherwise → render children (AppShell + page)
```

### Data Flow
```
Database → Repository → Service → API Route → Client (useSWR/fetch) → UI
```

### Pages (17 total)
| Page | Route | Data Source |
|------|-------|-------------|
| AI | /ai | API: /api/ai-providers |
| AI Provider Detail | /ai/providers/[id] | localStorage store |
| API Keys | /api-keys | API: /api/api-keys |
| Billing | /billing | API: /api/commerce/* |
| Media | /media | API: /api/media |
| Notifications | /notifications | API: /api/notifications |
| Production | /production | localStorage store (migrated) |
| Production Detail | /production/[id] | API: /api/production/execute |
| Profile | /profile | API: /api/profile |
| Projects | /projects | API: /api/workspaces |
| Projects Detail | /projects/[id] | Placeholder |
| Publishing | /publishing | localStorage store (migrated) |
| Settings | /settings | API: /api/profile + /api/preferences |
| Templates | /templates | localStorage store (migrated) |
| Workspace | /workspace | API: /api/workspaces |
| Workspace Detail | /workspace/[id] | Placeholder |
| Workspace Edit | /workspace/[id]/edit | localStorage store |

### Database Tables Used
- user, session (auth)
- user_profile, user_preferences (profile)
- api_key (API keys)
- workspace, workspace_member (workspaces)
- media/cms_media (media)
- notification, notification_preference (notifications)
- production_metrics (production)
- plan, billing_option, plan_pricing, wallet, order, subscription (commerce)
- ai_provider, ai_provider_model (AI)

### API Endpoints
- GET/POST /api/profile
- GET/POST /api/preferences
- GET/POST/DELETE /api/api-keys
- GET /api/workspaces
- GET/POST/DELETE /api/media
- GET/PATCH /api/notifications
- GET /api/commerce/plans, wallet, orders
- POST /api/commerce/checkout
- POST /api/production/execute
- GET /api/ai-providers
- GET /api/user/stats
