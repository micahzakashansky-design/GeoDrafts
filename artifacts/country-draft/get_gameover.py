import sys

with open("src/pages/double/DoubleUI.tsx", "r") as f:
    lines = f.readlines()

start = -1
for i, l in enumerate(lines):
    if l.startswith("export function GameOver"):
        start = i
        break

if start != -1:
    end = start + 80
    print("".join(lines[start:end]))
