const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
      results.push(filePath);
    }
  }
  return results;
}

const files = walk('/Users/micahzakashansky/.gemini/antigravity/scratch/GeoDrafts/artifacts/country-draft/src');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replacements
  // Backgrounds
  content = content.replace(/bg-\[\#000000\]/g, 'bg-background');
  content = content.replace(/bg-\[\#080808\]/g, 'bg-card');
  content = content.replace(/bg-white\/5/g, 'bg-foreground/5');
  content = content.replace(/bg-white\/10/g, 'bg-foreground/10');
  content = content.replace(/bg-white\/20/g, 'bg-foreground/20');
  
  // Gradients
  content = content.replace(/from-\[\#080808\]/g, 'from-background');

  // Text colors
  content = content.replace(/text-white\/30/g, 'text-muted-foreground');
  content = content.replace(/text-white\/40/g, 'text-muted-foreground');
  content = content.replace(/text-white\/50/g, 'text-muted-foreground');
  content = content.replace(/text-white\/60/g, 'text-muted-foreground/80');
  content = content.replace(/text-white\/70/g, 'text-muted-foreground/80');
  content = content.replace(/text-white\/80/g, 'text-foreground/80');
  // Avoid replacing text-white inside `bg-red-500 text-white` because that is fully legible!
  // Same for `bg-emerald-500 text-white`, `bg-purple-500 text-white`, `bg-blue-500 text-white`, `text-white bg-indigo-600` etc.
  // Actually, I can just do a global replace for `text-white` but wait! `bg-red-500 text-white` is very common and completely legible.
  // We don't want to replace `text-white` there.
  // Let's do a more precise regex. But it might be complex. Let's just do a blanket replace and then fix the obvious ones:
  content = content.replace(/text-white(?![\/\w])/g, 'text-foreground');
  
  // Now revert text-foreground back to text-white if it's next to a solid dark background class
  // For example: `bg-red-500 text-foreground` -> `bg-red-500 text-white`
  // Actually, wait, `text-foreground` on `bg-red-500` will be dark in light mode, which is BAD.
  const solidColors = ['red', 'emerald', 'purple', 'blue', 'indigo', 'green', 'amber', 'pink'];
  for (const color of solidColors) {
    const regex1 = new RegExp(`bg-${color}-([56]00)\\s+([^"']*)text-foreground`, 'g');
    content = content.replace(regex1, `bg-${color}-$1 $2text-white`);
    const regex2 = new RegExp(`text-foreground\\s+([^"']*)bg-${color}-([56]00)`, 'g');
    content = content.replace(regex2, `text-white $1bg-${color}-$2`);
  }
  
  // Borders
  content = content.replace(/border-white\/5(?!0)/g, 'border-border/50');
  content = content.replace(/border-white\/10/g, 'border-border');
  content = content.replace(/border-white\/20/g, 'border-border');
  content = content.replace(/border-white\/30/g, 'border-border');
  
  // Rings and Shadows
  content = content.replace(/ring-white\/10/g, 'ring-border');
  content = content.replace(/ring-white\/20/g, 'ring-border');
  content = content.replace(/ring-black\/50/g, 'ring-border');
  content = content.replace(/shadow-\[inset_0_1px_0_rgba\(255\\?,255\\?,255\\?,0\.1\)\]/g, 'shadow-sm');

  // Selection
  content = content.replace(/selection:bg-white\/20/g, 'selection:bg-primary/20');
  
  // Placeholder
  content = content.replace(/placeholder:text-foreground\/40/g, 'placeholder:text-muted-foreground');
  content = content.replace(/placeholder:text-white\/40/g, 'placeholder:text-muted-foreground');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
