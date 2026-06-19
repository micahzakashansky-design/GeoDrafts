const fs = require('fs');
const files = [
  'src/pages/daily/DailyUI.tsx',
  'src/pages/double/DoubleUI.tsx',
  'src/pages/guess/GuessUI.tsx',
  'src/pages/normal/NormalUI.tsx',
  'src/pages/party/PartyUI.tsx',
  'src/pages/sabotage/SabotageUI.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');
  
  // 1. Fix wildcard phase displayCats push
  code = code.replace(
    /if \(roster\.Size && roster\.Population && !wildcardPhase\) \{ displayCats\.push\("Population Structure"\); \}\n\s*else \{ if \(roster\.Size \|\| wildcardPhase\) displayCats\.push\("Size"\); if \(roster\.Population \|\| wildcardPhase\) displayCats\.push\("Population"\); \}/g,
    'if (roster.Size && roster.Population) { displayCats.push("Population Structure"); }\n              else { if (roster.Size) displayCats.push("Size"); if (roster.Population) displayCats.push("Population"); }'
  );

  // 2. Fix the combo title
  code = code.replace(
    /<div className="flex flex-col gap-1">\n\s*<div className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">\{\(sizeCountry as any\)\.flag\} \{\(sizeCountry as any\)\.name\}\{\(sizeCountry as any\)\.name !== \(popCountry as any\)\.name && " \(Size\)"\}<\/div>\n\s*\{\(sizeCountry as any\)\.name !== \(popCountry as any\)\.name && \(\n\s*<div className="text-base md:text-lg font-bold text-foreground flex items-center gap-2 mt-0\.5">\{\(popCountry as any\)\.flag\} \{\(popCountry as any\)\.name\} \(Population\)<\/div>\n\s*\)\}\n\s*<\/div>/g,
    `<div className="flex flex-col gap-1">
                        <div className="text-base md:text-lg font-bold text-foreground flex items-center gap-2 flex-wrap">
                          {(sizeCountry as any).flag} {(sizeCountry as any).name}
                          {(sizeCountry as any).name !== (popCountry as any).name && (
                             <>
                               <span className="text-muted-foreground font-medium">+</span>
                               {(popCountry as any).flag} {(popCountry as any).name}
                             </>
                          )}
                        </div>
                      </div>`
  );

  fs.writeFileSync(file, code);
}
console.log('done');
