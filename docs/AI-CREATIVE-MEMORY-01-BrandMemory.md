# AI Creative Memory System - Brand Memory

## Brand Profile Fields

Brand profiles store comprehensive brand identity information used to enforce consistency across all AI-generated creative outputs.

### Field Reference

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | text | Yes | Primary key (prefixed `cbpf`) |
| `userId` | text | Yes | Owner identifier |
| `name` | varchar(200) | Yes | Brand name |
| `logo` | text | No | Logo URL or base64 data |
| `primaryColors` | jsonb (string[]) | No | Primary brand colors (hex codes) |
| `secondaryColors` | jsonb (string[]) | No | Secondary brand colors |
| `typography` | varchar(200) | No | Preferred font families |
| `watermark` | text | No | Watermark image URL or text |
| `voice` | varchar(100) | No | Brand voice (e.g., "professional", "casual") |
| `tone` | varchar(100) | No | Brand tone (e.g., "friendly", "authoritative") |
| `audience` | text | No | Target audience description |
| `preferredCta` | text | No | Preferred call-to-action style |
| `preferredPlatforms` | jsonb (string[]) | No | Target publishing platforms |
| `keywords` | jsonb (string[]) | No | Brand-relevant keywords |
| `rules` | jsonb (string[]) | No | Brand rules and constraints |
| `brandStyleGuide` | jsonb | No | Extended style guide as JSON |
| `isActive` | boolean | Yes | Whether profile is active (default: true) |
| `metadata` | jsonb | No | Additional metadata |
| `createdAt` | timestamp | Yes | Creation timestamp |
| `updatedAt` | timestamp | Yes | Last update timestamp |

---

## Brand Consistency Enforcement

### How Brand Context Is Applied

When the Context Builder assembles context for an AI prompt, the active brand profile is included as the first section:

```
[Brand Identity]
Name: Acme Corp
Voice: Professional
Tone: Authoritative
Audience: Enterprise decision makers
Primary Colors: #1a73e8, #ffffff
Secondary Colors: #5f6368
Typography: Google Sans, Roboto
CTA Style: Request a Demo
Platforms: LinkedIn, Twitter, Website
Keywords: enterprise, AI, automation
Rules:
  - Never use competitor names
  - Always include logo in generated images
  - Maintain consistent blue color palette
```

### Brand Rules Enforcement

Brand rules are injected into AI prompts as system-level constraints. The AI runtime is expected to respect these rules when generating content. Rules are:

- Stored as an array of strings in `rules` field
- Displayed in the context summary under `[Brand Identity]`
- Applied across all modules (Image, Video, Affiliate, Drama, Story, Project)

### Color Palette Application

- Primary and secondary colors are passed to image generation as style parameters
- Colors are used for thumbnail generation and caption styling
- Brand colors take precedence over learned visual preferences

---

## Multi-Brand Support

### Profile Management

- Users can create multiple brand profiles
- Only one profile can be `isActive: true` at a time (context builder queries for active profile)
- Switching brands is done by updating `isActive` flags
- Each brand profile is independently managed with full CRUD operations

### API Operations

| Operation | Endpoint | Method |
|-----------|----------|--------|
| List brands | `GET /api/memory/brand` | List all user's brand profiles |
| Create brand | `POST /api/memory/brand` | Create new brand profile |
| Get brand | `GET /api/memory/brand/:id` | Get specific brand profile |
| Update brand | `PUT /api/memory/brand/:id` | Update brand profile |
| Delete brand | `DELETE /api/memory/brand/:id` | Delete brand profile |

### Brand Profile Lifecycle

1. **Creation**: User creates brand with required `name` field
2. **Configuration**: User adds colors, typography, voice, rules
3. **Activation**: User sets `isActive: true` (should deactivate others)
4. **Usage**: Context Builder loads active brand for AI prompts
5. **Deactivation**: User sets `isActive: false` when switching brands
6. **Deletion**: User deletes brand profile (cannot be undone)

---

## Brand Context Injection

### Context Builder Integration

The `ContextBuilderService.buildContext()` method loads the active brand profile:

```typescript
const [brandProfile] = await db
  .select()
  .from(creativeBrandProfile)
  .where(
    and(
      eq(creativeBrandProfile.userId, userId),
      eq(creativeBrandProfile.isActive, true)
    )
  )
  .orderBy(desc(creativeBrandProfile.updatedAt))
  .limit(1);
```

### Summary Generation

The `getContextSummary()` method formats brand data into AI-consumable text:

```typescript
if (context.brandProfile) {
  const b = context.brandProfile;
  const lines = [`Name: ${b.name}`];
  if (b.voice) lines.push(`Voice: ${b.voice}`);
  if (b.tone) lines.push(`Tone: ${b.tone}`);
  if (b.audience) lines.push(`Audience: ${b.audience}`);
  if (b.primaryColors?.length) lines.push(`Primary Colors: ${b.primaryColors.join(", ")}`);
  if (b.secondaryColors?.length) lines.push(`Secondary Colors: ${b.secondaryColors.join(", ")}`);
  if (b.typography) lines.push(`Typography: ${b.typography}`);
  if (b.preferredCta) lines.push(`CTA Style: ${b.preferredCta}`);
  if (b.preferredPlatforms?.length) lines.push(`Platforms: ${b.preferredPlatforms.join(", ")}`);
  if (b.keywords?.length) lines.push(`Keywords: ${b.keywords.join(", ")}`);
  if (b.rules?.length) lines.push(`Rules:\n${b.rules.map(r => `  - ${r}`).join("\n")}`);
  sections.push(`[Brand Identity]\n${lines.join("\n")}`);
}
```

### Brand Style Guide

The `brandStyleGuide` field accepts arbitrary JSON for extended style specifications:

```json
{
  "photographyStyle": "minimalist",
  "illustrationStyle": "flat design",
  "videoStyle": "cinematic",
  "socialMediaRules": {
    "instagram": "Always use 1080x1080",
    "twitter": "Keep text under 280 characters"
  },
  "messaging": {
    "doNotUse": ["competitor names", "negative language"],
    "alwaysInclude": ["value proposition", "social proof"]
  }
}
```
