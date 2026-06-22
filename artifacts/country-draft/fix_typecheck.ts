import { readFileSync, writeFileSync } from 'fs';

// 1. Fix GuessGame.tsx
let guess = readFileSync('src/pages/guess/GuessGame.tsx', 'utf8');
guess = guess.replace(/import { useFirebaseAuth } from "@\/lib\/auth-context";/, 'import { useFirebaseAuth } from "@/lib/use-firebase-auth";');
writeFileSync('src/pages/guess/GuessGame.tsx', guess);

// 2. Fix DoubleUI.tsx
let doubleUI = readFileSync('src/pages/double/DoubleUI.tsx', 'utf8');
if (!doubleUI.includes('import { processGameEndStats }')) {
  doubleUI = doubleUI.replace(/import \{ unlockAchievements \} from "@\/lib\/firestore";/, 'import { unlockAchievements, processGameEndStats } from "@/lib/firestore";');
}
const doubleHookRegex = /processGameEndStats\(firebaseUser\.uid, \{\n\s*mode: "double",\n\s*score: totalScore,\n\s*roster,\n\s*totalTimeMs: categoryTimes \? Object\.values\(categoryTimes\)\.reduce\(\(a, b\) => a \+ b, 0\) : undefined,\n\s*achievementsToUnlock: achievementsRef\.current,\n\s*\}\)/g;
const doubleHookNew = `processGameEndStats(firebaseUser.uid, {
            mode: "double",
            score: totalScore,
            roster: Object.fromEntries(Object.entries(roster).map(([k,v]) => [k, v?.name || ""])),
            totalTimeMs: categoryTimes ? Object.values(categoryTimes).reduce((a, b) => a + b, 0) : undefined,
            achievementsToUnlock: achievementsRef.current,
          })`;
if (doubleHookRegex.test(doubleUI)) {
    doubleUI = doubleUI.replace(doubleHookRegex, doubleHookNew);
} else {
    // maybe it hasn't been replaced yet
    const doubleHookRegex2 = /processGameEndStats\(firebaseUser\.uid, \{\n\s*mode: "double",\n\s*score: totalScore,\n\s*roster,\n\s*achievementsToUnlock: achievementsRef\.current,\n\s*\}\)/g;
    doubleUI = doubleUI.replace(doubleHookRegex2, doubleHookNew);
}
writeFileSync('src/pages/double/DoubleUI.tsx', doubleUI);

// 3. Fix NormalUI.tsx
let normalUI = readFileSync('src/pages/normal/NormalUI.tsx', 'utf8');
const normalHookRegex = /processGameEndStats\(firebaseUser\.uid, \{\n\s*mode: "normal",\n\s*score: total,\n\s*roster,\n\s*totalTimeMs: Object\.values\(categoryTimes\)\.reduce\(\(a, b\) => a \+ b, 0\),\n\s*achievementsToUnlock: achievementsRef\.current,\n\s*\}\)/g;
const normalHookNew = `processGameEndStats(firebaseUser.uid, {
            mode: "normal",
            score: totalScore,
            roster: Object.fromEntries(Object.entries(roster).map(([k,v]) => [k, v?.name || ""])),
            totalTimeMs: categoryTimes ? Object.values(categoryTimes).reduce((a, b) => a + b, 0) : undefined,
            achievementsToUnlock: achievementsRef.current,
          })`;
if (normalHookRegex.test(normalUI)) {
    normalUI = normalUI.replace(normalHookRegex, normalHookNew);
} else {
    // maybe categoryTimes is undefined
    const normalHookRegex2 = /processGameEndStats\(firebaseUser\.uid, \{\n\s*mode: "normal",\n\s*score: total,\n\s*roster,\n\s*achievementsToUnlock: achievementsRef\.current,\n\s*\}\)/g;
    normalUI = normalUI.replace(normalHookRegex2, normalHookNew);
}
writeFileSync('src/pages/normal/NormalUI.tsx', normalUI);

