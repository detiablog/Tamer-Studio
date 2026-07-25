import json

# Read the file
with open(r'D:\Project AI Website Affiliate\Tamer\Tamer-Studio\locales\id.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# The admin section is currently flat. We need to create nested objects for certain keys.
admin = data['admin']

# Define which keys should become nested objects
nested_sections = {
    'analytics': [],
    'apiKeys': [],
    'auditLogs': [],
    'billing': [],
    'coupons': [],
    'featureFlags': [],
    'profile': [],
    'subscriptions': []
}

# Extract keys that belong to nested sections
to_remove = []
for key in list(admin.keys()):
    for section in nested_sections:
        if key.startswith(section + '.'):
            nested_sections[section].append((key, admin[key]))
            to_remove.append(key)

# Remove extracted keys from flat admin
for key in to_remove:
    del admin[key]

# Create nested objects
for section, keys in nested_sections.items():
    if keys:
        nested_obj = {}
        for full_key, value in keys:
            # Extract the sub-key after the section name
            sub_key = full_key[len(section) + 1:]
            nested_obj[sub_key] = value
        admin[section] = nested_obj

# Write back
with open(r'D:\Project AI Website Affiliate\Tamer\Tamer-Studio\locales\id.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Restructured id.json admin section")
