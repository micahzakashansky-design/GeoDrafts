const fs = require('fs');

const text = fs.readFileSync('artifacts/country-draft/src/pages/Game.tsx', 'utf8');
let lines = text.split('\n');

// 921 is `      </div>`
// 922 is `    </div>`
// 923 is `  </>`
// 924 is `)}`

// Let's replace those with just `      </div>`
// wait, we also have to trace `{rosterOpen && (` from 762... wait no, `{!state.gameOver && (` from 759
// `<div className="fixed md:relative ...` from 766
// `<div className="px-4 py-3 ...` 768-778
// `<div className="flex-1 p-3 ...` 779-921

lines.splice(921, 2);

fs.writeFileSync('artifacts/country-draft/src/pages/Game.tsx', lines.join('\n'));
