import re

with open('frontend/src/pages/MapModule.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace root div
content = content.replace(
    '<div className="pt-6 px-5 pb-24 flex flex-col flex-1 overflow-y-auto">',
    '<div className="pt-6 px-5 lg:px-8 pb-24 md:pb-8 flex flex-col lg:flex-row flex-1 overflow-hidden h-full gap-6">'
)

# Replace Map Container div
content = content.replace(
    '<div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-sm mb-5 bg-brand-bg">',
    '<div className="relative w-full lg:w-2/3 h-[50vh] lg:h-full rounded-3xl overflow-hidden shadow-sm flex-shrink-0 bg-brand-bg order-2 lg:order-1">'
)

# Extract sections
header_idx = content.find('      {/* Header */}')
map_idx = content.find('      {/* Map Container */}')
farm_idx = content.find('      {activeFarm ? (')

if header_idx == -1 or map_idx == -1 or farm_idx == -1:
    print('Failed to find indices')
    exit(1)

pre_header = content[:header_idx]
info_panel = content[header_idx:map_idx]
map_container = content[map_idx:farm_idx]
post_farm = content[farm_idx:]

# Ensure we remove the trailing parts correctly
# We want to remove the last 2 `</div>` which close the root div
post_farm = post_farm[:post_farm.rfind('</div>')]
post_farm = post_farm[:post_farm.rfind('</div>')]

new_content = (
    pre_header +
    map_container +
    '      {/* Information Drawer / Right Panel on Desktop */}\n' +
    '      <div className="lg:w-1/3 flex flex-col overflow-y-auto order-1 lg:order-2 h-full pb-4 pr-1">\n' +
    info_panel +
    post_farm +
    '      </div>\n    </div>\n  );\n}\n\nexport default MapModule;\n'
)

with open('frontend/src/pages/MapModule.jsx', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('Success')
