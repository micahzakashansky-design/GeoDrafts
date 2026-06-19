import fs from 'fs';
import path from 'path';

const files = [
  'src/pages/Leaderboard.tsx',
  'src/pages/party/SubmitDialog.tsx',
  'src/pages/sabotage/SubmitDialog.tsx',
  'src/pages/daily/SubmitDialog.tsx',
  'src/pages/guess/SubmitDialog.tsx',
  'src/pages/double/SubmitDialog.tsx',
  'src/pages/normal/SubmitDialog.tsx'
];

for (const file of files) {
  const filePath = path.resolve(file);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf-8');
  content = content.replace(/❓ /g, '🤔 ');
  fs.writeFileSync(filePath, content);
}

console.log('Replaced emoji');
