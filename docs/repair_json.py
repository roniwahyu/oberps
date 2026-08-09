"""repair_json.py - Repair truncated JSON from LLM response"""
import re, json, sys

with open('docs/rps_raw_response.txt', encoding='utf-8', errors='replace') as f:
    text = f.read()

# Strip think block
stripped = re.sub(r'<think>[\s\S]*?</think>', '', text, flags=re.IGNORECASE).strip()
print('Stripped:', len(stripped), 'chars')

open_b = stripped.count('{')
close_b = stripped.count('}')
missing = open_b - close_b
print(f'Open: {open_b}, Close: {close_b}, Missing: {missing}')

# Strategy: cut at last complete string value ending with "
# then close the JSON properly
def try_repair(text, suffix):
    try:
        return json.loads(text + suffix)
    except:
        return None

# Find last position where we have a complete key-value pair
# Look for pattern: ,"KEY":"VALUE" where VALUE ends with "
# Try adding just }
result = try_repair(stripped, '}' * missing)
if result:
    print('Repair OK: simple close braces. Fields:', len(result))
else:
    # Find last complete M_ field
    # Look for last occurrence of complete string field
    last_good = None
    for i in range(len(stripped), len(stripped)-2000, -1):
        chunk = stripped[:i]
        r = try_repair(chunk, '}')
        if r:
            last_good = (i, r)
            break
    
    if last_good:
        print(f'Repaired at position {last_good[0]}, fields: {len(last_good[1])}')
        result = last_good[1]
    else:
        print('Could not repair JSON automatically')
        sys.exit(1)

# Show what fields we got
print('Fields found:', list(result.keys()))
print('M-fields count:', len([k for k in result if k.startswith('M') and '_' in k]))

# Save repaired JSON
with open('docs/rps_repaired.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)
print('Saved: docs/rps_repaired.json')
print('SUCCESS')
