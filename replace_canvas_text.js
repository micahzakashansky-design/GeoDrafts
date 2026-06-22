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

for (const file of files) {
  const p = path.join(__dirname, 'artifacts/country-draft', file);
  if (!fs.existsSync(p)) continue;
  let content = fs.readFileSync(p, 'utf8');
  const target = 'size/population bonus';
  if (content.includes(target)) {
    fs.writeFileSync(p, content.replace(target, 'population structure bonus'));
    console.log("Replaced in", file);
  }
}
