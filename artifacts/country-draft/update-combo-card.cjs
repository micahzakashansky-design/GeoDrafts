const fs = require('fs');
const files = [
  'src/pages/daily/DailyUI.tsx',
  'src/pages/double/DoubleUI.tsx',
  'src/pages/guess/GuessUI.tsx',
  'src/pages/normal/NormalUI.tsx',
  'src/pages/party/PartyUI.tsx',
  'src/pages/sabotage/SabotageUI.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Replace the first occurrence, which corresponds to the combo card
  content = content.replace(
    '"bg-card border-border/50"}`}',
    '"bg-card border-border/50"} col-span-1 md:col-span-2 lg:col-span-full`}'
  );
  
  content = content.replace(
    '<div className="space-y-3 mt-3">',
    '<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">'
  );
  
  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
});
