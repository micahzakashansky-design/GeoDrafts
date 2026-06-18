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

const target1 = `if (roster.Size && roster.Population && !wildcardPhase) { displayCats.push("Population Structure"); }`;
const repl1 = `if (roster.Size && roster.Population) { displayCats.push("Population Structure"); }`;

const target2 = `const isWildcardTarget = wildcardPhase;
                return (`;

const repl2 = `const isWildcardTarget = wildcardPhase;
                if (isCombo && isWildcardTarget) {
                  return (
                    <div key={cat} className="grid grid-cols-2 gap-2 md:gap-3 p-0 border-0 bg-transparent">
                      {["Size", "Population"].map(splitCat => {
                        const sCat = splitCat as Category;
                        const splitAssigned = roster[sCat];
                        if (!splitAssigned) return null;
                        const ck = getCategoryKey(sCat);
                        const stat = splitAssigned.stats[ck];
                        return (
                          <div key={sCat} onClick={() => onWildcardSelect(sCat)} className="p-3 md:p-4 rounded-2xl border flex flex-col gap-2 relative overflow-hidden transition-all cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 hover:scale-[1.02] border-border/50 bg-card">
                            <div className="flex items-center justify-between"><div className="flex items-center gap-1.5 text-muted-foreground">{CATEGORY_ICONS[sCat]}<span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-foreground/80">{sCat}</span></div></div>
                            <div><div className="text-sm md:text-base font-bold text-foreground flex items-center gap-1.5">{splitAssigned.flag} <span className="truncate">{splitAssigned.name}</span></div></div>
                            {!isHardMode && (
                              <div className="mt-auto space-y-1">
                                <div className={\`text-[10px] font-bold px-1.5 py-0.5 rounded w-max \${getScoreLabel(stat.score).color} bg-secondary/50\`}>Bonus Contributor</div>
                                <div className="font-bold text-yellow-400 text-xs">{extractBonusText(stat.description, sCat)}</div>
                              </div>
                            )}
                            <p className="text-[9px] text-muted-foreground/80 leading-relaxed italic line-clamp-2">"{stat.description}"</p>
                          </div>
                        );
                      })}
                    </div>
                  );
                }
                return (`

for (const file of files) {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    if (content.includes(target1) && content.includes(target2)) {
      content = content.replace(target1, repl1);
      content = content.replace(target2, repl2);
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Updated ${file}`);
    } else {
      console.log(`Could not find targets in ${file}`);
    }
  }
}
