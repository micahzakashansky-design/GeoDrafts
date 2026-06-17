const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const modes = ['normal', 'daily', 'double', 'party', 'sabotage', 'guess'];

modes.forEach(mode => {
  const gameSharedFile = path.join(srcDir, 'pages', mode, 'GameShared.tsx');
  if (fs.existsSync(gameSharedFile)) {
    let shared = fs.readFileSync(gameSharedFile, 'utf8');
    
    // Add font-sans to the Use Wildcard button
    shared = shared.replace(
      /className="text-xs flex items-center gap-1\.5 px-3 py-1\.5 rounded-lg bg-blue-500\/10 text-blue-400 font-semibold hover:bg-blue-500\/20 transition-colors border border-blue-500\/30"/g,
      'className="font-sans text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 font-semibold hover:bg-blue-500/20 transition-colors border border-blue-500/30"'
    );
    
    // Add font-sans to the Cancel button
    shared = shared.replace(
      /className="text-xs flex items-center gap-1\.5 px-3 py-1\.5 rounded-lg bg-secondary text-muted-foreground font-semibold hover:text-foreground transition-colors"/g,
      'className="font-sans text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground font-semibold hover:text-foreground transition-colors"'
    );
    
    fs.writeFileSync(gameSharedFile, shared);
  }
});

console.log('Added font-sans to buttons in GameShared.tsx');
