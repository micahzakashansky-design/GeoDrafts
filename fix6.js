const fs = require('fs');

const text = fs.readFileSync('artifacts/country-draft/src/pages/Game.tsx', 'utf8');
let lines = text.split('\n');

// The issue is `)}` at line 922 without closing `</>` because we removed `</>` in `fix5.js` by splicing 921, 2.
// Wait, originally:
// 921 `      </div>`
// 922 `    </div>`
// 923 `  </>`
// 924 `)}`
// We need to match:
// 759: `        {!state.gameOver && (`
// 760: `          <>`
// Then it opens:
// `            {rosterOpen && (`
// `              <div className="fixed inset-0 ...`
// `              />`
// `            )}`
// `            <div className="fixed md:relative inset-y-0 ...`
// So it needs `            </div>` and `          </>`

// Let's checkout original file and manually patch it.
