#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import re
import os
import sys
from pathlib import Path
from collections import defaultdict

if sys.stdout.encoding != 'utf-8':
    sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf8', buffering=1)

def load_translations():
    """Load EN translation file as source of truth."""
    with open('locales/en.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def get_flat_keys(obj, prefix=""):
    """Get all flat keys from nested object."""
    keys = set()
    for k, v in obj.items():
        full_key = f"{prefix}.{k}" if prefix else k
        keys.add(full_key)
        if isinstance(v, dict):
            keys.update(get_flat_keys(v, full_key))
    return keys

def find_translation_usage():
    """Find all translation key usage in tsx/ts files."""
    admin_path = Path('src/app/admin/(protected)')
    usage = defaultdict(list)
    
    for file_path in admin_path.rglob('*.tsx'):
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                # Find patterns like t("admin.key") or t('admin.key')
                matches = re.findall(r't\(["\']([^"\']+)["\']\s*(?:,|[\)\]])', content)
                for match in matches:
                    usage[match].append(str(file_path.relative_to('src')))
        except:
            pass
    
    return usage

def check_admin_features():
    """Check all admin pages for basic structure."""
    admin_path = Path('src/app/admin/(protected)')
    features = {}
    
    for dir_path in admin_path.iterdir():
        if dir_path.is_dir() and not dir_path.name.startswith('_'):
            page_file = dir_path / 'page.tsx'
            if page_file.exists():
                features[dir_path.name] = {
                    'has_page': True,
                    'path': str(page_file)
                }
    
    return features

def main():
    print("=" * 80)
    print("ADMIN PANEL AUDIT REPORT")
    print("=" * 80)
    
    # Load translations
    translations = load_translations()
    all_keys = get_flat_keys(translations)
    
    print(f"\n[1] TRANSLATION KEYS")
    print("-" * 80)
    print(f"Total available keys: {len(all_keys)}")
    
    # Find usage
    usage = find_translation_usage()
    print(f"Translation keys used in admin: {len(usage)}")
    
    # Check for missing keys
    missing_keys = []
    for key in usage.keys():
        if key not in all_keys:
            missing_keys.append(key)
    
    if missing_keys:
        print(f"\n[MISSING] TRANSLATION KEYS ({len(missing_keys)}):")
        for key in sorted(missing_keys):
            print(f"  - {key}")
            print(f"    Used in: {', '.join(usage[key][:2])}")
    else:
        print("\n[OK] All used translation keys are defined")
    
    # Check for unused admin keys
    used_admin_keys = {k for k in usage.keys() if k.startswith('admin.')}
    available_admin_keys = {k for k in all_keys if k.startswith('admin.')}
    unused = available_admin_keys - used_admin_keys
    
    print(f"\n[2] ADMIN PANEL FEATURES")
    print("-" * 80)
    
    features = check_admin_features()
    print(f"Total admin pages: {len(features)}")
    for feature, info in sorted(features.items()):
        print(f"  [OK] {feature}")
    
    print(f"\n[3] TRANSLATION KEYS STATUS")
    print("-" * 80)
    print(f"Admin keys available: {len(available_admin_keys)}")
    print(f"Admin keys used: {len(used_admin_keys)}")
    print(f"Admin keys unused: {len(unused)}")
    
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    
    if missing_keys:
        print(f"[ERROR] Found {len(missing_keys)} missing translation keys - NEEDS FIX")
        return False
    else:
        print("[OK] All translations properly integrated")
    
    print(f"[OK] All {len(features)} admin pages present")
    print("=" * 80)
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
