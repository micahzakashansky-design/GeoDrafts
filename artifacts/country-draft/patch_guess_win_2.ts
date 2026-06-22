import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/pages/guess/GuessGame.tsx', 'utf8');

const regex = /\{\(state\.hintsRevealed \|\| 0\) > 0 && \([\s\S]*?<\/div>\n\s*\)\}/;

const replacement = `{(state.hintsRevealed || 0) > 0 && (
                        <div className="text-sm font-bold text-muted-foreground mt-2 text-center">
                          ({state.guesses.length} {state.guesses.length === 1 ? "guess" : "guesses"}, {state.hintsRevealed} {state.hintsRevealed === 1 ? "hint" : "hints"})
                        </div>
                      )}`;

content = content.replace(regex, replacement);

writeFileSync('src/pages/guess/GuessGame.tsx', content);
