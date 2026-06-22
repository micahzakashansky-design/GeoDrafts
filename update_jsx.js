const fs = require('fs');
const path = require('path');

const uiFiles = [
  'src/pages/daily/DailyUI.tsx',
  'src/pages/double/DoubleUI.tsx',
  'src/pages/guess/GuessUI.tsx',
  'src/pages/normal/NormalUI.tsx',
  'src/pages/party/PartyUI.tsx',
  'src/pages/sabotage/SabotageUI.tsx'
];

const newJSX = `{bPath && (
            <div className="p-4 md:p-5 rounded-2xl bg-card border border-border shadow-sm flex items-start gap-4">
              <div className="p-3 bg-secondary/30 rounded-xl shrink-0">
                {bPath === "agricultural" ? <Leaf className="w-5 h-5 text-yellow-400" /> : 
                 bPath === "extraction" ? <Mountain className="w-5 h-5 text-yellow-400" /> :
                 <Building className="w-5 h-5 text-yellow-400" />}
              </div>
              <div>
                <h3 className="font-bold text-foreground text-sm md:text-base mb-1">
                  {bPath === "agricultural" ? "Agricultural Giant" : 
                   bPath === "extraction" ? "Resource Extraction Titan" : 
                   "Urban Powerhouse"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {bPath === "agricultural" ? "Vast lands with sparse population." : 
                   bPath === "extraction" ? "Massive nation built for resource extraction." : 
                   "Dense population in a compact area."}
                </p>
              </div>
            </div>
          )}`;

for (const file of uiFiles) {
  const fullPath = path.join(__dirname, 'artifacts/country-draft', file);
  if (!fs.existsSync(fullPath)) continue;
  let content = fs.readFileSync(fullPath, 'utf8');

  // We need to replace the exact block:
  //           {bPath && (
  //             <div className="p-4 md:p-5 rounded-2xl bg-card border border-border shadow-sm flex items-start gap-4">
  //               <div className="p-3 bg-secondary/30 rounded-xl shrink-0">{bPath === "agricultural" ? <Leaf className="w-5 h-5 text-yellow-400" /> : <Building className="w-5 h-5 text-yellow-400" />}</div>
  //               <div><h3 className="font-bold text-foreground text-sm md:text-base mb-1">{bPath === "agricultural" ? "Agricultural Giant" : "Urban Powerhouse"}</h3><p className="text-xs text-muted-foreground">{bPath === "agricultural" ? "Vast lands with sparse population." : "Dense population in a compact area."}</p></div>
  //             </div>
  //           )}

  // Let's use string replace using substring search.
  const regex = /\{bPath && \([\s\S]*?<div className="p-3 bg-secondary\/30 rounded-xl shrink-0">\{bPath === "agricultural" \? <Leaf className="w-5 h-5 text-yellow-400" \/> : <Building className="w-5 h-5 text-yellow-400" \/><\/div>[\s\S]*?<\/div>\s*\)\}/;

  if (regex.test(content)) {
    content = content.replace(regex, newJSX);
    fs.writeFileSync(fullPath, content);
    console.log("Updated JSX in", file);
  } else {
    console.log("Pattern not found in", file);
  }
}
