import fs from 'fs';

const files = [
  'src/pages/daily/DailyUI.tsx',
  'src/pages/double/DoubleUI.tsx',
  'src/pages/party/PartyUI.tsx',
  'src/pages/sabotage/SabotageUI.tsx',
  'src/pages/normal/NormalUI.tsx',
  'src/pages/guess/GuessUI.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  
  content = content.replace(
    /className="text-\[10px\] uppercase font-bold text-primary mt-auto pt-1 hover:underline text-left">\s*\{expanded \? "Show Less" : "Show More"\}\s*<\/button>/,
    `className="text-[10px] uppercase font-bold text-primary mt-auto flex items-center gap-1 hover:bg-primary/20 px-2 py-1 rounded -ml-2 transition-colors w-max text-left">\n          {expanded ? "Show Less" : "Show More"}\n          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}\n        </button>`
  );
  
  fs.writeFileSync(file, content);
  console.log('Fixed ' + file);
}
