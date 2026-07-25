import json
import re

# Extract all t("...") keys from admin pages
import glob

keys_used = set()
for filepath in glob.glob(r'D:\Project AI Website Affiliate\Tamer\Tamer-Studio\src\app\admin\**\*.tsx', recursive=True):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    matches = re.findall(r't\("([^"]+)"', content)
    keys_used.update(matches)

# Filter to admin keys only
admin_keys = [k for k in keys_used if k.startswith('admin.')]

# Read en.json
with open(r'D:\Project AI Website Affiliate\Tamer\Tamer-Studio\locales\en.json', 'r', encoding='utf-8') as f:
    en_data = json.load(f)

# Read id.json
with open(r'D:\Project AI Website Affiliate\Tamer\Tamer-Studio\locales\id.json', 'r', encoding='utf-8') as f:
    id_data = json.load(f)

# Function to set a nested key in a dict
def set_nested(d, key, value):
    parts = key.split('.')
    current = d
    for part in parts[:-1]:
        if part not in current:
            current[part] = {}
        elif not isinstance(current[part], dict):
            current[part] = {}
        current = current[part]
    current[parts[-1]] = value

# Function to get a nested key from a dict
def get_nested(d, key):
    parts = key.split('.')
    current = d
    for part in parts:
        if isinstance(current, dict) and part in current:
            current = current[part]
        else:
            return None
    return current

# Add all admin keys to both locale files
for key in admin_keys:
    # Check if key already exists
    if get_nested(en_data, key) is None:
        # Use the key itself as fallback (last part after last dot)
        fallback = key.split('.')[-1]
        set_nested(en_data, key, fallback)
        print(f"Added en: {key} = {fallback}")
    
    if get_nested(id_data, key) is None:
        fallback = key.split('.')[-1]
        set_nested(id_data, key, fallback)
        print(f"Added id: {key} = {fallback}")

# Write back
with open(r'D:\Project AI Website Affiliate\Tamer\Tamer-Studio\locales\en.json', 'w', encoding='utf-8') as f:
    json.dump(en_data, f, indent=2, ensure_ascii=False)

with open(r'D:\Project AI Website Affiliate\Tamer\Tamer-Studio\locales\id.json', 'w', encoding='utf-8') as f:
    json.dump(id_data, f, indent=2, ensure_ascii=False)

print("\nDone! Added missing keys to both locale files.")
