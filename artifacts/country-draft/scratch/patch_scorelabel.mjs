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

const target1 = `export function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 13.5) return { label: "World-Class", color: "text-emerald-400" };
  if (score >= 10) return { label: "Strong", color: "text-green-400" };
  if (score >= 7) return { label: "Moderate", color: "text-yellow-400" };
  if (score >= 4) return { label: "Weak", color: "text-orange-400" };
  return { label: "Critical", color: "text-red-400" };
}`;

const repl1 = `export function getScoreLabel(score: number, maxScore: number = 15): { label: string; color: string } {
  if (maxScore === 10) {
    if (score >= 9) return { label: "World-Class", color: "text-emerald-400" };
    if (score >= 7) return { label: "Strong", color: "text-green-400" };
    if (score >= 5) return { label: "Moderate", color: "text-yellow-400" };
    if (score >= 3) return { label: "Weak", color: "text-orange-400" };
    return { label: "Critical", color: "text-red-400" };
  }
  if (maxScore === 12) {
    if (score >= 11) return { label: "World-Class", color: "text-emerald-400" };
    if (score >= 9) return { label: "Strong", color: "text-green-400" };
    if (score >= 6) return { label: "Moderate", color: "text-yellow-400" };
    if (score >= 4) return { label: "Weak", color: "text-orange-400" };
    return { label: "Critical", color: "text-red-400" };
  }
  if (score >= 14) return { label: "World-Class", color: "text-emerald-400" };
  if (score >= 12) return { label: "Strong", color: "text-green-400" };
  if (score >= 8) return { label: "Moderate", color: "text-yellow-400" };
  if (score >= 5) return { label: "Weak", color: "text-orange-400" };
  return { label: "Critical", color: "text-red-400" };
}`;

const target2 = `const scoreLabel = getScoreLabel(stat.score);`;
const repl2 = `const scoreLabel = getScoreLabel(stat.score, maxScore);`;

const target3 = `\${getScoreLabel(scoreVal).color}`;
const repl3 = `\${getScoreLabel(scoreVal, maxScore).color}`;

const target4 = `{getScoreLabel(scoreVal).label}`;
const repl4 = `{getScoreLabel(scoreVal, maxScore).label}`;

for (const file of files) {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let changed = false;
    
    if (content.includes(target1)) {
      content = content.replace(target1, repl1);
      changed = true;
    }
    if (content.includes(target2)) {
      content = content.replaceAll(target2, repl2);
      changed = true;
    }
    if (content.includes(target3)) {
      content = content.replaceAll(target3, repl3);
      changed = true;
    }
    if (content.includes(target4)) {
      content = content.replaceAll(target4, repl4);
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
