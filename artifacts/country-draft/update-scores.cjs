const fs = require('fs');
const files = [
  'src/pages/daily/DailyUI.tsx',
  'src/pages/double/DoubleUI.tsx',
  'src/pages/guess/GuessUI.tsx',
  'src/pages/normal/NormalUI.tsx',
  'src/pages/party/PartyUI.tsx',
  'src/pages/sabotage/SabotageUI.tsx'
];

const targetCombo = `                        <div className="font-bold text-foreground text-xs md:text-sm">
                           +{(sizeCountry as any).stats.size.score + (popCountry as any).stats.population.score} <span className="text-[10px] uppercase tracking-wider opacity-75">pts</span>
                        </div>`;

const newCombo = `                        <div className="font-bold text-foreground text-base md:text-lg">
                           <span className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/70">+{(sizeCountry as any).stats.size.score + (popCountry as any).stats.population.score}</span> <span className="text-[10px] uppercase tracking-wider opacity-75">pts</span>
                        </div>`;

const targetNormal = `                              {!isBonus && !isSizeOrPop ? ( <><div className="flex items-center gap-2"><span className="text-lg md:text-xl font-black text-primary">{scoreVal * weight} <span className="text-primary/50 text-sm md:text-base font-bold">/ {maxScore}</span> <span className="text-[11px] md:text-xs text-muted-foreground font-semibold">pts</span></span><span className={\`text-[10px] font-bold px-1.5 py-0.5 rounded \${getScoreLabel(scoreVal, maxScore).color} bg-secondary/50\`}>{getScoreLabel(scoreVal, maxScore).label}</span></div></>`;

const newNormal = `                              {!isBonus && !isSizeOrPop ? ( <><div className="flex items-center gap-2"><span className={\`text-lg md:text-xl font-black \${getScoreLabel(scoreVal, maxScore).color.split(' ')[0]}\`}>{scoreVal * weight} <span className="text-primary/50 text-sm md:text-base font-bold">/ {maxScore}</span> <span className="text-[11px] md:text-xs text-muted-foreground font-semibold">pts</span></span><span className={\`text-[10px] font-bold px-1.5 py-0.5 rounded \${getScoreLabel(scoreVal, maxScore).color} bg-secondary/50\`}>{getScoreLabel(scoreVal, maxScore).label}</span></div></>`;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let updated = false;
  
  if (content.indexOf(targetCombo) !== -1) {
    content = content.replace(targetCombo, newCombo);
    updated = true;
  }
  
  if (content.indexOf(targetNormal) !== -1) {
    content = content.replace(targetNormal, newNormal);
    updated = true;
  }
  
  if (updated) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
