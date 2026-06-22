import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/pages/normal/NormalUI.tsx', 'utf8');

// Replace unlockAchievements import
content = content.replace(
  /import { saveScore, checkDailySubmitted, unlockAchievements, saveDailyState, checkUsernameExists } from "@\/lib\/firestore";/,
  'import { saveScore, checkDailySubmitted, unlockAchievements, processGameEndStats, saveDailyState, checkUsernameExists } from "@/lib/firestore";'
);
if (!content.includes('processGameEndStats')) {
  // Try another regex if it didn't match perfectly
  content = content.replace(
    /import {([^}]+)unlockAchievements([^}]+)} from "@\/lib\/firestore";/,
    'import {$1unlockAchievements, processGameEndStats$2} from "@/lib/firestore";'
  );
}

// In the useEffect for unmount, replace unlockAchievements with processGameEndStats
content = content.replace(
  /unlockAchievements\(firebaseUser\.uid, achievementsRef\.current\)\.catch\(console\.error\);/g,
  `processGameEndStats(firebaseUser.uid, {
            mode: "normal",
            score: total,
            roster,
            totalTimeMs: Object.values(categoryTimes).reduce((a, b) => a + b, 0),
            achievementsToUnlock: achievementsRef.current
          }).catch(console.error);`
);

writeFileSync('src/pages/normal/NormalUI.tsx', content);
