import fs from 'fs';
import path from 'path';

const files = [
  'src/pages/normal/NormalUI.tsx',
  'src/pages/party/PartyUI.tsx',
  'src/pages/sabotage/SabotageUI.tsx',
  'src/pages/daily/DailyUI.tsx',
  'src/pages/guess/GuessUI.tsx',
  'src/pages/double/DoubleUI.tsx'
];

for (const file of files) {
  const filePath = path.resolve(file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // 1. Update isSame logic
  content = content.replace(
    /const isSame = Array\.isArray\(roster\.Size\) \? \(\(roster\.Size as any\)\[0\]\?\.name === \(roster\.Population as any\)\[0\]\?\.name && \(roster\.Size as any\)\[1\]\?\.name === \(roster\.Population as any\)\[1\]\?\.name\) : \(\(roster\.Size as any\)\?\.name === \(roster\.Population as any\)\?\.name\);\n\s*if \(roster\.Size && roster\.Population && isSame\) \{ displayCats\.push\("Population Structure"( as any)?\); \}/g,
    'if (roster.Size && roster.Population && !wildcardPhase) { displayCats.push("Population Structure"$1); }'
  );
  
  // 2. Update rendering logic to show both names
  const oldRender = `<div>\n                        <div className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">{(sizeCountry as any).flag} {(sizeCountry as any).name}</div>\n                      </div>`;
  const newRender = `<div className="flex flex-col gap-1">\n                        <div className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">{(sizeCountry as any).flag} {(sizeCountry as any).name}{(sizeCountry as any).name !== (popCountry as any).name && " (Size)"}</div>\n                        {(sizeCountry as any).name !== (popCountry as any).name && (\n                           <div className="text-base md:text-lg font-bold text-foreground flex items-center gap-2 mt-0.5">{(popCountry as any).flag} {(popCountry as any).name} (Population)</div>\n                        )}\n                      </div>`;
  content = content.replace(oldRender, newRender);

  // 3. Enable wildcard in multiplayer modes
  content = content.replace(/\{!isMultiplayerGame && !wildcardUsed && !wildcardPhase && \(/g, '{!wildcardUsed && !wildcardPhase && (');

  fs.writeFileSync(filePath, content);
}
console.log('Done UI files');
