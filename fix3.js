const fs = require('fs');

const text = fs.readFileSync('artifacts/country-draft/src/pages/Game.tsx', 'utf8');
let lines = text.split('\n');

// It looks like `{!state.gameOver && (` was opened earlier and we removed the closing of `</>` and `)}`.
// Let's restore the original file and try to fix it structurally.
