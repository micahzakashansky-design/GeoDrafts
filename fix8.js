const fs = require('fs');

const text = fs.readFileSync('artifacts/country-draft/src/pages/Game.tsx', 'utf8');
let lines = text.split('\n');

// The issue was:
// artifacts/country-draft typecheck: src/pages/Game.tsx(922,7): error TS17015: Expected corresponding closing tag for JSX fragment.
// Wait, when we removed 922, we got:
// artifacts/country-draft typecheck: src/pages/Game.tsx(946,13): error TS1003: Identifier expected.
// artifacts/country-draft typecheck: src/pages/Game.tsx(947,10): error TS1381: Unexpected token. Did you mean `{'}'}` or `&rbrace;`?
// Let's check lines 944-950
for (let i=940; i<955; i++) {
    console.log(i + 1, lines[i]);
}
