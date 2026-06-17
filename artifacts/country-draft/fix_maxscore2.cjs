const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const modes = ['normal', 'daily', 'double', 'party', 'sabotage', 'guess'];

modes.forEach(mode => {
  const gameSharedFile = path.join(srcDir, 'pages', mode, 'GameShared.tsx');
  if (fs.existsSync(gameSharedFile)) {
    let shared = fs.readFileSync(gameSharedFile, 'utf8');
    
    // String replacement instead of regex
    shared = shared.replace(
      'let scoreVal = 0, weight = 1, desc = "";',
      'let scoreVal = 0, weight = 1, desc = "", maxScore = 10;'
    );
    
    fs.writeFileSync(gameSharedFile, shared);
  }
});

console.log('Fixed maxScore scope issue part 2.');
