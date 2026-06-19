import fs from 'fs';
import path from 'path';

const scratchDir = '/Users/micahzakashansky/.gemini/antigravity/scratch/GeoDrafts/artifacts/country-draft';
const uiFiles = [
  'src/pages/normal/NormalUI.tsx',
  'src/pages/party/PartyUI.tsx',
  'src/pages/sabotage/SabotageUI.tsx',
  'src/pages/daily/DailyUI.tsx',
  'src/pages/guess/GuessUI.tsx',
  'src/pages/double/DoubleUI.tsx'
];

// 1. Fix Score Text in all UI files
for (const file of uiFiles) {
  const filePath = path.resolve(scratchDir, file);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf-8');
  
  content = content.replace(
    /<span className="font-bold text-primary">\{scoreVal \* weight\} <span className="text-primary\/50 text-xs">\/ \{maxScore\}<\/span> <span className="text-\[10px\] text-muted-foreground">pts<\/span><\/span>/g,
    '<span className="text-lg md:text-xl font-black text-primary">{scoreVal * weight} <span className="text-primary/50 text-sm md:text-base font-bold">/ {maxScore}</span> <span className="text-[11px] md:text-xs text-muted-foreground font-semibold">pts</span></span>'
  );
  
  content = content.replace(
    /<span className="font-bold text-yellow-400">\+\{Math\.floor\(scoreVal \/ 2\)\} <span className="text-\[10px\] text-yellow-400\/60">pts<\/span><\/span>/g,
    '<span className="text-lg md:text-xl font-black text-yellow-400">+{Math.floor(scoreVal / 2)} <span className="text-[11px] md:text-xs text-yellow-400/60 font-semibold">pts</span></span>'
  );

  fs.writeFileSync(filePath, content);
}

// 2. Fix DoubleUI.tsx isCombo logic
const doubleUiPath = path.resolve(scratchDir, 'src/pages/double/DoubleUI.tsx');
let doubleUiContent = fs.readFileSync(doubleUiPath, 'utf-8');

const normalUiPath = path.resolve(scratchDir, 'src/pages/normal/NormalUI.tsx');
let normalUiContent = fs.readFileSync(normalUiPath, 'utf-8');

const brokenBlockStart = doubleUiContent.indexOf('if (isCombo && roster.Population) {');
const brokenBlockEnd = doubleUiContent.indexOf('                return (', brokenBlockStart);
const fixedBlockStart = normalUiContent.indexOf('if (isCombo && roster.Population) {');
const fixedBlockEnd = normalUiContent.indexOf('                return (', fixedBlockStart);

if (brokenBlockStart !== -1 && brokenBlockEnd !== -1 && fixedBlockStart !== -1 && fixedBlockEnd !== -1) {
  const brokenBlock = doubleUiContent.substring(brokenBlockStart, brokenBlockEnd);
  const fixedBlock = normalUiContent.substring(fixedBlockStart, fixedBlockEnd);
  doubleUiContent = doubleUiContent.replace(brokenBlock, fixedBlock);
  fs.writeFileSync(doubleUiPath, doubleUiContent);
}

// 3. Fix Home.tsx (remove title/logo)
const homePath = path.resolve(scratchDir, 'src/pages/Home.tsx');
let homeContent = fs.readFileSync(homePath, 'utf-8');
const logoRegex = /<div className="p-4 rounded-3xl bg-primary\/10 border border-primary\/20 mb-4">\s*<Globe className="w-12 h-12 text-primary" \/>\s*<\/div>\s*<h1 className="font-serif text-5xl font-bold text-foreground mb-2 tracking-tight">GeoDrafts<\/h1>/g;
homeContent = homeContent.replace(logoRegex, '');
homeContent = homeContent.replace(/<p className="text-base text-muted-foreground mb-8 text-center max-w-md">Draft countries/g, '<p className="text-base text-muted-foreground mb-8 text-center max-w-md mt-6">Draft countries');
fs.writeFileSync(homePath, homeContent);

// 4. Fix DoubleDraftGame.tsx wildcard
const gamePath = path.resolve(scratchDir, 'src/pages/double/DoubleDraftGame.tsx');
let gameContent = fs.readFileSync(gamePath, 'utf-8');

gameContent = gameContent.replace(
  '  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);',
  '  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);\n  const [wildcardPhase, setWildcardPhase] = useState(false);'
);

const applyWildcardCode = `
  const applyWildcard = useCallback((cat: Category) => {
    if (!wildcardPhase || state.wildcardUsed) return;
    setState(prev => {
      const newRoster = { ...prev.roster };
      delete newRoster[cat];
      const newPool = [...prev.pool];
      const nextCountry = newPool.pop() || null;
      return { ...prev, roster: newRoster, currentCountry: nextCountry, pool: newPool, wildcardUsed: true, selectionOptions: null };
    });
    setWildcardPhase(false);
  }, [wildcardPhase, state.wildcardUsed]);
`;
gameContent = gameContent.replace(
  '  const assignCountry = useCallback((category: Category) => {',
  applyWildcardCode + '\n  const assignCountry = useCallback((category: Category) => {'
);

gameContent = gameContent.replace(
  'onWildcard={() => {}} onWildcardSelect={() => {}} setWildcardPhase={() => {}} wildcardUsed={false} wildcardPhase={false}',
  'onWildcard={() => setWildcardPhase(true)} onWildcardSelect={applyWildcard} setWildcardPhase={setWildcardPhase} wildcardUsed={state.wildcardUsed} wildcardPhase={wildcardPhase}'
);

fs.writeFileSync(gamePath, gameContent);

console.log("All fixes applied successfully.");
