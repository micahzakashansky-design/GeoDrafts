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

const target1 = `<div className={\`text-sm font-bold \${scoreLabel.color}\`}>{BONUS_CATEGORIES.includes(cat) ? "Bonus Contributor" : scoreLabel.label}</div>
                      <div className={\`text-sm font-bold \${scoreLabel.color}\`}>`;

const repl1 = `<div className={\`text-sm font-bold \${BONUS_CATEGORIES.includes(cat) ? "text-white" : scoreLabel.color}\`}>{BONUS_CATEGORIES.includes(cat) ? "Bonus Contributor" : scoreLabel.label}</div>
                      <div className={\`text-sm font-bold \${BONUS_CATEGORIES.includes(cat) ? "text-white" : scoreLabel.color}\`}>`;

const target2 = `<div className={\`text-[10px] font-bold px-1.5 py-0.5 rounded w-max \${getScoreLabel(stat.score).color} bg-secondary/50\`}>Bonus Contributor</div>
                                <div className="font-bold text-yellow-400 text-xs">{extractBonusText(stat.description, sCat)}</div>`;

const repl2 = `<div className={\`text-[10px] font-bold px-1.5 py-0.5 rounded w-max text-white bg-secondary/50\`}>Bonus Contributor</div>
                                <div className="font-bold text-white text-xs">{extractBonusText(stat.description, sCat)}</div>`;

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
      content = content.replace(target2, repl2);
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
