import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/pages/guess/GuessGame.tsx', 'utf8');

const regex = /\(\{state\.guesses\.length\} \{state\.guesses\.length === 1 \? "guess" : "guesses"\}, \{state\.hintsRevealed\} \{state\.hintsRevealed === 1 \? "hint" : "hints"\}\)/;
const replacement = `({state.guesses.length} {state.guesses.length === 1 ? "guess" : "guesses"} + {state.hintsRevealed} {state.hintsRevealed === 1 ? "hint" : "hints"})`;

content = content.replace(regex, replacement);

writeFileSync('src/pages/guess/GuessGame.tsx', content);
