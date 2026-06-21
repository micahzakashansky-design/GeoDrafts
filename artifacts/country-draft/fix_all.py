import os
import re

files = [
    "src/pages/normal/NormalUI.tsx",
    "src/pages/daily/DailyUI.tsx",
    "src/pages/double/DoubleUI.tsx",
    "src/pages/party/PartyUI.tsx",
    "src/pages/sabotage/SabotageUI.tsx",
    "src/pages/guess/GuessUI.tsx"
]

imports = """import { RATINGS, ARCHETYPES, BONUS_PATHS, getAchievementIcon } from "@/lib/achievements";
import { getRating, getCountryArchetype, getBonusPath, computeSizePopBonus } from "@/lib/achievements-logic";
"""

for file in files:
    with open(file, "r") as f:
        content = f.read()

    # 1. Add imports if they don't exist
    if 'import { RATINGS' not in content:
        # insert right after from "framer-motion";
        content = content.replace('from "framer-motion";\n', 'from "framer-motion";\n' + imports)

    # 2. Fix JSX rendering
    # Look for the `<div className="p-3 bg-` that precedes the {bPath === "agricultural"
    # We can just match from `<div className="p-3` up to `</div>\n              <div>`
    content = re.sub(
        r'<div className="p-3 bg-[a-zA-Z0-9\-/]+ rounded-xl shrink-0">\{bPath === "agricultural"[^<]*<[^>]+>[^<]*:[^<]*<[^>]+>[^<]*:[^<]*<[^>]+>\}</div>',
        r'<div className="p-3 bg-muted rounded-xl shrink-0 text-foreground">{bPath.icon}</div>',
        content,
        flags=re.DOTALL
    )

    # Replace the text rendering part
    content = re.sub(
        r'<div><h3 className="font-bold text-foreground text-sm md:text-base mb-1">\{bPath === "agricultural"[^\}]+}</h3><p className="text-xs text-muted-foreground">\{bPath === "agricultural"[^\}]+}</p></div>',
        r'<div><h3 className="font-bold text-foreground text-sm md:text-base mb-1">{bPath.name}</h3><p className="text-xs text-muted-foreground">{bPath.desc}</p></div>',
        content,
        flags=re.DOTALL
    )

    with open(file, "w") as f:
        f.write(content)
    print(f"Fixed {file}")

# Fix the sidebars
sidebars = [
    "src/pages/normal/SidebarRoster.tsx",
    "src/pages/party/SidebarRoster.tsx",
    "src/pages/sabotage/SidebarRoster.tsx",
    "src/pages/party/PartyGame.tsx",
    "src/pages/sabotage/SabotageGame.tsx"
]

for sidebar in sidebars:
    if os.path.exists(sidebar):
        with open(sidebar, "r") as f:
            content = f.read()
        
        # remove computeSizePopBonus from ./NormalUI or ./PartyUI
        content = re.sub(r'computeSizePopBonus,\s*', '', content)
        content = re.sub(r',\s*computeSizePopBonus', '', content)
        content = re.sub(r'{\s*computeSizePopBonus\s*}\s*from\s*"./(?:NormalUI|PartyUI|SabotageUI)";\n?', '', content)

        # add import from achievements-logic
        if "computeSizePopBonus" in content and 'import { computeSizePopBonus } from "@/lib/achievements-logic"' not in content:
            content = 'import { computeSizePopBonus } from "@/lib/achievements-logic";\n' + content
        
        with open(sidebar, "w") as f:
            f.write(content)
        print(f"Fixed sidebar {sidebar}")

