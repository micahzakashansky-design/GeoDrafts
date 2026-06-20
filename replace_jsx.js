const fs = require('fs');
const path = require('path');

const files = [
  'src/pages/daily/DailyUI.tsx',
  'src/pages/double/DoubleUI.tsx',
  'src/pages/guess/GuessUI.tsx',
  'src/pages/normal/NormalUI.tsx',
  'src/pages/party/PartyUI.tsx',
  'src/pages/sabotage/SabotageUI.tsx'
];

const target = `          {bPath && (
            <div className="p-4 md:p-5 rounded-2xl bg-card border border-border shadow-sm flex items-start gap-4">
              <div className="p-3 bg-secondary/30 rounded-xl shrink-0">{bPath === "agricultural" ? <Leaf className="w-5 h-5 text-yellow-400" /> : <Building className="w-5 h-5 text-yellow-400" />}</div>
              <div><h3 className="font-bold text-foreground text-sm md:text-base mb-1">{bPath === "agricultural" ? "Agricultural Giant" : "Urban Powerhouse"}</h3><p className="text-xs text-muted-foreground">{bPath === "agricultural" ? "Vast lands with sparse population." : "Dense population in a compact area."}</p></div>
            </div>
          )}`;

const replacement = `          {bPath && (
            <div className="p-4 md:p-5 rounded-2xl bg-card border border-border shadow-sm flex items-start gap-4">
              <div className="p-3 bg-secondary/30 rounded-xl shrink-0">{bPath === "agricultural" ? <Leaf className="w-5 h-5 text-yellow-400" /> : bPath === "extraction" ? <Mountain className="w-5 h-5 text-yellow-400" /> : <Building className="w-5 h-5 text-yellow-400" />}</div>
              <div><h3 className="font-bold text-foreground text-sm md:text-base mb-1">{bPath === "agricultural" ? "Agricultural Giant" : bPath === "extraction" ? "Resource Extraction Titan" : "Urban Powerhouse"}</h3><p className="text-xs text-muted-foreground">{bPath === "agricultural" ? "Vast lands with sparse population." : bPath === "extraction" ? "Massive nation built for resource extraction." : "Dense population in a compact area."}</p></div>
            </div>
          )}`;

for (const file of files) {
  const p = path.join(__dirname, 'artifacts/country-draft', file);
  if (!fs.existsSync(p)) continue;
  let content = fs.readFileSync(p, 'utf8');
  if (content.includes(target)) {
    fs.writeFileSync(p, content.replace(target, replacement));
    console.log("Replaced in", file);
  } else {
    console.log("NOT FOUND in", file);
  }
}
