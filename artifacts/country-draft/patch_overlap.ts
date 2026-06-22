import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/pages/guess/GuessGame.tsx', 'utf8');

content = content.replace(
  /"px-6 py-4 rounded-2xl bg-card border-2 border-green-500\/50 shadow-\[0_0_15px_rgba\(34,197,94,0\.2\)\]"/g,
  '"min-w-[16rem] px-6 py-4 rounded-2xl bg-card border-2 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]"'
);

writeFileSync('src/pages/guess/GuessGame.tsx', content);
