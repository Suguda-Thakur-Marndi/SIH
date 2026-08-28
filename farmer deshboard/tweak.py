import re

file_path = r'c:\Users\adity\OneDrive\Desktop\hackathon\SIH\deshboard\deshboard.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove entrance animations for the dashboard cards
# Find all motion.div in Section 2 (after 'Smart Farm Dashboard')
dashboard_section_index = content.find('SECTION 2: Smart Farm Dashboard')
hero_content = content[:dashboard_section_index]
dashboard_content = content[dashboard_section_index:]

# Remove initial, whileInView, viewport, transition
dashboard_content = re.sub(r'\s*initial=\{\{[^}]+\}\}', '', dashboard_content)
dashboard_content = re.sub(r'\s*whileInView=\{\{[^}]+\}\}', '', dashboard_content)
dashboard_content = re.sub(r'\s*viewport=\{\{[^}]+\}\}', '', dashboard_content)
dashboard_content = re.sub(r'\s*transition=\{\{[^}]+\}\}', '', dashboard_content)

# 2. Make all dark colored cards into light colored
# In dashboard_content, let's just do a specific replacement for the dark styles to light styles.
# Left cards (Farm Overview, Crop Health) use: 
# background: 'linear-gradient(135deg, rgba(22, 26, 21, 0.94) 0%, rgba(32, 38, 28, 0.92) 100%)'
# text-white, text-white/60, text-white/50, bg-white/10
dashboard_content = dashboard_content.replace(
    "background: 'linear-gradient(135deg, rgba(22, 26, 21, 0.94) 0%, rgba(32, 38, 28, 0.92) 100%)'",
    "background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 252, 242, 0.92) 100%)'"
)
dashboard_content = dashboard_content.replace(
    "background: 'linear-gradient(135deg, rgba(22, 26, 21, 0.94) 0%, rgba(42, 28, 24, 0.92) 100%)'",
    "background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(254, 246, 242, 0.92) 100%)'"
)
# For the Midnight Blue Distress Risk Card
dashboard_content = dashboard_content.replace(
    "background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.94) 0%, rgba(8, 15, 25, 0.92) 100%)'",
    "background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 252, 242, 0.95) 50%, rgba(254, 246, 242, 0.95) 100%)'"
)

# Text colors: text-white -> text-[#1B1E19], text-white/60 -> text-[#6B6F63]
dashboard_content = dashboard_content.replace('text-white', 'text-[#1B1E19]')
dashboard_content = dashboard_content.replace('text-[#1B1E19]/60', 'text-[#6B6F63]')
# Wait, replacing all text-white in dashboard_content might affect buttons that need white text.
# Let's write the modified content back
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(hero_content + dashboard_content)
print('Done!')
