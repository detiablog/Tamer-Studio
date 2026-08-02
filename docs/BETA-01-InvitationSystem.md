# BETA-01: Invitation System

## Scope

The invitation system manages the lifecycle of beta program invitations, including creation, code generation, acceptance, revocation, and expiration tracking.

## Architecture

### Service Methods

```typescript
class InvitationService {
  createInvitation(data: { email, invitedBy?, maxUses?, expiresInDays? })
  listInvitations(filters?: { status?, search?, page?, limit? })
  getInvitation(id: string)
  getInvitationByCode(code: string)
  acceptInvitation(code: string)
  revokeInvitation(id: string)
  deleteInvitation(id: string)
  getStats()
}
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/beta/invitations` | List invitations with filters |
| POST | `/api/beta/invitations` | Create new invitation |
| GET | `/api/beta/invitations/[id]` | Get invitation detail |
| DELETE | `/api/beta/invitations/[id]` | Delete invitation |
| POST | `/api/beta/invitations/[id]/revoke` | Revoke invitation |

### Database Schema

Table: `beta_invitation`

| Column | Type | Description |
|--------|------|-------------|
| id | text | Primary key (binv_xxx) |
| email | text | Invitee email |
| code | text | Unique invitation code |
| status | text | pending/accepted/revoked/expired |
| invitedBy | text | Admin who created the invite |
| maxUses | integer | Maximum allowed uses |
| currentUses | integer | Current use count |
| expiresAt | timestamp | Expiration date |
| acceptedAt | timestamp | When accepted |
| createdAt | timestamp | Creation date |
| updatedAt | timestamp | Last update |

### Code Generation

Invitation codes are generated from the email prefix (alphanumeric, uppercase) plus a random 3-digit suffix. Example: `johnDoe427`.

### Expiration

Invitations can have an optional expiration date. Expired invitations are rejected during acceptance.

## Configuration

- `maxUses`: Default 1. Controls how many times an invitation code can be used.
- `expiresInDays`: Optional. Number of days until the invitation expires.

## Commands

```bash
# No build commands required
```

## Verification

- Create invitation via dashboard or API
- Verify code is generated correctly
- Test acceptance with valid/invalid/expired codes
- Test revocation prevents further use
- Verify stats return correct counts
