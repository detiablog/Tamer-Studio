import json

# Read the file
with open(r'D:\Project AI Website Affiliate\Tamer\Tamer-Studio\locales\en.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

admin = data['admin']

# Define which keys should become nested objects
nested_sections = ['analytics', 'apiKeys', 'auditLogs', 'billing', 'coupons', 'featureFlags', 'profile', 'subscriptions']

# Extract all keys
all_keys = list(admin.keys())

# For each nested section, collect all keys that start with that section name + '.'
# and also remove the base key if it's just a string value
for section in nested_sections:
    keys_to_move = []
    base_key_found = False
    
    for key in all_keys:
        if key == section:
            base_key_found = True
        elif key.startswith(section + '.'):
            keys_to_move.append(key)
    
    # If we have nested keys, we need to create a nested object
    if keys_to_move:
        nested_obj = {}
        for full_key in keys_to_move:
            sub_key = full_key[len(section) + 1:]
            nested_obj[sub_key] = admin[full_key]
            del admin[full_key]
        
        # Remove base key if it exists and is just a string label
        if base_key_found and isinstance(admin[section], str):
            del admin[section]
        
        admin[section] = nested_obj

# Write back
with open(r'D:\Project AI Website Affiliate\Tamer\Tamer-Studio\locales\en.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("Restructured en.json admin section")
