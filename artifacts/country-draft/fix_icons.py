import re

file = "src/pages/Leaderboard.tsx"
with open(file, "r") as f:
    content = f.read()

# Just inject them at the end of the lucide-react import
content = re.sub(r'\} from "lucide-react";', r', GlobeIcon, ArrowLeftRight, Search } from "lucide-react";', content)

with open(file, "w") as f:
    f.write(content)
