const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const modes = ['normal', 'daily', 'double', 'party', 'sabotage', 'guess'];

modes.forEach(mode => {
  const gameSharedFile = path.join(srcDir, 'pages', mode, 'GameShared.tsx');
  if (fs.existsSync(gameSharedFile)) {
    let shared = fs.readFileSync(gameSharedFile, 'utf8');
    
    // 1. Remove icon above Draft Complete
    shared = shared.replace(/<div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary\/10 border border-primary\/20 mb-2 md:mb-4">\{rating\.icon\}<\/div>\n\s*/, '');
    
    // 2. Remove the " | Developing Nation" pill next to Final Score
    shared = shared.replace(/<span className="text-muted-foreground\/30 hidden sm:block">\|<\/span>\n\s*<span className={`font-bold \$\{rating\.color\} px-3 py-1 rounded-full bg-background border border-border shadow-sm`}>\{rating\.label\}<\/span>\n\s*/, '');
    
    // 3. Remove the Includes +6 bonus
    shared = shared.replace(/\{bonus > 0 && \(<p className="text-xs text-muted-foreground font-medium">Includes <span className="text-yellow-400 font-bold">\+\{bonus\}<\/span> size\/population bonus<\/p>\)\}\n\s*/, '');
    
    // 4. Modify grid
    shared = shared.replace(/grid-cols-1 sm:grid-cols-2 gap-4/g, 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4');
    
    // 5. Add Rating Card after Archetype Card
    const target = `<div><h3 className="font-bold text-foreground text-sm md:text-base mb-1">{archetype.name}</h3><p className="text-xs text-muted-foreground">{archetype.desc}</p></div>
          </div>`;
    
    const replacement = `<div><h3 className="font-bold text-foreground text-sm md:text-base mb-1">{archetype.name}</h3><p className="text-xs text-muted-foreground">{archetype.desc}</p></div>
          </div>
          <div className="p-4 md:p-5 rounded-2xl bg-card border border-border shadow-sm flex items-start gap-4">
            <div className="p-3 bg-secondary/30 rounded-xl shrink-0">{rating.icon}</div>
            <div><h3 className={\`font-bold text-sm md:text-base mb-1 \${rating.color}\`}>{rating.label}</h3><p className="text-xs text-muted-foreground">Overall draft performance.</p></div>
          </div>`;
          
    shared = shared.replace(target, replacement);
    
    fs.writeFileSync(gameSharedFile, shared);
  }
});

console.log('GameOver updated.');
