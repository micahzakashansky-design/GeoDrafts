const fs = require('fs');

const text = fs.readFileSync('artifacts/country-draft/src/pages/Game.tsx', 'utf8');

// There's an extra `</div>` at line 922 in Game.tsx, let's remove it and check if it fixes syntax error
// The code blocks is around 920-925
let lines = text.split('\n');

for (let i=915; i<925; i++) {
    console.log(i + 1, lines[i]);
}

lines.splice(921, 1);

fs.writeFileSync('artifacts/country-draft/src/pages/Game.tsx', lines.join('\n'));
