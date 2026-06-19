import fs from 'fs';
let content = fs.readFileSync('/Users/micahzakashansky/.gemini/antigravity/brain/3ebedef2-fda7-4192-8257-efcf80266e97/task.md', 'utf-8');
content = content.replace('- `[ ]` Implement Sabotage Mode bundled state updates in `SabotageGame.tsx`.', '- `[x]` Implement Sabotage Mode bundled state updates in `SabotageGame.tsx`.');
content = content.replace('- `[ ]` Add indexes to Firebase if needed (since `getTopScores` now uses compound queries, it might need a composite index on `mode` and `score`).', '- `[x]` Add indexes to Firebase if needed (since `getTopScores` now uses compound queries, it might need a composite index on `mode` and `score`).');
content = content.replace('- `[ ]` Verify everything works properly by building.', '- `[x]` Verify everything works properly by building.');
fs.writeFileSync('/Users/micahzakashansky/.gemini/antigravity/brain/3ebedef2-fda7-4192-8257-efcf80266e97/task.md', content);
