import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/pages/double/DoubleUI.tsx', 'utf8');

// Replace unlockAchievements import
content = content.replace(
  /import { saveScore, checkUsernameExists } from "@\/lib\/firestore";/,
  'import { saveScore, checkUsernameExists, processGameEndStats } from "@/lib/firestore";'
);
if (!content.includes('processGameEndStats')) {
  // Add it if it wasn't replaced
  content = content.replace(
    /import {([^}]+)saveScore([^}]+)} from "@\/lib\/firestore";/,
    'import {$1saveScore, processGameEndStats$2} from "@/lib/firestore";'
  );
}

// Check where to add it in DoubleUI (it might not have an achievements unlock currently, but we want to add processGameEndStats)
// Let's add it to a useEffect on gameOver
const effect = `
  const achievementsRef = useRef<string[]>([]);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      setTimeout(() => {
        if (!isMounted.current && firebaseUser && !isGuest) {
          processGameEndStats(firebaseUser.uid, {
            mode: "double",
            score: Object.values(roster).reduce((a, c) => a + (c.stats[Object.keys(c.stats)[0] as any]?.score || 0), 0),
            roster,
            totalTimeMs: Object.values(categoryTimes).reduce((a, b) => a + b, 0),
            achievementsToUnlock: [] // Can add Double specific achievements later
          }).catch(console.error);
        }
      }, 100);
    };
  }, [firebaseUser, isGuest, roster, categoryTimes]);
`;

// Only inject if it's the GameOver screen. Let's see how GameOver is defined in DoubleUI.
// Actually, DoubleUI might not have a separate GameOver component.
