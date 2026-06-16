const fs = require('fs');
const file = 'artifacts/country-draft/src/pages/Game.tsx';
let content = fs.readFileSync(file, 'utf8');

// I replaced strings inside a JS expression with JSX without returning JSX elements.
// The modeLabel was a string.
// Let's fix modeLabel:

content = content.replace(
  /mode === "daily" \? "<span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" \/> Daily<\/span>" : mode === "hard" \? "<span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" \/> Hard<\/span>" : "Easy";/g,
  'mode === "daily" ? <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" /> Daily</span> : mode === "hard" ? <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Hard</span> : "Easy";'
);

fs.writeFileSync(file, content, 'utf8');
