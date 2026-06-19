const fs = require('fs');
const files = [
  'src/pages/daily/DailyUI.tsx',
  'src/pages/double/DoubleUI.tsx',
  'src/pages/guess/GuessUI.tsx',
  'src/pages/normal/NormalUI.tsx',
  'src/pages/party/PartyUI.tsx',
  'src/pages/sabotage/SabotageUI.tsx'
];

const targetContent = `                      <div className="flex flex-col gap-1">
                        <div className="text-base md:text-lg font-bold text-foreground flex items-center gap-2 flex-wrap">
                          {(sizeCountry as any).flag} {(sizeCountry as any).name}
                          {(sizeCountry as any).name !== (popCountry as any).name && (
                             <>
                               <span className="text-muted-foreground font-medium">+</span>
                               {(popCountry as any).flag} {(popCountry as any).name}
                             </>
                          )}
                        </div>
                      </div>
                      <div className="space-y-3 mt-3">
                        <div className="space-y-1">
                          {!isHardMode && (
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground text-xs">{extractBonusText((sizeCountry as any).stats.size.description, "Size")}</span>
                              <div className="text-[9px] font-bold px-1.5 py-0.5 rounded w-max text-foreground bg-secondary/50">Size Bonus</div>
                            </div>
                          )}
                          <p className="text-[11px] md:text-xs text-muted-foreground/80 leading-relaxed italic line-clamp-2">"{(sizeCountry as any).stats.size.description}"</p>
                        </div>
                        <div className="space-y-1">
                          {!isHardMode && (
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground text-xs">{extractBonusText((popCountry as any).stats.population.description, "Population")}</span>
                              <div className="text-[9px] font-bold px-1.5 py-0.5 rounded w-max text-foreground bg-secondary/50">Pop Bonus</div>
                            </div>
                          )}
                          <p className="text-[11px] md:text-xs text-muted-foreground/80 leading-relaxed italic line-clamp-2">"{(popCountry as any).stats.population.description}"</p>
                        </div>
                      </div>`;

const newContentStr = `                      <div className="w-full mt-2">
                        {(sizeCountry as any).name !== (popCountry as any).name ? (
                          <div className="flex items-center justify-between w-full">
                            <div className="text-sm md:text-base font-bold text-foreground flex items-center gap-1.5 flex-1 min-w-0">
                              {(sizeCountry as any).flag} <span className="truncate">{(sizeCountry as any).name}</span>
                            </div>
                            <span className="text-muted-foreground font-bold mx-2 shrink-0">+</span>
                            <div className="text-sm md:text-base font-bold text-foreground flex items-center justify-end gap-1.5 flex-1 min-w-0 text-right">
                              <span className="truncate">{(popCountry as any).name}</span> {(popCountry as any).flag}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-full">
                            <div className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">
                              {(sizeCountry as any).flag} {(sizeCountry as any).name}
                            </div>
                          </div>
                        )}
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <div className="space-y-1">
                            {!isHardMode && (
                              <div className="flex flex-col gap-1 items-start">
                                <span className="font-bold text-foreground text-[11px] leading-tight">{extractBonusText((sizeCountry as any).stats.size.description, "Size")}</span>
                                <div className="text-[9px] font-bold px-1.5 py-0.5 rounded w-max text-foreground bg-secondary/50">Size Bonus</div>
                              </div>
                            )}
                            <p className="text-[10px] text-muted-foreground/80 leading-snug italic line-clamp-3 mt-1">"{(sizeCountry as any).stats.size.description}"</p>
                          </div>
                          <div className="space-y-1">
                            {!isHardMode && (
                              <div className="flex flex-col gap-1 items-end text-right">
                                <span className="font-bold text-foreground text-[11px] leading-tight">{extractBonusText((popCountry as any).stats.population.description, "Population")}</span>
                                <div className="text-[9px] font-bold px-1.5 py-0.5 rounded w-max text-foreground bg-secondary/50">Pop Bonus</div>
                              </div>
                            )}
                            <p className="text-[10px] text-muted-foreground/80 leading-snug italic line-clamp-3 text-right mt-1">"{(popCountry as any).stats.population.description}"</p>
                          </div>
                        </div>
                      </div>`;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.indexOf(targetContent) !== -1) {
    content = content.replace(targetContent, newContentStr);
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  } else {
    console.log(`Target content not found in ${file}`);
  }
});
