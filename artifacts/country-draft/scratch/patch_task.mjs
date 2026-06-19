import fs from 'fs';
let content = fs.readFileSync('/Users/micahzakashansky/.gemini/antigravity/brain/3ebedef2-fda7-4192-8257-efcf80266e97/task.md', 'utf-8');
content = content.replace('- `[ ]` Update `firestore.ts` to use compound queries in `getTopScores` and remove unused `saveDailyState`.', '- `[x]` Update `firestore.ts` to use compound queries in `getTopScores`.');
fs.writeFileSync('/Users/micahzakashansky/.gemini/antigravity/brain/3ebedef2-fda7-4192-8257-efcf80266e97/task.md', content);
