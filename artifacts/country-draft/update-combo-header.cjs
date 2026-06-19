const fs = require('fs');
const files = [
  'src/pages/double/DoubleUI.tsx',
  'src/pages/guess/GuessUI.tsx',
  'src/pages/normal/NormalUI.tsx',
  'src/pages/party/PartyUI.tsx',
  'src/pages/sabotage/SabotageUI.tsx'
];

const targetContent = `                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          {CATEGORY_ICONS["Size"]}
                          <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-foreground/80">Population Structure</span>
                        </div>
                      </div>`;

const newContent = `                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          {CATEGORY_ICONS["Size"]}
                          <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-foreground/80">Population Structure</span>
                        </div>
                        <div className="font-bold text-foreground text-xs md:text-sm">
                           +{(sizeCountry as any).stats.size.score + (popCountry as any).stats.population.score} <span className="text-[10px] uppercase tracking-wider opacity-75">pts</span>
                        </div>
                      </div>`;

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
