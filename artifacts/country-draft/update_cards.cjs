const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const modes = ['normal', 'daily', 'double', 'party', 'sabotage', 'guess'];

modes.forEach(mode => {
  const gameSharedFile = path.join(srcDir, 'pages', mode, 'GameShared.tsx');
  if (fs.existsSync(gameSharedFile)) {
    let shared = fs.readFileSync(gameSharedFile, 'utf8');
    
    // Update getRating signature
    shared = shared.replace(
      /export function getRating\(total: number\): \{ label: string; color: string; icon: React\.ReactNode \} \{/,
      'export function getRating(total: number): { label: string; color: string; icon: React.ReactNode; desc: string } {'
    );
    
    // Update getRating returns
    shared = shared.replace(
      /return \{ label: "Superpower", color: "text-yellow-400", icon: <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" \/> \};/,
      'return { label: "Superpower", color: "text-yellow-400", icon: <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />, desc: "Unrivaled global influence and capabilities." };'
    );
    shared = shared.replace(
      /return \{ label: "Major Power", color: "text-blue-400", icon: <Globe className="w-6 h-6 text-blue-400" \/> \};/,
      'return { label: "Major Power", color: "text-blue-400", icon: <Globe className="w-6 h-6 text-blue-400" />, desc: "Significant influence on the world stage." };'
    );
    shared = shared.replace(
      /return \{ label: "Regional Power", color: "text-green-400", icon: <Shield className="w-6 h-6 text-green-400" \/> \};/,
      'return { label: "Regional Power", color: "text-green-400", icon: <Shield className="w-6 h-6 text-green-400" />, desc: "Strong capabilities within its geographic sphere." };'
    );
    shared = shared.replace(
      /return \{ label: "Developing Nation", color: "text-orange-400", icon: <TrendingUp className="w-6 h-6 text-orange-400" \/> \};/,
      'return { label: "Developing Nation", color: "text-orange-400", icon: <TrendingUp className="w-6 h-6 text-orange-400" />, desc: "Growing capabilities and emerging potential." };'
    );
    shared = shared.replace(
      /return \{ label: "Struggling State", color: "text-red-400", icon: <Building className="w-6 h-6 text-red-400" \/> \};/,
      'return { label: "Struggling State", color: "text-red-400", icon: <Building className="w-6 h-6 text-red-400" />, desc: "Facing significant challenges and limitations." };'
    );
    
    // Update text rendering
    shared = shared.replace(
      /<p className="text-xs text-muted-foreground">Overall draft performance\.<\/p>/,
      '<p className="text-xs text-muted-foreground">{rating.desc}</p>'
    );
    
    // Update Grid layout
    shared = shared.replace(
      /<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200">/,
      '<div className={`grid grid-cols-1 sm:grid-cols-2 ${bPath ? "lg:grid-cols-3" : ""} gap-4 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200`}>'
    );
    
    fs.writeFileSync(gameSharedFile, shared);
  }
});

console.log('GameOver updated again.');
