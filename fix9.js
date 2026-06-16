const fs = require('fs');
let text = fs.readFileSync('artifacts/country-draft/src/pages/Game.tsx', 'utf8');

// The issue at line 922 `    </div>` closing a fragment incorrectly.
// Let's replace 922's `    </div>` with nothing.
// AND at line 946 `    </div>` is closing the main div `flex-1 flex flex-col overflow-y-auto relative` opened at 925.
// BUT at 947 we have `          </>` closing the fragment opened at 760 `        {!state.gameOver && (` -> `          <>`.
// Ah! Wait!
// 759: `        {!state.gameOver && (`
// 760: `          <>`
// ...
// 923: `  </>`
// 924: `)}`
// This CLOSES `{!state.gameOver && (`
// AND AT 947:
// `          </>`
// `        )}`
// WHAT IS THIS CLOSING?
// Let's find out!

let lines = text.split('\n');
console.log("Line 923:", lines[922]);
console.log("Line 924:", lines[923]);
console.log("Line 947:", lines[946]);
console.log("Line 948:", lines[947]);
