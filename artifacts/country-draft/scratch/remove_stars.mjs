import fs from 'fs';

const files = [
  'src/pages/daily/DailyUI.tsx',
  'src/pages/double/DoubleUI.tsx',
  'src/pages/guess/GuessUI.tsx',
  'src/pages/normal/NormalUI.tsx',
  'src/pages/party/PartyUI.tsx',
  'src/pages/sabotage/SabotageUI.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    /if \(BONUS_CATEGORIES\.includes\(cat\)\) return "";/g,
    'if (BONUS_CATEGORIES.includes(cat) || cat === "population" || cat === "size") return "";'
  );
  fs.writeFileSync(file, content);
  console.log('Updated ' + file);
}
