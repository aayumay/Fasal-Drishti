import os, re

count = 0
d = 'frontend/src'
files = [os.path.join(r, f) for r, dirs, fs in os.walk(d) for f in fs if f.endswith('.jsx')]

for path in files:
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Add font-serif tracking-tight to h1 and h2
    new_content = re.sub(r'<h1\s+className="(?!(?:.*?)font-serif)', r'<h1 className="font-serif tracking-tight ', content)
    new_content = re.sub(r'<h2\s+className="(?!(?:.*?)font-serif)', r'<h2 className="font-serif tracking-tight ', new_content)
    
    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        count += 1
        print(f'Updated {path}')

print(f'Total updated: {count}')
