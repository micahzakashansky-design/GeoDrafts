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
  
  code = code.replace(
    /\$\{expanded \? "opacity-0 pointer-events-none" : "line-clamp-2"\}/g,
    'line-clamp-2 ${expanded ? "opacity-0 pointer-events-none" : ""}'
  );

  fs.writeFileSync(file, code);
}
console.log('done');
