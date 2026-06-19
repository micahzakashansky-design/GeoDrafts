const fs = require('fs');
const path = require('path');

const dir = 'artifacts/country-draft/src/pages';
const files = [
  'daily/DailyUI.tsx',
  'double/DoubleUI.tsx',
  'guess/GuessUI.tsx',
  'normal/NormalUI.tsx',
  'party/PartyUI.tsx',
  'sabotage/SabotageUI.tsx'
];

files.forEach(f => {
  const p = path.join(dir, f);
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(
    /className="flex items-center justify-between mb-3"/g,
    'className="flex items-center justify-between mb-1"'
  );
  content = content.replace(
    /className={!isHardMode \? "mt-3" : "mt-1"}/g,
    'className={!isHardMode ? "mt-1" : "mt-1"}'
  );
  fs.writeFileSync(p, content);
  console.log('Updated ' + f);
});
