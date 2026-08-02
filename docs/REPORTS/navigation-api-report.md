# Navigation API Report

**Sprint:** CMS-01 B7 — Navigation Runtime  
**Phase:** Phase 11 — Navigation API  
**Date:** 2026-07-28  
**Status:** COMPLETE  

---

## Executive Summary

The Navigation API has been created as a centralized API for all navigation operations. It provides endpoints for menus, breadcrumbs, navigation tree, and route metadata.

---

## 1. API Endpoints

### 1.1 GET /api/navigation
Retrieve all navigation items with optional filtering and pagination.

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `action` | string | `item` (default), `menu`, `breadcrumbs`, `active`, `tree`, `registry`, `metadata`, `cache-stats`, `sitemap`, `robots` |
| `id` | string | Item ID for single item lookup |
| `position` | string | Filter by position (header, sidebar, footer, dashboard, landing) |
| `menuId` | string | Filter by menu ID |
| `parentId` | string | Filter by parent ID |
| `visible` | boolean | Filter by visibility |
| `group` | string | Filter by group |
| `route` | string | Route for breadcrumb/metadata lookup |
| `pathname` | string | Pathname for active route detection |
| `locale` | string | Locale for localization |
| `page` | number | Pagination page |
| `limit` | number | Pagination limit |

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 1.2 POST /api/navigation
Register a new navigation item or perform other actions.

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `action` | string | `register`, `create-menu`, `sync-cms`, `invalidate-cache`, `set-locale` |

**Body (register):**
```json
{
  "id": "dashboard",
  "module": "dashboard",
  "position": "sidebar",
  "type": "page",
  "title": "Dashboard",
  "titleKey": "dashboard.dashboard",
  "route": "/dashboard",
  "order": 0,
  "permissions": ["dashboard.view"],
  "featureFlags": [],
  "localization": {
    "namespace": "navigation",
    "fallbackLocale": "en",
    "translations": { "en": "Dashboard", "id": "Dasbor" }
  },
  "seo": {
    "canonicalRoute": "/dashboard",
    "priority": 0.8,
    "robotsVisibility": "index",
    "sitemapVisibility": true
  },
  "breadcrumb": {
    "type": "auto",
    "generateAutomatically": true
  },
  "metadata": {}
}
```

**Response:**
```json
{
  "success": true,
  "data": { ...navigation item... }
}
```

### 1.3 PUT /api/navigation
Update navigation items or menus.

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `action` | string | `update-item`, `update-menu` |

**Body (update-item):**
```json
{
  "id": "dashboard",
  "title": "Updated Dashboard",
  "order": 5,
  "permissions": ["dashboard.view", "dashboard.edit"]
}
```

**Response:**
```json
{
  "success": true,
  "data": { ...updated navigation item... }
}
```

### 1.4 DELETE /api/navigation
Remove navigation items or menus.

**Query Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `action` | string | `remove-item`, `remove-menu` |
| `id` | string | Item or menu ID to remove |

**Response:**
```json
{
  "success": true,
  "data": true
}
```

---

## 2. API Actions

### 2.1 Navigation Items

| Action | Method | Endpoint | Description |
|---|---|---|---|
| List items | GET | `/api/navigation` | Get all navigation items |
| Get item | GET | `/api/navigation?action=item&id=xxx` | Get a specific item |
| Register item | POST | `/api/navigation?action=register` | Register a new item |
| Update item | PUT | `/api/navigation?action=update-item` | Update an existing item |
| Remove item | DELETE | `/api/navigation?action=remove-item&id=xxx` | Remove an item |

### 2.2 Navigation Menus

| Action | Method | Endpoint | Description |
|---|---|---|---|
| List menus | GET | `/api/navigation?action=menu` | Get all menus |
| Get menu | GET | `/api/navigation?action=menu&id=xxx` | Get a specific menu |
| Create menu | POST | `/api/navigation?action=create-menu` | Create a new menu |
| Update menu | PUT | `/api/navigation?action=update-menu` | Update an existing menu |
| Delete menu | DELETE | `/api/navigation?action=remove-menu&id=xxx` | Remove a menu |

### 2.3 Breadcrumbs

| Action | Method | Endpoint | Description |
|---|---|---|---|
| Get breadcrumbs | GET | `/api/navigation?action=breadcrumbs&route=/xxx` | Get breadcrumbs for a route |

### 2.4 Active Route

| Action | Method | Endpoint | Description |
|---|---|---|---|
| Get active route | GET | `/api/navigation?action=active&pathname=/xxx` | Get active route info |

### 2.5 Navigation Tree

| Action | Method | Endpoint | Description |
|---|---|---|---|
| Get tree | GET | `/api/navigation?action=tree&parentId=xxx` | Get navigation tree |

### 2.6 Registry

| Action | Method | Endpoint | Description |
|---|---|---|---|
| List entries | GET | `/api/navigation?action=registry` | Get all registry entries |
| Get entry | GET | `/api/navigation?action=registry&id=xxx` | Get a registry entry |

### 2.7 Route Metadata

| Action | Method | Endpoint | Description |
|---|---|---|---|
| Get metadata | GET | `/api/navigation?action=metadata&route=/xxx` | Get route metadata |

### 2.8 Cache Operations

| Action | Method | Endpoint | Description |
|---|---|---|---|
| Get cache stats | GET | `/api/navigation?action=cache-stats` | Get cache statistics |
| Invalidate cache | POST | `/api/navigation?action=invalidate-cache` | Invalidate cache |

### 2.9 CMS Sync

| Action | Method | Endpoint | Description |
|---|---|---|---|
| Sync CMS | POST | `/api/navigation?action=sync-cms` | Sync navigation from CMS |

### 2.10 Locale Operations

| Action | Method | Endpoint | Description |
|---|---|---|---|
| Set locale | POST | `/api/navigation?action=set-locale` | Set the active locale |

### 2.11 Sitemap Operations

| Action | Method | Endpoint | Description |
|---|---|---|---|
| Get sitemap entries | GET | `/api/navigation?action=sitemap` | Get sitemap entries |

### 2.12 Robots.txt

| Action | Method | Endpoint | Description |
|---|---|---|---|
| Get robots.txt | GET | `/api/navigation?action=robots` | Get robots.txt content |

---

## 3. API Response Format

All API responses follow the `NavigationAPIResponse<T>` format:

```json
{
  "success": true,
  "data": { ... },
  "error": null,
  "errorCode": null,
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### 3.1 Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### 3.2 Error Response
```json
{
  "success": false,
  "data": null,
  "error": "Error message",
  "errorCode": "ERROR_CODE"
}
```

### 3.3 Validation Error Response
```json
{
  "success": false,
  "data": null,
  "error": "Invalid input",
  "errorCode": "VALIDATION_ERROR",
  "details": {
    "fieldErrors": {
      "fieldName": ["Error message"]
    }
  }
}
```

---

## 4. API Implementation

The Navigation API is implemented as a centralized class (`NavigationAPI`) that wraps all navigation operations. It provides a unified interface for:

- **Menu Management** — Create, read, update, delete menus
- **Item Management** — Create, read, update, delete navigation items
- **Breadcrumb Generation** — Generate breadcrumbs from route metadata
- **Active Route Detection** — Detect the currently active route
- **Navigation Tree** — Get the hierarchical navigation tree
- **Registry Lookup** — Query the Navigation Registry
- **Route Metadata** — Get SEO and breadcrumb metadata for routes
- **Cache Management** — Get cache stats and invalidate cache
- **CMS Sync** — Sync navigation from the CMS Engine
- **Locale Management** — Set the active locale
- **Sitemap Generation** — Get sitemap entries
- **Robots.txt Generation** — Get robots.txt content

---

## 5. Integration Points

### 5.1 Navigation Runtime
The API uses the Navigation Runtime for all navigation operations.

### 5.2 Navigation Registry
The API uses the Navigation Registry for entry lookup and registration.

### 5.3 Menu Management
The API uses the Menu Management system for menu operations.

### 5.4 Breadcrumb Runtime
The API uses the Breadcrumb Runtime for breadcrumb generation.

### 5.5 Permission-Aware Navigation
The API uses the Permission-Aware Navigation for filtering.

### 5.6 Navigation Cache
The API uses the Navigation Cache for caching results.

### 5.7 CMS Integration
The API uses the CMS Integration for CMS sync operations.

### 5.8 Localization Integration
The API uses the Localization Integration for locale operations.

### 5.9 SEO Integration
The API uses the SEO Integration for sitemap and robots.txt operations.

---

## 6. Benefits

1. **Centralized Access** — All navigation data is accessible through a single API
2. **Consistent Interface** — All operations follow the same response format
3. **Filtering and Pagination** — Items can be filtered and paginated
4. **CRUD Operations** — Full create, read, update, delete support
5. **CMS Integration** — API supports CMS sync operations
6. **Cache Management** — API supports cache inspection and invalidation
7. **SEO Support** — API supports sitemap and robots.txt generation
8. **Locale Support** — API supports locale switching
9. **Permission-Aware** — API supports permission-based filtering
10. **Type-Safe** — API uses TypeScript types for all inputs and outputs

---

## 7. Conclusion

The Navigation API provides a centralized, consistent interface for all navigation operations. It supports menus, breadcrumbs, navigation tree, route metadata, cache management, CMS sync, locale management, sitemap generation, and robots.txt generation. All navigation data is accessible through a single API endpoint.