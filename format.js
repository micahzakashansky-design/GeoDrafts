const fs = require('fs');
const content = fs.readFileSync('artifacts/country-draft/src/pages/Game.tsx', 'utf8');

let tags = [];
let idx = 0;
while (idx < content.length) {
    let startTagOpen = content.indexOf('<', idx);
    if (startTagOpen === -1) break;

    // Ignore comments
    if (content.substring(startTagOpen, startTagOpen + 4) === '<!--') {
        idx = content.indexOf('-->', startTagOpen) + 3;
        continue;
    }

    // Ignore code blocks containing html like content (basic heuristic)
    // if inside a string, script, etc. this simple parser will fail, but might help point to the issue.
    idx = startTagOpen + 1;
}
