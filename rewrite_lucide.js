const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('artifacts/country-draft/src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  if (!content.includes('lucide-react')) return;
  
  // Find all import { ... } from "lucide-react";
  const regex = /import\s+\{([^}]+)\}\s+from\s+["']lucide-react["'];?/g;
  let changed = false;
  
  content = content.replace(regex, (match, importsStr) => {
    changed = true;
    const imports = importsStr.split(',').map(s => s.trim()).filter(Boolean);
    
    return imports.map(imp => {
      // Handle "Home as HomeIcon"
      const parts = imp.split(/\s+as\s+/);
      const originalName = parts[0];
      const alias = parts[1] || originalName;
      
      const fileName = originalName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
      
      return `import ${alias} from "lucide-react/dist/esm/icons/${fileName}";`;
    }).join('\n');
  });
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
console.log('Done rewritng lucide-react imports');
