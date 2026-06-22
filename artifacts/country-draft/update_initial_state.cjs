const fs = require('fs');

const gameFiles = [
  'src/pages/normal/NormalGame.tsx',
  'src/pages/daily/DailyGame.tsx',
  'src/pages/double/DoubleDraftGame.tsx',
  'src/pages/guess/GuessGame.tsx',
  'src/pages/party/PartyGame.tsx',
  'src/pages/sabotage/SabotageGame.tsx'
];

for (const f of gameFiles) {
  if (!fs.existsSync(f)) continue;
  let content = fs.readFileSync(f, 'utf8');

  // Add initial state inside useState hook
  content = content.replace(
    /(poolSeed:\s*0\s*\n\s*\};)/g,
    `poolSeed: 0, categoryTimes: {}, currentTurnStartTime: Date.now()\n    };`
  );
  
  content = content.replace(
    /(poolSeed:\s*0\,\s*wildcardTargetCategory:\s*null\s*\n\s*\};)/g,
    `poolSeed: 0, wildcardTargetCategory: null, categoryTimes: {}, currentTurnStartTime: Date.now()\n    };`
  );

  // Note: some might have different signatures. I will do a broader regex.
  content = content.replace(
    /poolSeed:\s*0([a-zA-Z0-9,\s_]*?)\n(\s*)\}\;/g,
    (match, p1, p2) => {
      if (p1.includes("categoryTimes")) return match; // already added
      return `poolSeed: 0${p1}, categoryTimes: {}, currentTurnStartTime: Date.now()\n${p2}};`
    }
  );

  fs.writeFileSync(f, content);
}

console.log("Updated Game initial states!");
