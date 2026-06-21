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

for file in files:
    with open(file, "r") as f:
        content = f.read()
    content = content.replace('const bName = bPath;', 'const bName = bPath?.name;')
    with open(file, "w") as f:
        f.write(content)

logic_file = "src/lib/achievements-logic.ts"
with open(logic_file, "r") as f:
    content = f.read()
# Replace Geography with Climate, Industry with Economy
content = content.replace("roster.Geography?.stats.geography?", "roster.Climate?.stats.climate?")
content = content.replace("roster.Industry?.stats.industry?", "roster.Economy?.stats.economy?")
with open(logic_file, "w") as f:
    f.write(content)

