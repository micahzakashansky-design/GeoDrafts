import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/lib/firestore.ts', 'utf8');

const regex = /const today = new Date\(\)\.toISOString\(\)\.slice\(0, 10\);/g;
const replacement = 'const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });';

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  writeFileSync('src/lib/firestore.ts', content);
  console.log('Replaced today definition in firestore.ts');
} else {
  console.log('Regex not found in firestore.ts');
}
