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
  if (!content.includes('lucide-react/dist/esm/icons')) return;
  
  const regex = /import\s+([A-Za-z0-9_]+)\s+from\s+["']lucide-react\/dist\/esm\/icons\/([^"']+)["'];/g;
  let changed = false;
  
  content = content.replace(regex, (match, alias, iconName) => {
    const fullPath = `artifacts/country-draft/node_modules/lucide-react/dist/esm/icons/${iconName}.js`;
    if (!fs.existsSync(fullPath)) {
      // Try to add - before numbers
      let fixed = iconName.replace(/([a-z])([0-9])/g, '$1-$2');
      if (fs.existsSync(`artifacts/country-draft/node_modules/lucide-react/dist/esm/icons/${fixed}.js`)) {
        changed = true;
        return `import ${alias} from "lucide-react/dist/esm/icons/${fixed}";`;
      }
      
      console.log(`Still not found: ${iconName} in ${file}`);
    }
    return match;
  });
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
console.log('Done fixing icons');
