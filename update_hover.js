const fs = require('fs');
const path = require('path');

const dir = 'artifacts/country-draft/src/pages';
const files = [
  'daily/DailyGame.tsx',
  'double/DoubleDraftGame.tsx',
  'guess/GuessGame.tsx',
  'normal/NormalGame.tsx',
  'party/PartyGame.tsx',
  'sabotage/SabotageGame.tsx'
];

files.forEach(f => {
  const p = path.join(dir, f);
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(
    /hover:opacity-80 transition-opacity/g,
    'hover:opacity-80 transition-opacity duration-75'
  );
  fs.writeFileSync(p, content);
  console.log('Updated hover in ' + f);
});
