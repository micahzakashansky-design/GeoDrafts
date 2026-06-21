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

bpath_helpers = """export function getBonusPathData(roster: Partial<Record<Category, Country>>) {
  const name = getBonusPath(roster);
  if (!name) return null;
  const data = BONUS_PATHS.find(b => b.name === name)!;
  return { name: data.name, desc: data.desc, icon: getAchievementIcon(data.name) };
}
"""

for file in files:
    with open(file, "r") as f:
        content = f.read()

    # Add getBonusPathData before "export type Archetype ="
    if "export function getBonusPathData" not in content:
        content = content.replace("export type Archetype =", bpath_helpers + "\nexport type Archetype =")

    # Replace `const bPath = getBonusPath(roster);` with `const bPath = getBonusPathData(roster);`
    content = content.replace("const bPath = getBonusPath(roster);", "const bPath = getBonusPathData(roster);")

    # Replace the JSX rendering for bPath
    # Pattern to match:
    # {bPath && (
    #   <div className="p-4 md:p-5 rounded-2xl bg-card border border-border shadow-sm flex items-start gap-4">
    #     <div className="p-3 bg-muted rounded-xl shrink-0">{...}</div>
    #     <div><h3 ...>{...}</h3><p ...>{...}</p></div>
    #   </div>
    # )}
    
    # Let's just use regex to replace everything inside the `bPath && (` block.
    # Note: bPath now is an object with {name, desc, icon}
    
    # Let's find: `              <div className="p-3 bg-muted rounded-xl shrink-0">{bPath === "agricultural" ? <Leaf ...`
    # and replace with:
    # `              <div className="p-3 bg-muted rounded-xl shrink-0 text-foreground">{bPath.icon}</div>`
    # `              <div><h3 className="font-bold text-foreground text-sm md:text-base mb-1">{bPath.name}</h3><p className="text-xs text-muted-foreground">{bPath.desc}</p></div>`
    
    content = re.sub(
        r'<div className="p-3 bg-muted rounded-xl shrink-0">\{bPath === "agricultural" \? <Leaf.*?</div>\n.*?<div><h3 className="font-bold text-foreground text-sm md:text-base mb-1">\{bPath === "agricultural".*?</h3><p className="text-xs text-muted-foreground">\{bPath === "agricultural".*?</p></div>',
        r'<div className="p-3 bg-muted rounded-xl shrink-0 text-foreground">{bPath.icon}</div>\n              <div><h3 className="font-bold text-foreground text-sm md:text-base mb-1">{bPath.name}</h3><p className="text-xs text-muted-foreground">{bPath.desc}</p></div>',
        content,
        flags=re.DOTALL
    )

    with open(file, "w") as f:
        f.write(content)
    print(f"Updated {file}")
