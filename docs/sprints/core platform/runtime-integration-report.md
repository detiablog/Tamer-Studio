# Runtime Integration Report
# CMS-01 Finalization — F3: Runtime Layer Audit

**Status:** INCOMPLETE
**Date:** 2026-07-28
**Auditor:** Kilo AI

---

## Summary

The Tamer-Studio runtime layer consists of 24 runtime classes across 7 core modules and 2 library modules. Runtimes serve as the composition and orchestration layer between services and the presentation tier. The Homepage, Landing Builder, and SEO runtimes are well-integrated with proper dependency injection through singleton factory functions. The AI runtime follows a clean pipeline architecture. However, three critical runtime systems — Navigation, AI Usage, and AI Observability — operate entirely in-memory with no persistence layer. Additionally, 5 modules (Auth, Credits, Notifications, Audit, Media/Assets) lack explicit runtime classes entirely, relying instead on direct service/repo access. The HA Gateway runtime is architecturally sound but has 12 dependencies injected without a factory function.

---

## Verified Items

- [x] `HomepageRuntime` (`src/core/homepage/homepage-runtime.ts:47-508`) — fully integrated with CMSService, NavigationRuntime, SEORuntime, LocalizationService, SectionRegistry; singleton via `getHomepageRuntime()` (line 512-517)
- [x] `LandingBuilderRuntime` (`src/core/cms/landing-builder-runtime.ts:33-386`) — integrated with CMSService; provides undo/redo, clipboard, versioning, publishing, localization, SEO, and navigation sync; singleton via factory
- [x] `SEORuntime` (`src/core/seo/seo-runtime.ts:41-60+`) — composes 10 sub-runtimes (Metadata, Canonical, OpenGraph, Twitter, Schema, Robots, Sitemap, Hreflang, AISearch, Validation); has `SEOCache` integration
- [x] `DefaultAIRuntime` (`src/core/ai/runtime/ai-runtime.ts:17-296`) — clean pipeline: validate → normalize → execute → telemetry → audit; singleton via dependency injection
- [x] `DefaultDeveloperRuntime` (`src/core/ai/developer/developer-runtime.ts`) — wraps AIRuntime for developer-specific operations
- [x] `DefaultUsageRuntime` (`src/core/ai/usage/usage-runtime.ts:1-273`) — in-memory usage tracking with aggregation; integrated with Audit and Logger
- [x] `DefaultObservabilityRuntime` (`src/core/ai/observability/observability-runtime.ts:1-292`) — in-memory traces, metrics, logs; integrated with Logger
- [x] `NavigationRuntime` (`src/core/navigation/navigation-runtime.ts:14-279`) — in-memory menu/item/breadcrumb management
- [x] `BreadcrumbRuntime` (`src/core/navigation/breadcrumb-runtime.ts`) — dedicated breadcrumb resolution
- [x] `LocalizationRuntime` (`src/core/localization/localization-runtime.ts`) — locale resolution
- [x] `FormattingRuntime` (`src/core/localization/formatting-runtime.ts`) — number/date formatting
- [x] `CurrencyRuntime` (`src/core/localization/currency-runtime.ts`) — currency formatting
- [x] `TranslationRuntime` (`src/lib/localization/translation-runtime.ts`) — translation resolution
- [x] `DefaultHighAvailabilityGatewayRuntime` (`src/lib/ai/gateway/runtime/runtime.ts:24-172`) — composed of GatewayManager, Dispatcher, PolicyEngine, CircuitBreaker, RetryManager, FailoverManager, RecoveryManager, RuntimeStateManager, EventBus, HealthMonitor, MetricsCollector, ConfigurationLoader
- [x] All runtime classes use singleton/factory pattern (except HA Gateway)
- [x] Runtime communication map verified: HomepageRuntime → CMSService, NavigationRuntime, SEORuntime, LocalizationService, SectionRegistry

---

## Issues Found

### CRITICAL

1. **NavigationRuntime is 100% in-memory with no persistence**
   - File: `src/core/navigation/navigation-runtime.ts:14-17`
   - All data stored in `Map<string, NavigationMenu>`, `Map<string, NavigationItem>`, `Map<string, RouteMetadata>`
   - No database backing, no repository layer
   - **Impact**: All navigation items are lost on server restart; no admin UI persistence; the HomepageRuntime depends on this at `homepage-runtime.ts:151-163`

2. **AI UsageRuntime is 100% in-memory with no persistence**
   - File: `src/core/ai/usage/usage-runtime.ts:1-273`
   - Stores `UsageRecord[]` in memory; aggregates on-the-fly
   - No connection to the `usageRecord` or `costRecord` database tables
   - **Impact**: Usage data is lost on server restart; billing integration is disconnected from actual usage tracking

3. **AI ObservabilityRuntime is 100% in-memory with no persistence**
   - File: `src/core/ai/observability/observability-runtime.ts:1-292`
   - Stores `TraceSpan[]`, `LogEntry[]`, `MetricSeries[]` in memory
   - No connection to any persistence layer
   - **Impact**: Observability data is ephemeral; no historical analysis possible; compliance audit trail gaps

### HIGH

4. **5 modules lack explicit runtime classes**
   - **Auth**: No runtime; uses `src/core/auth/auth.ts` (drizzleAdapter) + guards directly
   - **Credits/Billing**: No runtime; uses engine pattern (`src/core/wallet/`) directly
   - **Notifications**: No runtime; uses service + dispatcher directly
   - **Audit**: No runtime; uses service + repository directly
   - **Media/Assets**: No runtime; uses service + storage directly
   - **Impact**: Inconsistent architecture; these modules cannot benefit from runtime-level caching, validation, or cross-cutting concerns

5. **HA Gateway Runtime has 12 dependencies without factory function**
   - File: `src/lib/ai/gateway/runtime/runtime.ts:27-39`
   - Constructor takes 12 parameters: GatewayManager, PolicyEngine, Dispatcher, HealthMonitor, MetricsCollector, ConfigurationLoader, CircuitBreaker, RetryManager, FailoverManager, RecoveryManager, RuntimeStateManager, EventBus
   - No `getHighAvailabilityGatewayRuntime()` factory exists
   - **Impact**: Difficult to instantiate; no singleton guarantee; testing requires mocking 12 dependencies

### MEDIUM

6. **SEORuntime uses in-memory cache without fallback**
   - File: `src/core/seo/seo-cache.ts:20-27`
   - `SEOCache` backed by `Map<string, SEOCacheEntry>` with max 200 entries and 60s TTL
   - Cache is lost on server restart; no Redis/database fallback
   - **Impact**: SEO metadata recalculation after restart; acceptable for read-heavy but not critical

7. **HomepageRuntime cache is also in-memory**
   - File: `src/core/homepage/homepage-runtime.ts:59-65` (cache get), `90-92` (cache set)
   - Uses `getHomepageCache()` which is in-memory
   - **Impact**: Homepage cache miss on every cold start; acceptable for ISR-compatible deployments

8. **`SectionRuntime` exists but its relationship to `SectionRegistry` is unclear**
   - File: `src/core/homepage/section-runtime.ts`
   - HomepageRuntime uses `SectionRegistry` (`section-registry.ts`), not `SectionRuntime`
   - **Impact**: Potential dead code or unused abstraction

### LOW

9. **`FakeRuntime` exists in AI testing module**
   - File: `src/core/ai/testing/fake-runtime.ts`
   - Test double; expected and acceptable

10. **`RuntimeContext` in AI SDK**
    - File: `src/lib/ai/sdk/context/runtime-context.ts`
    - AI SDK context wrapper; exists but integration with `DefaultAIRuntime` is not explicitly wired

---

## Recommendations

| Priority | Action | Owner |
|----------|--------|-------|
| P0 | Add database persistence for NavigationRuntime — create `NavigationRepository` and load/save navigation items from DB; or document that navigation is admin-configured via code only | Backend Team |
| P0 | Wire UsageRuntime to persist records to the `usageRecord` table via the existing billing schema; connect `DefaultUsageRuntime.record()` to `db.insert(usageRecord)` | Backend Team |
| P0 | Add persistence for ObservabilityRuntime traces — either to a dedicated table or an external observability platform (e.g., OpenTelemetry export) | Backend Team |
| P1 | Define runtime classes for Auth, Credits, Notifications, Audit, and Media/Assets modules to establish consistent cross-cutting concerns (caching, validation, telemetry) | Architect |
| P1 | Create a factory function `getHighAvailabilityGatewayRuntime()` that wires all 12 dependencies and provides singleton access | Backend Team |
| P2 | Consider Redis-backed caching for SEO and Homepage caches to survive restarts in multi-instance deployments | DevOps |
| P2 | Clarify the role of `SectionRuntime` vs `SectionRegistry` — remove dead code or document the distinction | Backend Team |
| P3 | Document the runtime communication map in `AGENTS.md` or architecture docs for developer onboarding | Tech Writer |

---

## Compliance

**FAIL**

The runtime layer fails CMS-01 Finalization due to:
- 3 critical runtime systems (Navigation, Usage, Observability) are purely in-memory with no persistence, meaning data loss on every server restart
- 5 modules lack runtime classes entirely, creating an inconsistent architectural pattern
- The HA Gateway runtime has no factory function, making it difficult to instantiate and test

Resolution of P0 items (navigation persistence, usage persistence, observability persistence) is required before passing compliance. P1 items (runtime class coverage, gateway factory) should be addressed in the same sprint.
