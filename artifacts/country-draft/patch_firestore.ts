import { readFileSync, writeFileSync } from 'fs';

const content = readFileSync('src/lib/firestore.ts', 'utf8');

// 1. Update UserProfile type
let newContent = content.replace(
  /unlockedAchievements\?: string\[\];\n\};/,
  `unlockedAchievements?: string[];
  firstTryGuesses?: number;
  fastDrafts?: number;
  uniqueCountriesUsed?: string[];
  dailyStreak?: number;
  lastDailyDate?: string;
};`
);

// 2. Remove updateUserStats call from saveScore
newContent = newContent.replace(/updateUserStats\(uid, score\)\.catch\(console\.error\);\n\s*return dailyDocId;/, 'return dailyDocId;');
newContent = newContent.replace(/updateUserStats\(uid, score\)\.catch\(console\.error\);\n\s*return docRef\.id;/, 'return docRef.id;');

// 3. Add processGameEndStats function
const processFn = `
export type GameEndStats = {
  score?: number;
  mode: string;
  roster?: Record<string, string>;
  totalTimeMs?: number;
  firstTryGuess?: boolean;
  achievementsToUnlock?: string[];
  isDaily?: boolean;
};

export async function processGameEndStats(uid: string, stats: GameEndStats): Promise<void> {
  const profile = await getUserProfile(uid);
  if (!profile) return;

  const updates: Partial<UserProfile> = {
    totalGames: (profile.totalGames || 0) + 1,
  };

  const newUnlocked = new Set<string>(profile.unlockedAchievements || []);
  if (stats.achievementsToUnlock) {
    stats.achievementsToUnlock.forEach(a => newUnlocked.add(a));
  }

  // Best Score (Normal Mode)
  if (stats.mode === "normal" && stats.score !== undefined) {
    updates.bestScore = Math.max(profile.bestScore || 0, stats.score);
    if (updates.bestScore >= 165) newUnlocked.add("Superpower");
  }

  // First Try Guesses
  if (stats.firstTryGuess) {
    updates.firstTryGuesses = (profile.firstTryGuesses || 0) + 1;
    if (updates.firstTryGuesses >= 10) newUnlocked.add("Geography Genius");
  }

  // Fast Drafts (Under 2 minutes)
  if (stats.totalTimeMs && stats.totalTimeMs < 120000) {
    updates.fastDrafts = (profile.fastDrafts || 0) + 1;
    newUnlocked.add("Speed Demon");
  }

  // Unique Countries
  if (stats.roster) {
    const existingCountries = new Set(profile.uniqueCountriesUsed || []);
    Object.values(stats.roster).forEach(c => existingCountries.add(c));
    updates.uniqueCountriesUsed = Array.from(existingCountries);
    if (updates.uniqueCountriesUsed.length >= 50) newUnlocked.add("World Traveler");
  }

  // Daily Streak
  if (stats.isDaily) {
    const today = new Date().toISOString().slice(0, 10);
    const lastDate = profile.lastDailyDate;
    if (lastDate !== today) {
      if (!lastDate) {
        updates.dailyStreak = 1;
      } else {
        const lastDateObj = new Date(lastDate);
        const todayObj = new Date(today);
        const diffTime = Math.abs(todayObj.getTime() - lastDateObj.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          updates.dailyStreak = (profile.dailyStreak || 0) + 1;
        } else {
          updates.dailyStreak = 1;
        }
      }
      updates.lastDailyDate = today;
      if (updates.dailyStreak >= 7) newUnlocked.add("Daily Streak");
    }
  }

  // Draft Master (100 games)
  if (updates.totalGames! >= 100) {
    newUnlocked.add("Draft Master");
  }

  const finalUnlocked = Array.from(newUnlocked);
  
  await setDoc(
    doc(firestore, "users", uid),
    {
      ...updates,
      unlockedAchievements: finalUnlocked
    },
    { merge: true }
  );
}
`;

newContent = newContent.replace(/async function updateUserStats/, processFn + '\nasync function updateUserStats');

writeFileSync('src/lib/firestore.ts', newContent);
