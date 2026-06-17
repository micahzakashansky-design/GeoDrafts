const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const modes = ['normal', 'daily', 'double', 'party', 'sabotage', 'guess'];

modes.forEach(mode => {
  const gameSharedFile = path.join(srcDir, 'pages', mode, 'GameShared.tsx');
  if (fs.existsSync(gameSharedFile)) {
    let shared = fs.readFileSync(gameSharedFile, 'utf8');
    
    // Replace the specific text color span
    shared = shared.replace(
      /{isCombo && roster\.Population && <span className="text-muted-foreground\/50">\+ {roster\.Population\.flag} {roster\.Population\.name}<\/span>}/g,
      '{isCombo && roster.Population && <><span className="text-muted-foreground/50">+</span> {roster.Population.flag} {roster.Population.name}</>}'
    );
    
    fs.writeFileSync(gameSharedFile, shared);
  }
});

console.log('Fixed Population Structure country name color.');
