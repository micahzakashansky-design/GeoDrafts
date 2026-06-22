import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/pages/daily/DailyGame.tsx', 'utf8');

// Replace the dailyDate generation and todayEntry check
const initRegex = /const dailyDate = new Date\(\)\.toISOString\(\)\.slice\(0, 10\);\n\s*const poolSeed = dateStrToSeed\(dailyDate\);\n\s*\/\/ 1\. Check personal leaderboard for today's completed game\n\s*const todayDisplay = new Date\(\)\.toLocaleDateString\("en-US", \{ month: "short", day: "numeric", year: "numeric" \}\);\n\s*const personalLeaderboard = loadPersonalLeaderboard\("daily"\);\n\s*const todayEntry = personalLeaderboard\.find\(e => e\.date === todayDisplay\);/;

const newInit = `const dailyDate = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
    const poolSeed = dateStrToSeed(dailyDate);
    
    // 1. Check personal leaderboard for today's completed game
    const personalLeaderboard = loadPersonalLeaderboard("daily");
    const todayEntry = personalLeaderboard.find(e => {
      const entryET = new Date(e.timestamp).toLocaleDateString("en-CA", { timeZone: "America/New_York" });
      return entryET === dailyDate;
    });`;

if (initRegex.test(content)) {
  content = content.replace(initRegex, newInit);
} else {
  console.log("Could not match the regex for DailyGame.tsx");
}

writeFileSync('src/pages/daily/DailyGame.tsx', content);

// Also check doReset in DailyGame.tsx:
// Wait, doReset is already empty.

// Wait, we also need to change the dailyDate string in the doReset function, if any.
// In DailyGame.tsx, earlier we had `const dailyDate = new Date().toISOString().slice(0, 10);` in doReset. But we removed it.
