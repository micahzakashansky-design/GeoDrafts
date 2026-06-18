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

const target1 = `export function getCategoryStars(cat: Category): string {
  const maxScore = CATEGORY_MAX_SCORES[cat] ?? 10;
  if (maxScore === 15) return "★★★";
  if (maxScore === 12) return "★★";
  return "★";
}`;

const repl1 = `export function getCategoryStars(cat: Category): string {
  if (BONUS_CATEGORIES.includes(cat)) return "";
  const maxScore = CATEGORY_MAX_SCORES[cat] ?? 10;
  if (maxScore === 15) return "★★★";
  if (maxScore === 12) return "★★";
  return "★";
}`;

for (const file of files) {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let changed = false;
    
    if (content.includes(target1)) {
      content = content.replace(target1, repl1);
      changed = true;
    }
    
    if (changed) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Updated ${file}`);
    } else {
      console.log(`Could not find targets in ${file}`);
    }
  }
}
