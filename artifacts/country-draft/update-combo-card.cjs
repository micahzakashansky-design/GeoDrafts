const fs = require('fs');
const files = [
  'src/pages/daily/DailyUI.tsx',
  'src/pages/double/DoubleUI.tsx',
  'src/pages/guess/GuessUI.tsx',
  'src/pages/normal/NormalUI.tsx',
  'src/pages/party/PartyUI.tsx',
  'src/pages/sabotage/SabotageUI.tsx'
];

const newContentStr = `                      <div className="w-full mt-2">
                        {(sizeCountry as any).name !== (popCountry as any).name ? (
                          <div className="flex items-start justify-center w-full gap-2">
                            <div className="flex-1 flex flex-col items-center text-center gap-2">
                              <div className="text-sm md:text-base font-bold text-foreground flex items-center justify-center gap-1.5 w-full">
                                {(sizeCountry as any).flag} <span className="truncate">{(sizeCountry as any).name}</span>
                              </div>
                              <div className="space-y-1 flex flex-col items-center">
                                {!isHardMode && (
                                  <div className="flex flex-col gap-1 items-center">
                                    <span className="font-bold text-foreground text-[11px] leading-tight">{extractBonusText((sizeCountry as any).stats.size.description, "Size")}</span>
                                    <div className="text-[9px] font-bold px-1.5 py-0.5 rounded w-max text-foreground bg-secondary/50">Size Bonus</div>
                                  </div>
                                )}
                                <p className="text-[10px] text-muted-foreground/80 leading-snug italic line-clamp-3 mt-1 text-center">"{(sizeCountry as any).stats.size.description}"</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-center pt-1">
                              <span className="text-muted-foreground font-bold shrink-0">+</span>
                            </div>
                            <div className="flex-1 flex flex-col items-center text-center gap-2">
                              <div className="text-sm md:text-base font-bold text-foreground flex items-center justify-center gap-1.5 w-full">
                                <span className="truncate">{(popCountry as any).name}</span> {(popCountry as any).flag}
                              </div>
                              <div className="space-y-1 flex flex-col items-center">
                                {!isHardMode && (
                                  <div className="flex flex-col gap-1 items-center">
                                    <span className="font-bold text-foreground text-[11px] leading-tight">{extractBonusText((popCountry as any).stats.population.description, "Population")}</span>
                                    <div className="text-[9px] font-bold px-1.5 py-0.5 rounded w-max text-foreground bg-secondary/50">Pop Bonus</div>
                                  </div>
                                )}
                                <p className="text-[10px] text-muted-foreground/80 leading-snug italic line-clamp-3 mt-1 text-center">"{(popCountry as any).stats.population.description}"</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center w-full gap-3">
                            <div className="text-base md:text-lg font-bold text-foreground flex items-center justify-center gap-2">
                              {(sizeCountry as any).flag} {(sizeCountry as any).name}
                            </div>
                            <div className="grid grid-cols-2 gap-3 w-full">
                              <div className="space-y-1 flex flex-col items-center text-center">
                                {!isHardMode && (
                                  <div className="flex flex-col gap-1 items-center">
                                    <span className="font-bold text-foreground text-[11px] leading-tight">{extractBonusText((sizeCountry as any).stats.size.description, "Size")}</span>
                                    <div className="text-[9px] font-bold px-1.5 py-0.5 rounded w-max text-foreground bg-secondary/50">Size Bonus</div>
                                  </div>
                                )}
                                <p className="text-[10px] text-muted-foreground/80 leading-snug italic line-clamp-3 mt-1 text-center">"{(sizeCountry as any).stats.size.description}"</p>
                              </div>
                              <div className="space-y-1 flex flex-col items-center text-center">
                                {!isHardMode && (
                                  <div className="flex flex-col gap-1 items-center">
                                    <span className="font-bold text-foreground text-[11px] leading-tight">{extractBonusText((popCountry as any).stats.population.description, "Population")}</span>
                                    <div className="text-[9px] font-bold px-1.5 py-0.5 rounded w-max text-foreground bg-secondary/50">Pop Bonus</div>
                                  </div>
                                )}
                                <p className="text-[10px] text-muted-foreground/80 leading-snug italic line-clamp-3 mt-1 text-center">"{(popCountry as any).stats.population.description}"</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>`;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  const replaceStart = content.indexOf('<div className="w-full mt-2">');
  if (replaceStart === -1) {
    console.log(`Could not find start in ${file}`);
    return;
  }
  
  // Find the exact matching </div>
  let replaceEnd = -1;
  let divCount = 0;
  for (let i = replaceStart; i < content.length; i++) {
    if (content.substr(i, 4) === '<div') {
      divCount++;
    } else if (content.substr(i, 5) === '</div') {
      divCount--;
      if (divCount === 0) {
        replaceEnd = i + 6; // include </div>
        break;
      }
    }
  }

  if (replaceEnd !== -1) {
    const toReplace = content.substring(replaceStart, replaceEnd);
    content = content.replace(toReplace, newContentStr);
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  } else {
    console.log(`Could not find end in ${file}`);
  }
});
