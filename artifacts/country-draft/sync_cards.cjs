const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const modes = ['normal', 'daily', 'double', 'party', 'sabotage', 'guess'];

modes.forEach(mode => {
  const gameSharedFile = path.join(srcDir, 'pages', mode, 'GameShared.tsx');
  if (fs.existsSync(gameSharedFile)) {
    let shared = fs.readFileSync(gameSharedFile, 'utf8');
    
    // 1. Change getRating icons to w-5 h-5
    // Because we just changed them in the last step, let's just replace the exact lines
    shared = shared.replace(/w-6 h-6 text-yellow-400/g, 'w-5 h-5 text-yellow-400');
    shared = shared.replace(/w-6 h-6 text-blue-400/g, 'w-5 h-5 text-blue-400');
    shared = shared.replace(/w-6 h-6 text-green-400/g, 'w-5 h-5 text-green-400');
    shared = shared.replace(/w-6 h-6 text-orange-400/g, 'w-5 h-5 text-orange-400');
    shared = shared.replace(/w-6 h-6 text-red-400/g, 'w-5 h-5 text-red-400');

    // 2. We need to replace the entire grid layout.
    // Let's use a regex to match the grid container
    // Since it's multiline and could be complex, I'll match the start and end of the block.
    // The grid starts with <div className={`grid grid-cols-1 sm:grid-cols-2 ${bPath ? "lg:grid-cols-3" : ""} gap-4 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200`}>
    // and ends before <div className="space-y-4">
    
    const newGrid = `<div className={\`grid grid-cols-1 sm:grid-cols-2 \${bPath ? "lg:grid-cols-3" : ""} gap-4 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200\`}>
          <div className="p-4 md:p-5 rounded-2xl bg-card border border-border shadow-sm flex items-start gap-4">
            <div className="p-3 bg-secondary/30 rounded-xl shrink-0">{archetype.icon}</div>
            <div><h3 className="font-bold text-foreground text-sm md:text-base mb-1">{archetype.name}</h3><p className="text-xs text-muted-foreground">{archetype.desc}</p></div>
          </div>
          <div className="p-4 md:p-5 rounded-2xl bg-card border border-border shadow-sm flex items-start gap-4">
            <div className="p-3 bg-secondary/30 rounded-xl shrink-0">{rating.icon}</div>
            <div><h3 className="font-bold text-foreground text-sm md:text-base mb-1">{rating.label}</h3><p className="text-xs text-muted-foreground">{rating.desc}</p></div>
          </div>
          {bPath && (
            <div className="p-4 md:p-5 rounded-2xl bg-card border border-border shadow-sm flex items-start gap-4">
              <div className="p-3 bg-secondary/30 rounded-xl shrink-0">{bPath === "agricultural" ? <Leaf className="w-5 h-5 text-yellow-400" /> : <Building className="w-5 h-5 text-yellow-400" />}</div>
              <div><h3 className="font-bold text-foreground text-sm md:text-base mb-1">{bPath === "agricultural" ? "Agricultural Giant" : "Urban Powerhouse"}</h3><p className="text-xs text-muted-foreground">{bPath === "agricultural" ? "Vast lands with sparse population." : "Dense population in a compact area."}</p></div>
            </div>
          )}
        </div>`;

    // Let's replace by finding the index
    const startIndex = shared.indexOf('<div className={`grid grid-cols-1 sm:grid-cols-2 ${bPath ? "lg:grid-cols-3" : ""} gap-4');
    const endIndex = shared.indexOf('<div className="space-y-4">', startIndex);
    
    if (startIndex !== -1 && endIndex !== -1) {
      shared = shared.substring(0, startIndex) + newGrid + '\n        ' + shared.substring(endIndex);
    }

    fs.writeFileSync(gameSharedFile, shared);
  }
});

console.log('Grid styles synced.');
