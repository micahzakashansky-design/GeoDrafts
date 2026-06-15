const fs = require('fs');
const file = 'artifacts/country-draft/src/pages/Game.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add Lightbulb, AlertTriangle to lucide-react imports if not there
content = content.replace(
  'Info,',
  'Info, Lightbulb, AlertTriangle,'
);

// Replace 💡 Bonus formula stat
content = content.replace(
  /💡 Bonus formula stat/g,
  '<span className="flex items-center gap-1"><Lightbulb className="w-3 h-3" /> Bonus formula stat</span>'
);

// Replace 🗓️ Daily
content = content.replace(
  /🗓️ Daily/g,
  '<span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Daily</span>'
);

// Replace ⚠️ Hard
content = content.replace(
  /⚠️ Hard/g,
  '<span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Hard</span>'
);

fs.writeFileSync(file, content, 'utf8');
console.log("Game.tsx updated");
