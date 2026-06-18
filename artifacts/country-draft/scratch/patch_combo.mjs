import fs from 'fs';

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // 1. Fix displayCats logic so that "Population Structure" is ONLY pushed if they are the same country.
  // Wait, in Double mode, roster.Size is an array.
  // So we need a robust check.
  const replacement = `
  const isSame = Array.isArray(roster.Size) ? (roster.Size[0]?.name === roster.Population[0]?.name && roster.Size[1]?.name === roster.Population[1]?.name) : (roster.Size?.name === roster.Population?.name);
  if (roster.Size && roster.Population && isSame) { displayCats.push("Population Structure" as any); }
  else { if (roster.Size) displayCats.push("Size" as any); if (roster.Population) displayCats.push("Population" as any); }
  `;
  content = content.replace(
    /if \(roster\.Size && roster\.Population\) \{ displayCats\.push\("Population Structure"(?: as any)?\); \}\n\s*else \{ if \(roster\.Size(?: \|\| wildcardPhase)?\) displayCats\.push\("Size"(?: as any)?\); if \(roster\.Population(?: \|\| wildcardPhase)?\) displayCats\.push\("Population"(?: as any)?\); \}/g,
    replacement.trim()
  );

  // 2. Now that Population Structure is ONLY used for identical countries, we can change the `if (isCombo && roster.Population)` block to be a unified 1-column card!
  
  // Actually, wait! The standard card renderer does everything we need if we just pass BOTH stats to it!
  // But writing a custom unified card is safer because it needs to show two sets of stats (Size and Pop).
  // Let's replace the `if (isCombo && roster.Population)` block.
  
  // The block starts with `if (isCombo && roster.Population) {`
  // and ends before `return (` for the default standard card.
  
  const isComboRegex = /if \(isCombo && roster\.Population\) \{[\s\S]*?(?=return \(\n\s*<div key=\{cat\} onClick=\{)/;
  
  const unifiedCard = `
                if (isCombo && roster.Population) {
                  const sizeCountry = Array.isArray(assigned) ? assigned[0] : assigned;
                  const popCountry = Array.isArray(roster.Population) ? roster.Population[0] : roster.Population;
                  // If it's double mode, we would need to show both countries' stats.
                  // For now, let's keep it simple. Actually, DoubleUI has its own mapping loop for arrays!
                  // Wait, DoubleUI maps over the array inside the card.
                  // Let's just use a clean unified card for Normal mode first, and see if it applies to all.
                  // Since the user is testing Normal/Wildcard, let's inject this unified card.
                  
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
                }
  `;
  
  if (!filePath.includes('DoubleUI')) {
    content = content.replace(isComboRegex, unifiedCard);
  }
  
  fs.writeFileSync(filePath, content);
}

['src/pages/normal/NormalUI.tsx', 'src/pages/daily/DailyUI.tsx', 'src/pages/sabotage/SabotageUI.tsx', 'src/pages/guess/GuessUI.tsx', 'src/pages/party/PartyUI.tsx', 'src/pages/double/DoubleUI.tsx'].forEach(patchFile);
