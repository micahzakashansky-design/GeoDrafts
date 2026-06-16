const fs = require('fs');

const text = fs.readFileSync('artifacts/country-draft/src/pages/Game.tsx', 'utf8');
let lines = text.split('\n');

// Original line 922 is an extra `</div>`
lines.splice(921, 1);

// We need to also add an `</>` somewhere maybe? Or maybe the nesting of divs is just wrong.
// Wait, `{!state.gameOver && (`
// line 759: `        {!state.gameOver && (`
// line 760: `          <>`
// Then it opens a `<div className="fixed inset-0 ...">` (conditional)
// Then it opens a `<div className="fixed md:relative inset-y-0 left-0 z-30...`
// Let's trace divs from 766
// `<div className="fixed md:relative ...` (Main Sidebar div)
//   `<div className="px-4 py-3 ...` -> closes at 779
//   `<div className="flex-1 p-3 ...` -> closes at 920
// So Main Sidebar div needs a closing `</div>`.
// Does it have one at 921? Yes!
// Then what is at 922? Another `</div>`!
// Let's remove 922!
