const fs = require('fs');
const str = fs.readFileSync('src/pages/normal/GameShared.tsx', 'utf8');

const t = `<div><h3 className="font-bold text-foreground text-sm md:text-base mb-1">{archetype.name}</h3><p className="text-xs text-muted-foreground">{archetype.desc}</p></div>
          </div>`;

console.log("Includes:", str.includes(t));
