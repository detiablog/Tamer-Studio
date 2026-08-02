# Landing Builder Architecture

**Date:** 2026-07-29  
**Sprint:** LANDING-01  

---

## Architecture Overview

### Data Flow
```
Admin Builder (AdminLandingBuilderClient)
  → API: /api/landing/sections/*
  → CMSService → cmsSection table (DB)
  → Public Homepage: /api/homepage
  → HomepageRuntime → renderLandingSection()
```

### Builder Stack
| Component | Technology |
|-----------|-----------|
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| State | SWR (server state) + React state |
| Persistence | PostgreSQL via Drizzle ORM |
| Rendering | Server-side with client hydration |

### Database Tables
| Table | Purpose |
|-------|---------|
| cms_page | Landing page definition (slug: "landing-page") |
| cms_section | Section content, config, styles, ordering |
| landing_section | Legacy section data (used by campaign/subscription APIs) |
| landing_media | Legacy media data |

### API Endpoints
| Endpoint | Methods | Auth | Purpose |
|----------|---------|------|---------|
| /api/landing/sections | GET, POST | Admin | List/create sections |
| /api/landing/sections/[key] | GET, PATCH, DELETE, POST | Admin | CRUD section by key |
| /api/landing/sections/reorder | PATCH | Admin | Reorder sections (DnD) |
| /api/landing/pricing | GET | Public | Regional pricing |
| /api/landing/currency | GET | Public | Currency profile |
| /api/landing/subscription | GET | Public | Subscription plans |
| /api/landing/campaign | GET | Public | Campaign banner |
| /api/landing/seo | GET | Public | SEO metadata |
| /api/homepage | GET | Public | Full homepage composition |
| /api/cms/pages | GET, POST | Admin | CMS page management |
| /api/cms/sections | GET, POST | Admin | Section management |
| /api/cms/publish | POST | Admin | Publish pipeline |
| /api/cms/versions | GET, POST | Admin | Version history |
| /api/cms/audit | GET | Admin | Audit log |

### Admin Builder Pages
| File | Purpose |
|------|---------|
| admin/(protected)/landing-builder/page.tsx | Server entry point |
| admin/(protected)/landing-builder/AdminLandingBuilderClient.tsx | Main client component |
| _components/SectionList.tsx | Sortable section list |
| _components/SectionDrawer.tsx | Section editor (side sheet) |
| _components/LivePreview.tsx | Real-time preview (iframe) |
| _components/AddSectionDialog.tsx | Create section dialog |

### Public Rendering
| File | Purpose |
|------|---------|
| app/page.tsx | Root / route |
| components/homepage/HomepageRuntimeContent.tsx | Client component for homepage |
| hooks/use-homepage.ts | Fetch /api/homepage |
| hooks/use-landing-sections.ts | Fetch /api/landing/sections |
| lib/landing-section-renderer.ts | Maps sectionKey → React component |

### Section Types (15)
hero, features, pricing, credit-packs, credit-usage, faq, testimonials, social-proof, cta, screenshots, ai-platform, realtime-stats, timeline, footer, custom
