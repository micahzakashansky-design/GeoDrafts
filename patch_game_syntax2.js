const fs = require('fs');
const file = 'artifacts/country-draft/src/pages/Game.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /\{isHardMode \? "<span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" \/> Hard<\/span>" : "Easy"\}/g,
  '{isHardMode ? <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Hard</span> : "Easy"}'
);

fs.writeFileSync(file, content, 'utf8');
