import fs from 'fs';

const filePath = 'src/pages/double/DoubleUI.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

const startStr = 'if (isCombo && roster.Population) {';
let startIndex = content.indexOf(startStr);
if (startIndex !== -1) {
  let openCount = 0;
  let endIndex = -1;
  for (let i = startIndex; i < content.length; i++) {
    if (content[i] === '{') openCount++;
    if (content[i] === '}') {
      openCount--;
      if (openCount === 0) {
        endIndex = i;
        break;
      }
    }
  }
  
  if (endIndex !== -1) {
    const newBlock = `if (isCombo && roster.Population) {
                  return (
                    <div key={cat} onClick={() => { if (isWildcardTarget && !isCombo) onWildcardSelect(actualCat); }} className={\`p-4 md:p-5 rounded-2xl border flex flex-col gap-3 relative transition-all \${isWildcardTarget && !isCombo ? "cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 hover:scale-[1.02] border-border/50 bg-card" : "bg-card border-border/50"}\`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          {CATEGORY_ICONS["Size"]}
                          <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-foreground/80">Population Structure</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-4">
                        {[0, 1].map(idx => {
                          const sizeCountry = (assigned as unknown as any[])[idx];
                          const popCountry = (roster.Population as unknown as any[])[idx];
                          if (!sizeCountry || !popCountry) return null;
                          return (
                            <div key={idx} className="flex flex-col gap-2">
                              <div className="text-sm md:text-base font-bold text-foreground flex items-center gap-2">{sizeCountry.flag} {sizeCountry.name}</div>
                              <div className="space-y-3 mt-1 pl-4 border-l-2 border-border/50">
                                <div className="space-y-1">
                                  {!isHardMode && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-white text-[10px] md:text-xs">{extractBonusText(sizeCountry.stats.size.description, "Size")}</span>
                                      <div className="text-[8px] font-bold px-1.5 py-0.5 rounded w-max text-white bg-secondary/50">Size Bonus</div>
                                    </div>
                                  )}
                                  <p className="text-[10px] md:text-xs text-muted-foreground/80 leading-relaxed italic line-clamp-2">"{sizeCountry.stats.size.description}"</p>
                                </div>
                                <div className="space-y-1">
                                  {!isHardMode && (
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-white text-[10px] md:text-xs">{extractBonusText(popCountry.stats.population.description, "Population")}</span>
                                      <div className="text-[8px] font-bold px-1.5 py-0.5 rounded w-max text-white bg-secondary/50">Pop Bonus</div>
                                    </div>
                                  )}
                                  <p className="text-[10px] md:text-xs text-muted-foreground/80 leading-relaxed italic line-clamp-2">"{popCountry.stats.population.description}"</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }`;
    content = content.substring(0, startIndex) + newBlock + content.substring(endIndex + 1);
  }
}

fs.writeFileSync(filePath, content);
