const fs = require('fs');

const text = fs.readFileSync('artifacts/country-draft/src/pages/Game.tsx', 'utf8');
let lines = text.split('\n');

// Find lines 918-925
for (let i=915; i<925; i++) {
    console.log(i + 1, lines[i]);
}

// 921 is `      </div>`
// 922 is `    </div>`
// 923 is `  </>`
// 924 is `)}`

// As seen from `sed -n '750,950p' | grep -n "div"`:
// 18: `            <div className="fixed md:relative ...`
// 21: `              <div className="px-4 py-3 ...`
// 31: `              </div>`
// 32: `              <div className="flex-1 p-3 ...`
// Inside flex-1 p-3:
// 34: `                  <div className="space-y-2">` (roomCode) -> closes at 58
// 60: `                <div className="space-y-1.5">`
// Inside space-y-1.5:
// There is mapping of `CATEGORIES` -> returns `<div>` at 86, closes at 118.
// There is mapping of `assigned` -> returns `<div>` at 130, closes at 159.
// 164: `                </div>` -> closes `space-y-1.5`
// 165: `              </div>` -> Wait, what closes `flex-1 p-3`?
// Oh, at 165, `flex-1 p-3` is NOT closed.
// Wait, 166: `            <div className="space-y-1.5"><p className...` (Draft Categories)
// 171: `                    </div>` -> closes `space-y-1.5` (Draft Categories)
// 172: `      </div>` -> closes `flex-1 p-3 space-y-4`? No, wait.
// Let's remove 1 `</div>` at 922. We did that earlier and got an error about `</>`.
