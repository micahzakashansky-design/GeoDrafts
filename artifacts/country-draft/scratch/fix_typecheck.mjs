import fs from 'fs';
import path from 'path';

const scratchDir = '/Users/micahzakashansky/.gemini/antigravity/scratch/GeoDrafts/artifacts/country-draft';
const uiFiles = [
  'src/pages/normal/NormalUI.tsx',
  'src/pages/party/PartyUI.tsx',
  'src/pages/sabotage/SabotageUI.tsx',
  'src/pages/daily/DailyUI.tsx',
  'src/pages/guess/GuessUI.tsx',
  'src/pages/double/DoubleUI.tsx'
];

for (const file of uiFiles) {
  const filePath = path.resolve(scratchDir, file);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // This replaces it in SidebarRoster/generateImage where wildcardPhase is not defined
  content = content.replace(
    /if \(roster\.Size && roster\.Population && !wildcardPhase\) \{ displayCats\.push\("Population Structure" as any\); \}/g,
    'if (roster.Size && roster.Population) { displayCats.push("Population Structure" as any); }'
  );

  fs.writeFileSync(filePath, content);
}
console.log("Fixed typecheck errors");
