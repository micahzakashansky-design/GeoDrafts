const fs = require('fs');
const files = [
  'src/pages/daily/DailyUI.tsx',
  'src/pages/double/DoubleUI.tsx',
  'src/pages/guess/GuessUI.tsx',
  'src/pages/normal/NormalUI.tsx',
  'src/pages/party/PartyUI.tsx',
  'src/pages/sabotage/SabotageUI.tsx'
];

const targetContent = `                            {!isHardMode && (
                              <div className="space-y-1 mt-3">
                                <div className={\`text-[10px] font-bold px-1.5 py-0.5 rounded w-max text-foreground bg-secondary/50\`}>Bonus Contributor</div>
                                <div className="font-bold text-foreground text-xs">{extractBonusText(stat.description, sCat)}</div>
                              </div>
                            )}`;

const newContent = `                            {!isHardMode && (
                              <div className="flex flex-col items-start gap-1 mt-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <div className="font-bold text-foreground text-xs">{extractBonusText(stat.description, sCat)}</div>
                                  <div className="text-[8px] font-bold px-1.5 py-0.5 rounded w-max text-foreground bg-secondary/50">Bonus</div>
                                </div>
                              </div>
                            )}`;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.indexOf(targetContent) !== -1) {
    content = content.replace(targetContent, newContent);
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  } else {
    console.log(`Target content not found in ${file}`);
  }
});
