const fs = require('fs');

const files = [
  'src/pages/double/DoubleDraftGame.tsx',
  'src/pages/guess/GuessGame.tsx'
];

for (const f of files) {
  let content = fs.readFileSync(f, 'utf8');
  
  // DoubleDraftGame
  content = content.replace(/roomCode: null, poolSeed: 0, wildcardTargetCategory: null\n\s*\}\);/g, 
    'roomCode: null, poolSeed: 0, wildcardTargetCategory: null, categoryTimes: {}, currentTurnStartTime: Date.now() });');

  // GuessGame useState
  content = content.replace(/roomCode: null, poolSeed: 0, hintsRevealed: 0\n\s*\};/g, 
    'roomCode: null, poolSeed: 0, hintsRevealed: 0, categoryTimes: {}, currentTurnStartTime: Date.now() };');
    
  // GuessGame doReset
  content = content.replace(/roomCode: null, poolSeed: 0, hintsRevealed: 0\n\s*\}\);/g, 
    'roomCode: null, poolSeed: 0, hintsRevealed: 0, categoryTimes: {}, currentTurnStartTime: Date.now() });');

  fs.writeFileSync(f, content);
}

console.log("Fixed missing state in Guess and Double");
