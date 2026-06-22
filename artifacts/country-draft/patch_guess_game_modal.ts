import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/pages/guess/GuessGame.tsx', 'utf8');

// 1. Change state declaration
content = content.replace(
  'const [showStatsModal, setShowStatsModal] = useState(false);',
  'const [statsModalCountry, setStatsModalCountry] = useState<Country | null>(null);'
);

// 2. Change the button inside the map
const mapRegex = /<span className=\{isLast && isCorrect \? "text-foreground" : ""\}>\{g\}<\/span>\s*\{isLast && isCorrect && \([\s\S]*?<\/button>\s*\)\}/;

const mapReplacement = `<span className={isLast && isCorrect ? "text-foreground" : ""}>{g}</span>
                                {(() => {
                                   const guessCountry = COUNTRIES.find(c => c.name.toLowerCase() === g.toLowerCase());
                                   if (!guessCountry) return null;
                                   const isWinBtn = isLast && isCorrect;
                                   return (
                                     <button 
                                       onClick={() => setStatsModalCountry(guessCountry)} 
                                       className={\`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 \${isWinBtn ? 'bg-green-500/10 hover:bg-green-500/30' : 'bg-foreground/5 hover:bg-foreground/10'}\`}
                                       title="View Country Stats"
                                     >
                                        <ChevronRight className={\`w-6 h-6 \${isWinBtn ? 'text-green-500' : 'text-muted-foreground'}\`} />
                                     </button>
                                   );
                                })()}`;

content = content.replace(mapRegex, mapReplacement);

// 3. Change the modal trigger
content = content.replace(
  '{showStatsModal && state.mysteryCountry && (',
  '{statsModalCountry && ('
);

// 4. Change the modal close button
content = content.replace(
  'onClick={() => setShowStatsModal(false)}',
  'onClick={() => setStatsModalCountry(null)}'
);

// 5. Change state.mysteryCountry inside the modal to statsModalCountry
// Need to only replace it inside the modal. The modal starts around <motion.div initial={{ opacity: 0 }}
// We can just regex replace state.mysteryCountry with statsModalCountry inside the AnimatePresence block.

const modalRegex = /\{statsModalCountry && \([\s\S]*?<\/AnimatePresence>/;
const modalMatch = content.match(modalRegex);
if (modalMatch) {
  let modalContent = modalMatch[0];
  modalContent = modalContent.replace(/state\.mysteryCountry/g, 'statsModalCountry');
  content = content.replace(modalRegex, modalContent);
}

writeFileSync('src/pages/guess/GuessGame.tsx', content);
