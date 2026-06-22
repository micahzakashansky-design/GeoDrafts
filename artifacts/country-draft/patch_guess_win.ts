import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/pages/guess/GuessGame.tsx', 'utf8');

const regex = /\{isWin && \([\s\S]*?<\/div>\n\s*\)\}/;

const replacement = `{isWin && (
                    <div className="flex flex-col items-center justify-center my-4 p-4 rounded-xl bg-primary/10 border border-primary/20 w-fit mx-auto">
                      <span className="text-4xl md:text-6xl font-black text-primary">{Math.max(0, guessScore)} <span className="text-xl md:text-2xl text-primary/60 font-bold">pts</span></span>
                      {(state.hintsRevealed || 0) > 0 && (
                        <div className="text-sm font-bold text-muted-foreground mt-2 text-center">
                          <div>Hints used: {state.hintsRevealed || 0}/4</div>
                          <div className="text-xs">({state.guesses.length} guesses)</div>
                        </div>
                      )}
                    </div>
                 )}`;

content = content.replace(regex, replacement);

writeFileSync('src/pages/guess/GuessGame.tsx', content);
