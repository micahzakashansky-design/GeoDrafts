import fs from 'fs';
import path from 'path';

const files = [
  'src/pages/party/PartyUI.tsx',
  'src/pages/sabotage/SabotageUI.tsx',
  'src/pages/daily/DailyUI.tsx',
  'src/pages/guess/GuessUI.tsx',
  'src/pages/double/DoubleUI.tsx',
  'src/pages/normal/NormalUI.tsx'
];

for (const file of files) {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    const target = '{scoreLabel.label}';
    const replacement = '{BONUS_CATEGORIES.includes(cat) ? "Bonus Contributor" : scoreLabel.label}';
    
    // Check if it already has the replacement
    if (!content.includes(replacement)) {
      content = content.replace(target, replacement);
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Updated ${file}`);
    } else {
      console.log(`Already updated ${file}`);
    }
  }
}
