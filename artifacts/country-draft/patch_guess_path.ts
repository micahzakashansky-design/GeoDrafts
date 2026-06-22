import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/pages/guess/GuessGame.tsx', 'utf8');

// Replace the guess path container and contents
const regex = /<div className="relative border-l-2 border-border\/50 ml-4 md:ml-8 pl-8 md:pl-12 space-y-8">([\s\S]*?)<\/div>\s*<\/div>\s*<div className="mt-12 flex flex-col items-center justify-center gap-4">/;

// First, get everything inside the map except the hintsRevealed part
const replacement = `<div className="flex flex-col items-center space-y-3 w-full">
                     {state.guesses.map((g, idx) => {
                        const isLast = idx === state.guesses.length - 1;
                        const isCorrect = g.toLowerCase() === state.mysteryCountry?.name.toLowerCase();
                        
                        return (
                           <React.Fragment key={idx}>
                              <motion.div 
                                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.15 }}
                                className={\`
                                  flex items-center justify-center text-center font-bold border shadow-sm relative group
                                  \${isLast && isCorrect 
                                    ? "min-w-[16rem] px-6 py-4 rounded-2xl bg-card border-2 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]" 
                                    : "px-6 py-3 rounded-xl bg-muted border-border text-muted-foreground w-3/4"}
                                \`}
                              >
                                <span className={isLast && isCorrect ? "text-foreground" : ""}>{g}</span>
                                {isLast && isCorrect && (
                                   <button 
                                     onClick={() => setShowStatsModal(true)} 
                                     className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 bg-green-500/10 hover:bg-green-500/30 rounded-full transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                                     title="View Country Stats"
                                   >
                                      <ChevronRight className="w-6 h-6 text-green-500" />
                                   </button>
                                )}
                              </motion.div>
                              
                              {!isLast && (
                                <div className="text-muted-foreground opacity-30">
                                  <ArrowDown className="w-5 h-5" />
                                </div>
                              )}
                           </React.Fragment>
                        );
                     })}
                  </div>
               </div>

               <div className="mt-12 flex flex-col items-center justify-center gap-4">`;

content = content.replace(regex, replacement);

// We need to import ArrowDown from lucide-react if not present
if (!content.includes('ArrowDown')) {
  content = content.replace(/import \{([^}]+)\} from "lucide-react";/, 'import { $1, ArrowDown } from "lucide-react";');
}

writeFileSync('src/pages/guess/GuessGame.tsx', content);
