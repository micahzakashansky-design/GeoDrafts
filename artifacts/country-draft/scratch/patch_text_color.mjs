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
  
  content = content.replace(/BONUS_CATEGORIES\.includes\(cat\) \? "text-white"/g, 'BONUS_CATEGORIES.includes(cat) ? "text-foreground"');
  
  // Replace text-white with text-foreground in the Bonus Contributor badges
  content = content.replace(/text-white bg-secondary\/50/g, 'text-foreground bg-secondary/50');
  
  // Replace text-white in the extractBonusText wrappers
  content = content.replace(/className="font-bold text-white text-xs"/g, 'className="font-bold text-foreground text-xs"');
  content = content.replace(/className="font-bold text-white text-\[10px\] md:text-xs"/g, 'className="font-bold text-foreground text-[10px] md:text-xs"');

  fs.writeFileSync(filePath, content);
}
console.log('Done');
