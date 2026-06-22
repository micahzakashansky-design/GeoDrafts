import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/pages/guess/GuessGame.tsx', 'utf8');

// Add extractBonusText to imports
if (!content.includes('extractBonusText')) {
  content = content.replace(
    'import { CATEGORIES, CATEGORY_ICONS, getCategoryKey } from "@/pages/daily/DailyUI";',
    'import { CATEGORIES, CATEGORY_ICONS, getCategoryKey } from "@/pages/daily/DailyUI";\nimport { extractBonusText } from "@/data/countries";'
  );
}

// Replace the mapping function again
const regex = /\{CATEGORIES\.map\(cat => \{[\s\S]*?const stat = state\.mysteryCountry!\.stats\[getCategoryKey\(cat\)\];\s*if \(!stat\) return null;\s*return \([\s\S]*?<\/div>\s*\);\s*\}\)\}/;

const replacement = `{CATEGORIES.map(cat => {
                    const stat = state.mysteryCountry!.stats[getCategoryKey(cat)];
                    if (!stat) return null;
                    const isBonus = cat === "Size" || cat === "Population";
                    return (
                      <div key={cat} className="bg-muted/30 border border-border rounded-xl p-4 flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-muted-foreground">{CATEGORY_ICONS[cat]}</span>
                          <span className="text-xs font-bold uppercase tracking-widest text-foreground/80">{cat}</span>
                        </div>
                        <p className="text-sm text-muted-foreground flex-1">{stat.description}</p>
                        {stat.score !== undefined ? (
                          <div className="mt-2 text-primary font-mono font-bold">{getPtsDisplay(stat.score, cat)}</div>
                        ) : isBonus ? (
                          <div className="mt-2 text-primary font-mono font-bold">{extractBonusText(stat.description, cat)}</div>
                        ) : null}
                      </div>
                    );
                  })}`;

content = content.replace(regex, replacement);

writeFileSync('src/pages/guess/GuessGame.tsx', content);
