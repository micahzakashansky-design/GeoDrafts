const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const modes = ['normal', 'daily', 'double', 'party', 'sabotage', 'guess'];

modes.forEach(mode => {
  const gameSharedFile = path.join(srcDir, 'pages', mode, 'GameShared.tsx');
  if (fs.existsSync(gameSharedFile)) {
    let shared = fs.readFileSync(gameSharedFile, 'utf8');
    
    // Replace the exact span rendering the points
    shared = shared.replace(
      /<span className="font-bold text-primary">\{scoreVal \* weight\} <span className="text-\[10px\] text-muted-foreground">pts<\/span><\/span>/g,
      '<span className="font-bold text-primary">{scoreVal * weight} <span className="text-primary/50 text-xs">/ {maxScore}</span> <span className="text-[10px] text-muted-foreground">pts</span></span>'
    );
    
    fs.writeFileSync(gameSharedFile, shared);
  }
});

console.log('Roster scores updated.');
