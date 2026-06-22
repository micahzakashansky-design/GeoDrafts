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

replacement = """export type Archetype = { name: string; icon: React.ReactNode; desc: string };

export function getRatingData(total: number) {
  const name = getRating(total);
  const data = RATINGS.find(r => r.name === name)!;
  return { label: data.name, color: data.color, desc: data.desc, icon: getAchievementIcon(data.name) };
}

export function getArchetypeData(roster: Partial<Record<Category, Country>>): Archetype {
  const name = getCountryArchetype(roster);
  const data = ARCHETYPES.find(a => a.name === name)!;
  return { name: data.name, desc: data.desc, icon: getAchievementIcon(data.name) };
}
"""

for file in files:
    with open(file, "r") as f:
        content = f.read()

    # Find the start of the getRating block
    start_match = re.search(r"export function getRating\([^)]*\)[^{]*{", content)
    if not start_match:
        print(f"Start not found in {file}")
        continue
    start_idx = start_match.start()

    # Find the end of the getCountryArchetype block
    end_match = re.search(r"export function getCountryArchetype[\s\S]*?return { name: \"Balanced Republic\"[\s\S]*?;\n}", content)
    if not end_match:
        print(f"End not found in {file}")
        continue
    end_idx = end_match.end()

    new_content = content[:start_idx] + replacement + content[end_idx:]

    # Also we need to add the imports at the top
    # Let's find: import { RATINGS, ARCHETYPES, BONUS_PATHS } from "@/lib/achievements";
    # Actually wait, we'll just add it to the imports
    imports_to_add = """import { RATINGS, ARCHETYPES, BONUS_PATHS, getAchievementIcon } from "@/lib/achievements";
import { getRating, getCountryArchetype, getBonusPath, computeSizePopBonus } from "@/lib/achievements-logic";
"""
    if "getAchievementIcon" not in new_content:
        # insert after last import
        last_import = new_content.rfind("import ")
        end_of_last_import = new_content.find("\n", last_import) + 1
        new_content = new_content[:end_of_last_import] + imports_to_add + new_content[end_of_last_import:]

    # Also replace:
    # const rating = getRating(totalScore); const archetype = getCountryArchetype(roster);
    # with getRatingData and getArchetypeData
    new_content = new_content.replace("const rating = getRating(totalScore); const archetype = getCountryArchetype(roster);",
                                      "const rating = getRatingData(totalScore); const archetype = getArchetypeData(roster);")
    
    # And replace:
    # {bPath === "agricultural" ? <Leaf ... /> : ...}
    # We will just rewrite the bonus path rendering to use getAchievementIcon and the BONUS_PATHS data
    new_content = re.sub(
        r"const bName = bPath === \"agricultural\" \? \"Agricultural society\" : bPath === \"extraction\" \? \"Resource Extraction\" : bPath === \"urban\" \? \"Tech Megacity\" : null;",
        r"const bName = bPath;",
        new_content
    )

    with open(file, "w") as f:
        f.write(new_content)
    print(f"Updated {file}")

