# Media Integration Report
# CMS-01 Finalization — F8

**Status:** INCOMPLETE
**Date:** 2026-07-28
**Auditor:** Kilo AI

---

## Summary

The media system has two layers: a low-level asset storage system (`src/core/assets/`) with pluggable storage providers (Local, R2, S3), and a CMS-level media management layer (`src/core/cms/`) with repository pattern and CRUD operations. The CMS media API at `/api/cms/media` supports GET (list with pagination) and POST (upload) operations with admin authentication middleware. However, the user-facing media page at `(dashboard)/media` renders entirely hardcoded mock data and makes no API calls. The asset schema defines 7 database tables (asset, assetVersion, assetLineage, assetCollection, assetCollectionItem, assetTag, assetLifecycleEvent) but no dedicated `AssetRepository` exists for querying these tables.

## Verified Items

- [x] Asset service with store, promote, retrieve, delete, getDownloadUrl operations (`src/core/assets/asset.service.ts`)
- [x] Storage providers: `LocalStorage` (`src/core/assets/local-storage.ts`), `R2Storage` (`src/core/assets/r2-storage.ts`), `S3Storage` (`src/core/assets/s3-storage.ts`)
- [x] `AssetStorage` interface defined with store, retrieve, delete, exists, getUrl, list methods (`src/core/assets/asset.types.ts`)
- [x] Asset types: `TemporaryAsset`, `PermanentAsset`, `AssetId`, `AssetKind`, `AssetMetadata`, `AssetLifetime` (exported from `src/core/assets/index.ts`)
- [x] CMS media repository interface: `CMSMediaRepository` with createMedia, getMedia, listMedia, updateMedia, deleteMedia (`src/core/cms/repositories/media.repository.ts`)
- [x] Default CMS media repository implementation: `DefaultCMSMediaRepository` (`src/core/cms/repositories/default-media.repository.ts`)
- [x] Default repository uses `cmsMedia` table from Drizzle schema with full CRUD (lines 9-72)
- [x] CMS media API: `GET /api/cms/media` with folder/type filtering + pagination (`src/app/api/cms/media/route.ts:12-49`)
- [x] CMS media API: `POST /api/cms/media` for media registration (lines 52-82)
- [x] API routes use `adminAuthentication()` and `requireAdminPermission()` middleware (lines 32, 72)
- [x] Asset database schema with 7 tables: `asset`, `assetVersion`, `assetLineage`, `assetCollection`, `assetCollectionItem`, `assetTag`, `assetLifecycleEvent` (`src/lib/db/schema/asset.ts`)
- [x] Asset schema has proper foreign key relationships and indexes (lines 26-33, 48, 61, 90-93, 104, 118)
- [x] Asset relations defined with Drizzle `relations()` (lines 121-175)
- [x] No bypass upload path — all uploads go through API routes
- [x] CMS service integrates media repo: `CMSService` initializes `DefaultCMSMediaRepository` (`src/core/cms/cms.service.ts:38`)
- [x] LocalStorage uses `ASSET_STORAGE_DIR` env var with `/tmp/tamer-assets` default
- [x] R2Storage uses signed URLs with configurable expiry (`src/core/assets/r2-storage.ts:46-48`)
- [x] AssetService key pattern: `{id[0:2]}/{id}` for sharded storage (line 78-80)

## Issues Found

1. **CRITICAL** — User-facing media page at `src/app/(dashboard)/media/page.tsx` renders hardcoded mock data (`MEDIA_ITEMS` array, lines 14-21) with no API calls. Users cannot upload, browse, or manage real media assets from the dashboard.

2. **HIGH** — No `AssetRepository` exists for the 7 asset tables (`asset`, `assetVersion`, `assetLineage`, `assetCollection`, `assetCollectionItem`, `assetTag`, `assetLifecycleEvent`). The `AssetService` only handles raw binary storage/retrieval — there is no way to query asset metadata, version history, lineage, collections, or tags from the database.

3. **HIGH** — The CMS media API (`/api/cms/media`) is admin-only (requires `adminAuthentication` + `admin:read`/`admin:write` permissions). There is no user-level media API endpoint, so dashboard users cannot access media data even if the frontend was connected.

4. **MEDIUM** — `LocalStorage` defaults to `/tmp/tamer-assets` (`src/core/assets/local-storage.ts:10`), a volatile tmp directory. In production, assets stored locally will be lost on container restart/redeployment.

5. **MEDIUM** — The `AssetService.store()` method (line 24-28) stores raw `Buffer` data directly to storage with no content-type detection, file size validation, or virus scanning.

6. **MEDIUM** — `AssetService.promoteToPermanent()` (line 30-48) reads the existing asset as raw bytes, parses it as JSON to extract metadata, then re-stores it. This is fragile — if the stored asset is not valid JSON, the promote operation will throw with a parse error rather than a domain-specific error.

7. **LOW** — `LocalStorage.getUrl()` returns a `file://` protocol URL (line 54-56), which is not accessible from browsers. This makes local storage non-functional for user-facing download URLs.

8. **LOW** — `LocalStorage.list()` reads directory entries recursively but does not filter by prefix correctly when prefix contains path separators — the `getKeyPath` method strips leading slashes but `readdir` with `recursive: true` returns entries relative to the search path (lines 58-66).

9. **INFO** — CMS media API pagination is done in-memory via `Array.slice()` (lines 43-44) rather than database-level LIMIT/OFFSET, which will not scale for large media libraries.

## Recommendations

1. **CRITICAL** — Replace hardcoded mock data in `src/app/(dashboard)/media/page.tsx` with API integration. Create a user-level media API endpoint (e.g., `/api/user/media`) that returns the authenticated user's media assets, or connect to the CMS media API with user-level auth middleware.

2. **HIGH** — Implement an `AssetRepository` class that wraps the 7 asset Drizzle tables to provide query operations for asset metadata, version history, lineage tracking, collections, and tags.

3. **HIGH** — Create user-level media API routes with user authentication (not just admin auth) so dashboard users can upload and manage their own media assets.

4. **MEDIUM** — Configure production storage to use R2 or S3 providers. Update `LocalStorage` default directory to a persistent path and add environment-based provider selection.

5. **MEDIUM** — Add file validation to `AssetService.store()` including MIME type detection, file size limits, and content scanning before storage.

6. **MEDIUM** — Improve error handling in `AssetService.promoteToPermanent()` with proper error types for malformed asset data.

7. **LOW** — For local storage in development, serve assets through a Next.js API route (e.g., `/api/assets/[id]`) rather than `file://` URLs.

8. **LOW** — Move media list pagination to database level using Drizzle's `limit()` and `offset()` for scalability.

## Compliance

**FAIL** — The media system fails CMS-01 compliance:
- User-facing media page is entirely mock data with no API connectivity
- No user-level media API exists (admin-only access)
- No `AssetRepository` for querying the 7-table asset schema
- Storage provider defaults to volatile tmp directory
- No file validation on asset uploads
