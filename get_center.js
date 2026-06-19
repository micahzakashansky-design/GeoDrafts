const fs = require('fs');
let svg = fs.readFileSync('artifacts/country-draft/public/icon.svg', 'utf8');
const dMatch = svg.match(/d="([^"]+)"/g);
let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

dMatch.forEach(d => {
  const parts = d.replace(/d="/, '').replace(/"$/, '').split(/[\s,MCZzLHV]+/);
  let coords = parts.map(p => parseFloat(p)).filter(n => !isNaN(n));
  
  for (let i = 0; i < coords.length; i += 2) {
    const x = coords[i];
    const y = coords[i+1];
    if (x !== undefined && y !== undefined) {
      if (x > 10 && x < 490) { // filter out background artifacts
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
      }
      if (y > 10 && y < 490) { // filter out background artifacts
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }
});

console.log(`Globe Bounding Box: minX: ${minX}, minY: ${minY}, maxX: ${maxX}, maxY: ${maxY}`);
