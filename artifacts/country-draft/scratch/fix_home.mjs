import fs from 'fs';
import path from 'path';

const homePath = '/Users/micahzakashansky/.gemini/antigravity/scratch/GeoDrafts/artifacts/country-draft/src/pages/Home.tsx';
let content = fs.readFileSync(homePath, 'utf-8');

// Remove from header
content = content.replace(
  /<div className="flex items-center gap-3">\s*<Globe className="w-6 h-6 text-primary" \/>\s*<span className="font-serif text-xl font-bold text-foreground tracking-tight">GeoDrafts<\/span>\s*<\/div>/,
  '<div className="flex items-center gap-3"></div>'
);

// Add back to center
content = content.replace(
  /<p className="text-base text-muted-foreground mb-8 text-center max-w-md mt-6">Draft countries and build the ideal nation in various competitive and solo modes\.<\/p>/,
  `<div className="p-4 rounded-3xl bg-primary/10 border border-primary/20 mb-4">
              <Globe className="w-12 h-12 text-primary" />
            </div>
            <h1 className="font-serif text-5xl font-bold text-foreground mb-2 tracking-tight">GeoDrafts</h1>
            <p className="text-base text-muted-foreground mb-8 text-center max-w-md">Draft countries and build the ideal nation in various competitive and solo modes.</p>`
);

fs.writeFileSync(homePath, content);
console.log("Fixed Home.tsx");
