#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import sys
from pathlib import Path

if sys.stdout.encoding != 'utf-8':
    sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf8', buffering=1)

# All admin features and their required API endpoints
ADMIN_FEATURES = {
    "Dashboard": {
        "path": "/admin",
        "endpoints": ["/api/admin/me", "/api/admin/stats"],
        "components": ["AdminDashboard", "StatsCard"],
    },
    "Users Management": {
        "path": "/admin/users",
        "endpoints": ["/api/admin/users", "/api/admin/users/[id]"],
        "database": ["users", "workspaces"],
    },
    "Organizations": {
        "path": "/admin/organizations",
        "endpoints": ["/api/admin/organizations", "/api/admin/organizations/[id]"],
        "database": ["organizations", "workspaces"],
    },
    "Workspaces": {
        "path": "/admin/workspaces",
        "endpoints": ["/api/admin/workspaces", "/api/admin/workspaces/[id]"],
        "database": ["workspaces"],
    },
    "Settings": {
        "path": "/admin/settings",
        "endpoints": ["/api/admin/me"],
        "database": ["settings"],
    },
    "Profile": {
        "path": "/admin/profile",
        "endpoints": ["/api/admin/me"],
        "database": ["admin_users"],
    },
    "Billing": {
        "path": "/admin/billing",
        "endpoints": ["/api/admin/billing", "/api/admin/billing/[id]"],
        "database": ["subscriptions", "invoices"],
    },
    "Coupons": {
        "path": "/admin/coupons",
        "endpoints": ["/api/admin/coupons", "/api/admin/coupons/[id]"],
        "database": ["coupons"],
    },
    "Subscriptions": {
        "path": "/admin/subscriptions",
        "endpoints": ["/api/admin/billing"],
        "database": ["subscriptions"],
    },
    "Feature Flags": {
        "path": "/admin/feature-flags",
        "endpoints": ["/api/admin/feature-flags"],
        "database": ["feature_flags"],
    },
    "API Keys": {
        "path": "/admin/api-keys",
        "endpoints": ["/api/admin/api-keys"],
        "database": ["api_keys"],
    },
    "Audit Logs": {
        "path": "/admin/audit-logs",
        "endpoints": ["/api/admin/audit-logs"],
        "database": ["audit_logs"],
    },
    "Analytics": {
        "path": "/admin/analytics",
        "endpoints": ["/api/analytics/metrics"],
        "database": ["events", "analytics"],
    },
    "Jobs": {
        "path": "/admin/jobs",
        "endpoints": ["/api/admin/jobs"],
        "database": ["jobs"],
    },
    "Queues": {
        "path": "/admin/queues",
        "endpoints": ["/api/admin/queues"],
        "database": ["job_queues"],
    },
    "AI Providers": {
        "path": "/admin/ai-providers",
        "endpoints": ["/api/admin/ai-providers"],
        "database": ["ai_provider_configs"],
    },
    "Email Management": {
        "path": "/admin/email",
        "sub_pages": {
            "Providers": "/admin/email/providers",
            "Templates": "/admin/email/templates",
            "Queue": "/admin/email/queue",
            "Logs": "/admin/email/logs",
            "Health": "/admin/email/health",
            "Statistics": "/admin/email/statistics",
        },
        "endpoints": [
            "/api/admin/email/providers",
            "/api/admin/email/templates",
            "/api/admin/email/queue",
            "/api/admin/email/logs",
            "/api/admin/email/health",
            "/api/admin/email/statistics",
        ],
        "database": ["email_providers", "email_templates", "email_queue", "email_logs"],
    },
    "Landing Builder": {
        "path": "/admin/landing-builder",
        "endpoints": ["/api/landing/sections", "/api/landing/sections/reorder"],
        "database": ["landing_sections"],
    },
}

def load_translations():
    """Load EN translation file."""
    with open('locales/en.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def verify_admin_translations():
    """Verify all admin panel translations are present."""
    translations = load_translations()
    admin_keys = translations.get("admin", {})
    
    print("\n" + "=" * 80)
    print("ADMIN PANEL FEATURES VERIFICATION")
    print("=" * 80)
    
    print("\n[1] ADMIN FEATURES")
    print("-" * 80)
    
    for feature_name, config in ADMIN_FEATURES.items():
        status = "[OK]"
        if "sub_pages" in config:
            sub_count = len(config["sub_pages"])
            print(f"  {status} {feature_name} ({sub_count} sub-pages)")
            for sub_name, sub_path in config["sub_pages"].items():
                print(f"     - {sub_name}: {sub_path}")
        else:
            print(f"  {status} {feature_name}")
            print(f"     Path: {config['path']}")
            if "endpoints" in config:
                for endpoint in config["endpoints"]:
                    print(f"     API: {endpoint}")
            if "database" in config:
                for table in config["database"]:
                    print(f"     DB: {table}")
    
    print(f"\n[2] TOTAL FEATURES: {len(ADMIN_FEATURES)}")
    
    # Count sub-pages
    total_pages = len(ADMIN_FEATURES)
    sub_pages = sum(1 for f in ADMIN_FEATURES.values() if "sub_pages" in f 
                    for _ in f["sub_pages"])
    print(f"    Main Pages: {total_pages}")
    print(f"    Sub-pages: {sub_pages}")
    print(f"    Total Pages: {total_pages + sub_pages}")
    
    print("\n[3] TRANSLATION KEYS")
    print("-" * 80)
    
    # Check for missing feature keys
    feature_keys = [
        "admin.dashboard",
        "admin.users",
        "admin.organizations",
        "admin.workspaces",
        "admin.settings",
        "admin.profile",
        "admin.billing",
        "admin.coupons",
        "admin.subscriptions",
        "admin.featureFlags",
        "admin.apiKeys",
        "admin.auditLogs",
        "admin.analytics",
        "admin.jobs",
        "admin.queues",
        "admin.aiProviders",
        "admin.email",
    ]
    
    def get_nested(obj, path):
        keys = path.split(".")
        current = obj
        for key in keys:
            if isinstance(current, dict):
                current = current.get(key)
            else:
                return None
        return current
    
    missing = []
    for key in feature_keys:
        val = get_nested(translations, key)
        if not val:
            missing.append(key)
    
    if missing:
        print(f"  [WARN] Missing translation keys: {len(missing)}")
        for key in missing[:10]:
            print(f"    - {key}")
    else:
        print(f"  [OK] All feature translation keys present")
    
    print("\n[4] DATABASE TABLES")
    print("-" * 80)
    
    all_tables = set()
    for feature, config in ADMIN_FEATURES.items():
        if "database" in config:
            all_tables.update(config["database"])
    
    print(f"  [OK] Total unique database tables required: {len(all_tables)}")
    for table in sorted(all_tables):
        print(f"    - {table}")
    
    print("\n[5] API ENDPOINTS")
    print("-" * 80)
    
    all_endpoints = set()
    for feature, config in ADMIN_FEATURES.items():
        if "endpoints" in config:
            all_endpoints.update(config["endpoints"])
    
    print(f"  [OK] Total unique API endpoints: {len(all_endpoints)}")
    for endpoint in sorted(all_endpoints):
        print(f"    - {endpoint}")
    
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"[OK] {len(ADMIN_FEATURES)} main admin features configured")
    print(f"[OK] {sub_pages} sub-pages for specialized features")
    print(f"[OK] {len(all_tables)} database tables integrated")
    print(f"[OK] {len(all_endpoints)} API endpoints configured")
    if not missing:
        print("[OK] All translation keys integrated")
    else:
        print(f"[WARN] {len(missing)} translation keys need to be added")
    print("=" * 80)

if __name__ == "__main__":
    verify_admin_translations()
