import os
import re

# 1. Fix src/lib/achievements-logic.ts import
logic_file = "src/lib/achievements-logic.ts"
with open(logic_file, "r") as f:
    content = f.read()
content = content.replace('import { Category, Country } from "@/types";', 'import { type Category, type Country } from "@/data/countries";')
with open(logic_file, "w") as f:
    f.write(content)

# 2. Fix the bPath.name in toUnlock.push
files = [
    "src/pages/normal/NormalUI.tsx",
    "src/pages/daily/DailyUI.tsx",
    "src/pages/double/DoubleUI.tsx",
    "src/pages/party/PartyUI.tsx",
    "src/pages/sabotage/SabotageUI.tsx",
    "src/pages/guess/GuessUI.tsx"
]
for file in files:
    with open(file, "r") as f:
        content = f.read()
    content = content.replace('toUnlock.push(bPath)', 'toUnlock.push(bPath.name)')
    with open(file, "w") as f:
        f.write(content)

# 3. Fix Game and Sidebar files imports
games_and_sidebars = [
    "src/pages/normal/NormalGame.tsx",
    "src/pages/daily/DailyGame.tsx",
    "src/pages/double/DoubleDraftGame.tsx",
    "src/pages/party/PartyGame.tsx",
    "src/pages/sabotage/SabotageGame.tsx",
    "src/pages/normal/SidebarRoster.tsx",
    "src/pages/daily/SidebarRoster.tsx",
    "src/pages/double/SidebarRoster.tsx",
    "src/pages/party/SidebarRoster.tsx",
    "src/pages/sabotage/SidebarRoster.tsx",
    "src/pages/guess/SidebarRoster.tsx"
]

for file in games_and_sidebars:
    if os.path.exists(file):
        with open(file, "r") as f:
            content = f.read()
        
        # Remove computeSizePopBonus from any local import
        content = re.sub(r',\s*computeSizePopBonus', '', content)
        content = re.sub(r'computeSizePopBonus,\s*', '', content)
        # If the import became empty `{ } from "./...UI"`, remove the line
        content = re.sub(r'import\s*{\s*}\s*from\s*"\./[^"]+";\n?', '', content)

        if "computeSizePopBonus" in content and 'import { computeSizePopBonus } from "@/lib/achievements-logic"' not in content:
            content = 'import { computeSizePopBonus } from "@/lib/achievements-logic";\n' + content

        with open(file, "w") as f:
            f.write(content)

