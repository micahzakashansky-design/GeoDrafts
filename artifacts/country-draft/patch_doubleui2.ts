import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/pages/double/DoubleUI.tsx', 'utf8');

content = content.replace(
  /unlockAchievements\(firebaseUser\.uid, achievementsRef\.current\)\.catch\(console\.error\);/g,
  `processGameEndStats(firebaseUser.uid, {
            mode: "double",
            score: totalScore,
            roster,
            totalTimeMs: categoryTimes ? Object.values(categoryTimes).reduce((a, b) => a + b, 0) : undefined,
            achievementsToUnlock: achievementsRef.current
          }).catch(console.error);`
);

writeFileSync('src/pages/double/DoubleUI.tsx', content);
