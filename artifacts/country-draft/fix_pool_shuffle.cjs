const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const modes = ['normal', 'daily', 'double', 'party', 'sabotage', 'guess'];

modes.forEach(mode => {
  const gameFileMap = {
    normal: 'NormalGame.tsx',
    daily: 'DailyGame.tsx',
    double: 'DoubleDraftGame.tsx',
    party: 'PartyGame.tsx',
    sabotage: 'SabotageGame.tsx',
    guess: 'GuessGame.tsx'
  };
  const gameSharedFile = path.join(srcDir, 'pages', mode, gameFileMap[mode]);
  if (fs.existsSync(gameSharedFile)) {
    let content = fs.readFileSync(gameSharedFile, 'utf8');
    
    // String replacement
    content = content.replace(
      /let pool = \[\.\.\.COUNTRIES\];\s*shuffleArray\(pool\);/g,
      'let pool = shuffleArray([...COUNTRIES]);'
    );
    
    fs.writeFileSync(gameSharedFile, content);
  }
});

console.log('Replaced pool initialization to use return value of shuffleArray.');
