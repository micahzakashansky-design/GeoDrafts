import fs from 'fs';
let content = fs.readFileSync('/Users/micahzakashansky/.gemini/antigravity/brain/3ebedef2-fda7-4192-8257-efcf80266e97/task.md', 'utf-8');
content = content.replace('- `[ ]` Implement Party Mode zero-latency architecture in `PartyGame.tsx`.', '- `[x]` Implement Party Mode zero-latency architecture in `PartyGame.tsx`.');
fs.writeFileSync('/Users/micahzakashansky/.gemini/antigravity/brain/3ebedef2-fda7-4192-8257-efcf80266e97/task.md', content);
