import fs from 'fs';

const file = 'src/pages/guess/GuessUI.tsx';

let content = fs.readFileSync(file, 'utf-8');

const oldStr = `                return (
                  <div key={cat} className="p-4 md:p-5 rounded-2xl border flex flex-col gap-3 relative overflow-hidden transition-all bg-card border-border/50">
                    <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-muted-foreground">{isCombo ? <Users className="w-4 h-4 md:w-5 md:h-5" /> : CATEGORY_ICONS[actualCat]}<span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-foreground/80">{cat}</span></div></div>
                    <div><div className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">{assigned.flag} {assigned.name}{isCombo && roster.Population && <><span className="text-muted-foreground/50">+</span> {roster.Population.flag} {roster.Population.name}</>}</div></div>
                    {(() => {
                      let scoreVal = 0, weight = 1, desc = "", maxScore = 10;
                      if (isCombo) { 
                        scoreVal = (assigned.stats.size.score + roster.Population!.stats.population.score) / 2; 
                        weight = 1; 
                        desc = "Combined structure bonus applied based on Size and Population compatibility."; 
                      } else { 
                        const ck = getCategoryKey(actualCat); 
                        scoreVal = assigned.stats[ck].score; 
                        maxScore = CATEGORY_MAX_SCORES[actualCat] ?? 10; 
                        desc = assigned.stats[ck].description; 
                      }
                      const isBonus = BONUS_CATEGORIES.includes(actualCat) || isCombo;
                      return (
                        <div className="space-y-2 mt-auto">
                          {!isHardMode && (
                            <div className="flex items-center justify-between text-sm">
                              {!isBonus ? ( 
                                <><div className="flex items-center gap-2"><span className="font-bold text-primary">{scoreVal * weight} <span className="text-primary/50 text-xs">/ {maxScore}</span> <span className="text-[10px] text-muted-foreground">pts</span></span><span className={\`text-[10px] font-bold px-1.5 py-0.5 rounded \${getScoreLabel(scoreVal, maxScore).color} bg-secondary/50\`}>{getScoreLabel(scoreVal, maxScore).label}</span></div></>
                              ) : ( <span className="font-bold text-yellow-400">+{isCombo ? bonus : Math.floor(scoreVal / 2)} <span className="text-[10px] text-yellow-400/60">pts</span></span> )}
                            </div>
                          )}
                          <p className="text-[11px] md:text-xs text-muted-foreground/80 leading-relaxed italic line-clamp-2">"{desc}"</p>
                        </div>
                      );
                    })()}
                  </div>
                );`;

const newStr = `                if (isCombo && roster.Population) {
                  const sizeCountry = assigned;
                  const popCountry = roster.Population;
                  return (
                    <div key={cat} className="p-0 rounded-2xl border flex flex-row relative overflow-hidden transition-all bg-card border-border/50">
                      <div className="flex-1 p-4 md:p-5 border-r border-border/50 flex flex-col gap-3">
                        <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-muted-foreground">{CATEGORY_ICONS["size"]}<span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-foreground/80">Size</span></div></div>
                        <div><div className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">{sizeCountry.flag} {sizeCountry.name}</div></div>
                        <div className="space-y-2 mt-auto">
                          {!isHardMode && (
                            <div className="flex items-center gap-2 mt-auto">
                              <span className="font-bold text-white text-xs">{sizeCountry.stats.size.score}</span>
                              <div className={\`text-[10px] font-bold px-1.5 py-0.5 rounded w-max text-white bg-secondary/50\`}>Bonus Contributor</div>
                            </div>
                          )}
                          <p className="text-[11px] md:text-xs text-muted-foreground/80 leading-relaxed italic line-clamp-2">"{sizeCountry.stats.size.description}"</p>
                        </div>
                      </div>
                      <div className="flex-1 p-4 md:p-5 flex flex-col gap-3 bg-secondary/5">
                        <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-muted-foreground">{CATEGORY_ICONS["population"]}<span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-foreground/80">Population</span></div></div>
                        <div><div className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">{popCountry.flag} {popCountry.name}</div></div>
                        <div className="space-y-2 mt-auto">
                          {!isHardMode && (
                            <div className="flex items-center gap-2 mt-auto">
                              <span className="font-bold text-white text-xs">{popCountry.stats.population.score}M</span>
                              <div className={\`text-[10px] font-bold px-1.5 py-0.5 rounded w-max text-white bg-secondary/50\`}>Bonus Contributor</div>
                            </div>
                          )}
                          <p className="text-[11px] md:text-xs text-muted-foreground/80 leading-relaxed italic line-clamp-2">"{popCountry.stats.population.description}"</p>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={cat} className="p-4 md:p-5 rounded-2xl border flex flex-col gap-3 relative overflow-hidden transition-all bg-card border-border/50">
                    <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-muted-foreground">{CATEGORY_ICONS[actualCat]}<span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-foreground/80">{cat}</span></div></div>
                    <div><div className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">{assigned.flag} {assigned.name}</div></div>
                    {(() => {
                      let scoreVal = 0, weight = 1, desc = "", maxScore = 10;
                      const ck = getCategoryKey(actualCat); 
                      scoreVal = assigned.stats[ck].score; 
                      maxScore = CATEGORY_MAX_SCORES[actualCat] ?? 10; 
                      desc = assigned.stats[ck].description;
                      const isBonus = BONUS_CATEGORIES.includes(actualCat);
                      const isSizeOrPop = actualCat === "size" || actualCat === "population";

                      return (
                        <div className="space-y-2 mt-auto">
                          {!isHardMode && (
                            <div className="flex items-center justify-between text-sm">
                              {!isBonus && !isSizeOrPop ? ( <><div className="flex items-center gap-2"><span className="font-bold text-primary">{scoreVal * weight} <span className="text-primary/50 text-xs">/ {maxScore}</span> <span className="text-[10px] text-muted-foreground">pts</span></span><span className={\`text-[10px] font-bold px-1.5 py-0.5 rounded \${getScoreLabel(scoreVal, maxScore).color} bg-secondary/50\`}>{getScoreLabel(scoreVal, maxScore).label}</span></div></>
                              ) : isSizeOrPop ? (
                                <div className="flex items-center gap-2 mt-auto">
                                  <span className="font-bold text-white text-xs">{scoreVal}{actualCat === "population" ? "M" : ""}</span>
                                  <div className={\`text-[10px] font-bold px-1.5 py-0.5 rounded w-max text-white bg-secondary/50\`}>Bonus Contributor</div>
                                </div>
                              ) : ( <span className="font-bold text-yellow-400">+{Math.floor(scoreVal / 2)} <span className="text-[10px] text-yellow-400/60">pts</span></span> )}
                            </div>
                          )}
                          <p className="text-[11px] md:text-xs text-muted-foreground/80 leading-relaxed italic line-clamp-2">"{desc}"</p>
                        </div>
                      );
                    })()}
                  </div>
                );`;

if (content.includes(oldStr)) {
  content = content.replace(oldStr, newStr);
  fs.writeFileSync(file, content);
  console.log('Replaced in ' + file);
} else {
  console.log('Not found in ' + file);
}
