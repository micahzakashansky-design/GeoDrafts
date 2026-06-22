const fs = require('fs');

const uiFiles = [
  'src/pages/normal/NormalUI.tsx',
  'src/pages/daily/DailyUI.tsx',
  'src/pages/double/DoubleUI.tsx',
  'src/pages/guess/GuessUI.tsx',
  'src/pages/party/PartyUI.tsx',
  'src/pages/sabotage/SabotageUI.tsx'
];

for (const f of uiFiles) {
  if (!fs.existsSync(f)) continue;
  let content = fs.readFileSync(f, 'utf8');

  // 1. Add categoryTimes to SidebarRoster props
  const srPropsRegex = /export function SidebarRoster\(\{ ([^}]*)\} :\s*\{([^}]*)\}\) \{/g;
  content = content.replace(srPropsRegex, (match, props, types) => {
    if (props.includes('categoryTimes')) return match;
    return `export function SidebarRoster({ ${props}, categoryTimes } : {${types} categoryTimes?: Partial<Record<Category, number>>;}) {`;
  });

  // 2. Add categoryTimes to GameOver props
  const goPropsRegex = /export function GameOver\(\{ ([^}]*)\} :\s*\{([^}]*)\}\) \{/g;
  content = content.replace(goPropsRegex, (match, props, types) => {
    if (props.includes('categoryTimes')) return match;
    return `export function GameOver({ ${props}, categoryTimes } : {${types} categoryTimes?: Partial<Record<Category, number>>;}) {`;
  });

  // 3. Render time in the cards inside SidebarRoster and GameOver
  const catRenderRegex = /(<span className="text-\[9px\] md:text-\[10px\] font-bold uppercase tracking-widest text-white\/80">\{?(sCat|cat|actualCat)\}?<\/span>)(<\/div>)/g;
  content = content.replace(catRenderRegex, 
    `$1
    {categoryTimes?.[$2] !== undefined && (
      <span className="ml-2 text-[8px] md:text-[9px] font-mono bg-black/40 px-1.5 py-0.5 rounded text-white/60">
        {(categoryTimes[$2] / 1000).toFixed(1)}s
      </span>
    )}
    $3`
  );

  // 4. In GameOver, display total time
  const scoreRegex = /(<span className="text-2xl md:text-3xl font-bold text-primary">\{totalScore\}[^<]*<span className="text-sm text-primary\/60">pts<\/span>[^<]*(?:<span[^>]*>.*?<\/span>)?<\/span>)/g;
  content = content.replace(scoreRegex, (match) => {
    return `${match}
    {categoryTimes && Object.keys(categoryTimes).length > 0 && (
      <div className="flex items-center gap-1.5 text-xs md:text-sm text-white/40 mt-1">
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        <span>Total Draft Time: {(Object.values(categoryTimes).reduce((a, b) => a + b, 0) / 1000).toFixed(1)}s</span>
      </div>
    )}`;
  });

  fs.writeFileSync(f, content);
}
console.log("Updated UI rendering!");
