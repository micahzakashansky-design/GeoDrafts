import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/pages/daily/DailyGame.tsx', 'utf8');

content = content.replace(
  /import { savePersonalScore, formatRoster } from "@\/lib\/local-leaderboard";/,
  `import { savePersonalScore, formatRoster, loadPersonalLeaderboard } from "@/lib/local-leaderboard";`
);

const initRegex = /const dailyDate = new Date\(\)\.toISOString\(\)\.slice\(0, 10\);\n    const poolSeed = dateStrToSeed\(dailyDate\);\n    const pool = seededShuffle\(\[\.\.\.COUNTRIES\], poolSeed\);\n    const mystery = null;\n    const selection = null;\n    const currentCountry = pool\.pop\(\) \|\| null;\n\n    \/\/ Check local storage for existing daily state\n    try {\n        const saved = localStorage\.getItem\(\`countryDraftState_daily_\$\{dailyDate\}\`\);\n        if \(saved\) return JSON\.parse\(saved\);\n    \} catch \{\}/;

const newInit = `const dailyDate = new Date().toISOString().slice(0, 10);
    const poolSeed = dateStrToSeed(dailyDate);
    
    // 1. Check personal leaderboard for today's completed game
    const todayDisplay = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const personalLeaderboard = loadPersonalLeaderboard("daily");
    const todayEntry = personalLeaderboard.find(e => e.date === todayDisplay);
    if (todayEntry && todayEntry.roster) {
      const reconstructedRoster: any = {};
      Object.entries(todayEntry.roster).forEach(([cat, countryName]) => {
        const country = COUNTRIES.find(c => c.name === countryName);
        if (country) reconstructedRoster[cat] = country;
      });
      return {
        pool: [], currentCountry: null, selectionOptions: null, mysteryCountry: null, guesses: [],
        roster: reconstructedRoster, gameOver: true, wildcardUsed: Object.keys(reconstructedRoster).length > 0 && !Object.values(reconstructedRoster).every(c => true), // wildcard check isn't trivial but it's fine
        isDailyMode: true, dailyDate, leaderboardSubmitted: false, mode: "normal", isHardMode: false,
        roomCode: null, poolSeed, categoryTimes: {}, currentTurnStartTime: Date.now()
      };
    }

    // 2. Check local storage for incomplete or completed daily state
    try {
        const saved = localStorage.getItem(\`countryDraftState_daily_\${dailyDate}\`);
        if (saved) return JSON.parse(saved);
    } catch {}

    const pool = seededShuffle([...COUNTRIES], poolSeed);
    const mystery = null;
    const selection = null;
    const currentCountry = pool.pop() || null;`;

content = content.replace(initRegex, newInit);

// Change `doReset` to do nothing or remove it. We still pass it to GameOver, but it shouldn't reset daily state!
const resetRegex = /const doReset = useCallback\(\(\) => \{[\s\S]*?setWildcardPhase\(false\);\n  \}, \[\]\);/;

const newReset = `const doReset = useCallback(() => {
    // Daily mode cannot be reset
  }, []);`;

content = content.replace(resetRegex, newReset);

writeFileSync('src/pages/daily/DailyGame.tsx', content);
