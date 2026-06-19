const fs = require('fs');
const files = [
  'src/pages/daily/DailyUI.tsx',
  'src/pages/double/DoubleUI.tsx',
  'src/pages/guess/GuessUI.tsx',
  'src/pages/normal/NormalUI.tsx',
  'src/pages/party/PartyUI.tsx',
  'src/pages/sabotage/SabotageUI.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  
  // 1. Update signature
  code = code.replace(
    /export function ExpandableDescription\(\{ description \}: \{ description: string \}\) \{/,
    () => 'export function ExpandableDescription({ description, isHovered = false }: { description: string, isHovered?: boolean }) {'
  );
  
  // 2. Update the absolute div and its children
  code = code.replace(
    /<div className="absolute top-\[-8px\] left-\[calc\(-1rem-1px\)\] right-\[calc\(-1rem-1px\)\] md:left-\[calc\(-1\.25rem-1px\)\] md:right-\[calc\(-1\.25rem-1px\)\] bg-card border-x border-b border-border\/50 rounded-b-2xl px-4 md:px-5 pt-\[8px\] pb-4 md:pb-5 z-50 shadow-2xl\">\n\s*<p className="text-\[11px\] md:text-xs text-foreground\/90 leading-relaxed italic">/,
    () => `<div className={\`absolute top-[-8px] left-[calc(-1rem-1px)] right-[calc(-1rem-1px)] md:left-[calc(-1.25rem-1px)] md:right-[calc(-1.25rem-1px)] bg-card border-x border-b rounded-b-2xl px-4 md:px-5 pt-[8px] pb-4 md:pb-5 z-50 shadow-2xl \${isHovered ? "border-primary" : "border-border/50"}\`}>\n          {isHovered && <div className="absolute inset-0 bg-primary/5 animate-pulse rounded-b-2xl pointer-events-none" />}\n          <div className="relative z-10">\n            <p className="text-[11px] md:text-xs text-foreground/90 leading-relaxed italic">`
  );
  
  // 3. Add closing </div> before the end of the expanded block
  code = code.replace(
    /Show Less <ChevronUp className="w-3 h-3 group-hover:-translate-y-0\.5 transition-transform" \/>\n\s*<\/button>\n\s*<\/div>\n\s*\)}/,
    () => `Show Less <ChevronUp className="w-3 h-3 group-hover:-translate-y-0.5 transition-transform" />\n            </button>\n          </div>\n        </div>\n      )}`
  );
  
  // 4. Update the calls inside the map/loop
  code = code.replace(
    /<ExpandableDescription description=\{stat\.description\} \/>/g,
    () => '<ExpandableDescription description={stat.description} isHovered={isHovered} />'
  );

  code = code.replace(
    /<ExpandableDescription description=\{country\.knownFor\} \/>/g,
    () => '<ExpandableDescription description={country.knownFor} isHovered={isHovered} />'
  );

  fs.writeFileSync(file, code);
}
console.log('done');
