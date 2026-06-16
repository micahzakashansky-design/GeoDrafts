const fs = require('fs');

let text = fs.readFileSync('artifacts/country-draft/src/pages/Game.tsx', 'utf8');
let lines = text.split('\n');

// 947 is `          </>`
// 948 is `        )}`
// These are extra! Or rather, 923 `  </>` and 924 `)}` closed `{!state.gameOver && (`
// Wait, why would there be a duplicate closing?
// Let's remove 947 and 948 and see what happens.
// Actually let's look at what is after 924: `        <div className="flex-1 flex flex-col overflow-y-auto relative">`
// This div is opened at 925.
// It is closed at 946: `    </div>`
// This makes sense! The right side "game over/lobby/guessing" content.
// Wait, is it inside `{!state.gameOver && (` or not?
// No, it handles `state.gameOver ? (...) : room && room.status === "waiting" ? (...) : ...`
// So it is ALWAYS rendered, regardless of `!state.gameOver`.
// Ah! Wait! In the previous commits, was the right side INSIDE `{!state.gameOver && (` ?
// If we look at line 759: `{!state.gameOver && (`
// It renders the SIDEBAR.
// So the Sidebar is rendered only when NOT game over.
// And it was wrapped in a Fragment `<>` at 760.
// So it should close `</>` and `)}` right AFTER the sidebar.
// This is exactly what lines 923 and 924 are doing!
// BUT line 922 `    </div>` is an EXTRA div.
// Wait, if line 922 is extra, AND 947 `          </>` and 948 `        )}` are extra, then we should just remove 922, 947, and 948.

lines.splice(947, 1); // remove line 948 `        )}`
lines.splice(946, 1); // remove line 947 `          </>`
lines.splice(921, 1); // remove line 922 `    </div>`

fs.writeFileSync('artifacts/country-draft/src/pages/Game.tsx', lines.join('\n'));
