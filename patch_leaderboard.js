const fs = require('fs');
const file = 'artifacts/country-draft/src/pages/Leaderboard.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add AlertTriangle to imports
content = content.replace(
  'import { Trophy, ChevronDown, ArrowLeft, Globe, CalendarDays, Sun, Moon } from "lucide-react";',
  'import { Trophy, ChevronDown, ArrowLeft, Globe, CalendarDays, Sun, Moon, AlertTriangle } from "lucide-react";'
);

// Fix 🗓️ Daily
content = content.replace(
  /\{isDaily \? "🗓️ Daily" : entry\.mode === "hard" \? "⚠️ Hard" : "Easy"\}/g,
  '{isDaily ? <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />Daily</span> : entry.mode === "hard" ? <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Hard</span> : "Easy"}'
);

content = content.replace(
  /\{ key: "daily", label: `🗓️ Daily · \$\{todayLabel\}`,\s*activeClass: "bg-amber-400\/20 text-amber-400 border-amber-400\/40" \},/g,
  '{ key: "daily", label: <span className="flex items-center gap-1"><CalendarDays className="w-4 h-4" />Daily · {todayLabel}</span>, activeClass: "bg-amber-400/20 text-amber-400 border-amber-400/40" },'
);

content = content.replace(
  /\{ key: "hard",\s*label: "⚠️ Hard",\s*activeClass: "bg-red-500\/20 text-red-400 border-red-500\/40" \},/g,
  '{ key: "hard",  label: <span className="flex items-center gap-1"><AlertTriangle className="w-4 h-4" />Hard</span>, activeClass: "bg-red-500/20 text-red-400 border-red-500/40" },'
);

fs.writeFileSync(file, content, 'utf8');
console.log("Leaderboard updated");
