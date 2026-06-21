const fs = require('fs');

const uiFiles = [
  'src/pages/normal/NormalUI.tsx',
  'src/pages/daily/DailyUI.tsx',
  'src/pages/double/DoubleUI.tsx',
  'src/pages/guess/GuessUI.tsx',
  'src/pages/party/PartyUI.tsx',
  'src/pages/sabotage/SabotageUI.tsx'
];

for (const f of uiFiles) {
  if (!fs.existsSync(f)) continue;
  let content = fs.readFileSync(f, 'utf8');

  // Regex to find GameState definition and add properties before the closing brace
  content = content.replace(
    /(export type GameState = \{[\s\S]*?)(\n\};)/,
    `$1\n  categoryTimes: Partial<Record<Category, number>>;\n  currentTurnStartTime: number;$2`
  );

  fs.writeFileSync(f, content);
}

console.log("Updated GameState!");
