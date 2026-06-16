const fs = require('fs');

let text = fs.readFileSync('artifacts/country-draft/src/pages/Game.tsx', 'utf8');

// Is there a syntax error left? No, typecheck passed, but there were missing tags probably. Wait, what about `pnpm run typecheck` which passed?
// Yes, `pnpm run typecheck` passed! Wait, so the build and typecheck is fine. Let's make sure the site renders.
