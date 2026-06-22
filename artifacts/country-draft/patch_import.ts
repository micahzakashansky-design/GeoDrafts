import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/pages/guess/GuessGame.tsx', 'utf8');

content = content.replace(
  'type Country, type Category,',
  'type Country, type Category, extractBonusText,'
);

writeFileSync('src/pages/guess/GuessGame.tsx', content);
