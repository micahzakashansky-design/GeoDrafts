const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src', 'pages');
const modes = ['normal', 'daily', 'double', 'party', 'sabotage', 'guess'];

modes.forEach(mode => {
  const filePath = path.join(srcDir, mode, 'SidebarRoster.tsx');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add Plus to lucide-react import
    if (content.includes('lucide-react') && !content.includes('Plus')) {
      content = content.replace(/import\s+\{([^}]+)\}\s+from\s+"lucide-react"/, (match, p1) => {
        return `import { ${p1.trim()}, Plus } from "lucide-react"`;
      });
    }

    // Replace the main wrapper to make it full height
    content = content.replace('<div className="space-y-2">', '<div className="flex flex-col h-full min-h-[400px]">');

    // Replace header
    const oldHeader = `<div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-foreground">Your Roster</h3>
        <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
          {Object.keys(roster).length}/{CATEGORIES.length}
        </span>
      </div>
      <div className="space-y-1.5">`;
    
    const newHeader = `<div className="border-b border-border/50 pb-2 mb-3 px-1 shrink-0">
        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Your Nation's Roster</h3>
      </div>
      <div className="space-y-1.5 flex-1 overflow-y-auto">`;

    content = content.replace(oldHeader, newHeader);

    // Replace empty state
    const oldEmptyState = `{Object.keys(roster).length === 0 ? (
          <div className="py-6 text-center rounded-xl border border-dashed border-border/50 bg-secondary/10">
            <p className="text-xs text-muted-foreground font-medium">Select a category on the right<br />to begin drafting.</p>
          </div>
        ) : (`;

    const newEmptyState = `{Object.keys(roster).length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center h-full pb-12 mt-12">
            <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
              <Plus className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-foreground/90 mb-1">Your roster is empty</p>
            <p className="text-xs text-muted-foreground">Pick a category to build up your<br/>nation!</p>
          </div>
        ) : (`;
    
    content = content.replace(oldEmptyState, newEmptyState);

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + filePath);
  }
});
