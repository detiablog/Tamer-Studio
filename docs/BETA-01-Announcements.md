# BETA-01: Announcements

## Scope

The announcements module allows administrators to create, publish, and manage announcements targeted at beta users. Announcements can be typed as info, update, or maintenance.

## Architecture

### Service Methods

```typescript
class AnnouncementService {
  createAnnouncement(data: { title, content, type?, target?, expiresAt? })
  listAnnouncements(filters?: { type?, isPublished?, page?, limit? })
  publishAnnouncement(id: string)
  deleteAnnouncement(id: string)
  getActiveAnnouncements()
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/beta/announcements` | List announcements with filters |
| POST | `/api/beta/announcements` | Create announcement |
| DELETE | `/api/beta/announcements/[id]` | Delete announcement |
| POST | `/api/beta/announcements/[id]/publish` | Publish announcement |

### Database Schema

Table: `beta_announcement`

| Column | Type | Description |
|--------|------|-------------|
| id | text | Primary key (banc_xxx) |
| title | text | Announcement title |
| content | text | Announcement content |
| type | text | info/update/maintenance |
| target | text | Target audience |
| isPublished | boolean | Publication status |
| publishedAt | timestamp | When published |
| expiresAt | timestamp | Optional expiration |
| createdAt | timestamp | Creation date |

### Announcement Types

- `info` - General information
- `update` - Feature or system update
- `maintenance` - Scheduled maintenance notice

### Active Announcements

`getActiveAnnouncements()` returns announcements that are:
1. Published (`isPublished = true`)
2. Not expired (`expiresAt IS NULL OR expiresAt > NOW()`)

## Configuration

No additional configuration required.

## Commands

```bash
# No build commands required
```

## Verification

- Create announcement via API
- Verify it appears in list as draft
- Publish and verify status changes
- Test deletion
- Verify active announcements filter
