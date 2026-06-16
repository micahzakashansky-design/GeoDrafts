const fs = require('fs');

const text = fs.readFileSync('artifacts/country-draft/src/pages/Game.tsx', 'utf8');

let lines = text.split('\n');

for (let i=940; i<955; i++) {
    console.log(i + 1, lines[i]);
}

// remove </>, let's see.
lines.splice(945, 1);

fs.writeFileSync('artifacts/country-draft/src/pages/Game.tsx', lines.join('\n'));
