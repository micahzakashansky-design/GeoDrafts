import fs from 'fs';

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Replace the first displayCats logic
  content = content.replace(
    /if \(roster\.Size && roster\.Population\) \{ displayCats\.push\("Population Structure" as any\); \}\n\s*else \{ if \(roster\.Size\) displayCats\.push\("Size"\); if \(roster\.Population\) displayCats\.push\("Population"\); \}/,
    `const isSame = Array.isArray(roster.Size) ? (roster.Size[0]?.name === roster.Population[0]?.name && roster.Size[1]?.name === roster.Population[1]?.name) : (roster.Size?.name === roster.Population?.name);
  if (roster.Size && roster.Population && isSame) { displayCats.push("Population Structure" as any); }
  else { if (roster.Size) displayCats.push("Size" as any); if (roster.Population) displayCats.push("Population" as any); }`
  );

  // Replace the second displayCats logic
  content = content.replace(
    /if \(roster\.Size && roster\.Population\) \{ displayCats\.push\("Population Structure"\); \}\n\s*else \{ if \(roster\.Size \|\| wildcardPhase\) displayCats\.push\("Size"\); if \(roster\.Population \|\| wildcardPhase\) displayCats\.push\("Population"\); \}/,
    `const isSame = Array.isArray(roster.Size) ? (roster.Size[0]?.name === roster.Population[0]?.name && roster.Size[1]?.name === roster.Population[1]?.name) : (roster.Size?.name === roster.Population?.name);
              if (roster.Size && roster.Population && isSame) { displayCats.push("Population Structure"); }
              else { if (roster.Size || wildcardPhase) displayCats.push("Size"); if (roster.Population || wildcardPhase) displayCats.push("Population"); }`
  );
  
  // Replace the isCombo logic carefully
  const startStr = 'if (isCombo && roster.Population) {';
  let startIndex = content.indexOf(startStr);
  if (startIndex !== -1 && !filePath.includes('DoubleUI')) {
    // find the matching closing brace for this if block
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
                  const sizeCountry = Array.isArray(assigned) ? assigned[0] : assigned;
                  const popCountry = Array.isArray(roster.Population) ? roster.Population[0] : roster.Population;
                  return (
                    <div key={cat} onClick={() => { if (isWildcardTarget && !isCombo) onWildcardSelect(actualCat); }} className={\`p-4 md:p-5 rounded-2xl border flex flex-col gap-3 relative transition-all \${isWildcardTarget && !isCombo ? "cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 hover:scale-[1.02] border-border/50 bg-card" : "bg-card border-border/50"}\`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          {CATEGORY_ICONS["Size"]}
                          <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-foreground/80">Population Structure</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-base md:text-lg font-bold text-foreground flex items-center gap-2">{sizeCountry.flag} {sizeCountry.name}</div>
                      </div>
                      <div className="space-y-3 mt-auto">
                        <div className="space-y-1">
                          {!isHardMode && (
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs">{extractBonusText(sizeCountry.stats.size.description, "Size")}</span>
                              <div className="text-[9px] font-bold px-1.5 py-0.5 rounded w-max text-white bg-secondary/50">Size Bonus</div>
                            </div>
                          )}
                          <p className="text-[11px] md:text-xs text-muted-foreground/80 leading-relaxed italic line-clamp-2">"{sizeCountry.stats.size.description}"</p>
                        </div>
                        <div className="space-y-1">
                          {!isHardMode && (
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs">{extractBonusText(popCountry.stats.population.description, "Population")}</span>
                              <div className="text-[9px] font-bold px-1.5 py-0.5 rounded w-max text-white bg-secondary/50">Pop Bonus</div>
                            </div>
                          )}
                          <p className="text-[11px] md:text-xs text-muted-foreground/80 leading-relaxed italic line-clamp-2">"{popCountry.stats.population.description}"</p>
                        </div>
                      </div>
                    </div>
                  );
                }`;
      content = content.substring(0, startIndex) + newBlock + content.substring(endIndex + 1);
    }
  }

  fs.writeFileSync(filePath, content);
}

['src/pages/normal/NormalUI.tsx', 'src/pages/daily/DailyUI.tsx', 'src/pages/sabotage/SabotageUI.tsx', 'src/pages/guess/GuessUI.tsx', 'src/pages/party/PartyUI.tsx', 'src/pages/double/DoubleUI.tsx'].forEach(patchFile);
