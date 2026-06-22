import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/pages/guess/GuessGame.tsx', 'utf8');

const regex = /\{CATEGORIES\.filter\(c => !BONUS_CATEGORIES\.includes\(c\)\)\.map\(cat => \{[\s\S]*?const stat = state\.mysteryCountry!\.stats\[getCategoryKey\(cat\)\];\s*return \([\s\S]*?<div className="mt-2 text-primary font-mono font-bold">\{getPtsDisplay\(stat\.score \?\? 0, cat\)\}<\/div>\s*<\/div>\s*\);\s*\}\)\}/;

const replacement = `{CATEGORIES.map(cat => {
                    const stat = state.mysteryCountry!.stats[getCategoryKey(cat)];
                    if (!stat) return null;
                    return (
                      <div key={cat} className="bg-muted/30 border border-border rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-muted-foreground">{CATEGORY_ICONS[cat]}</span>
                          <span className="text-xs font-bold uppercase tracking-widest text-foreground/80">{cat}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{stat.description}</p>
                        {stat.score !== undefined && (
                          <div className="mt-2 text-primary font-mono font-bold">{getPtsDisplay(stat.score, cat)}</div>
                        )}
                      </div>
                    );
                  })}`;

content = content.replace(regex, replacement);

writeFileSync('src/pages/guess/GuessGame.tsx', content);
