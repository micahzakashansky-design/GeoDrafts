import type { Country, Category } from "@/data/countries";
import { auth } from "./firebase";
import { saveCloudPersonalScore } from "./firestore";

export type PersonalLeaderboardEntry = {
  score: number;
  date: string;
  timestamp: number;
  roster?: Record<string, string>; // Used for draft games
  guesses?: string[]; // Used for guess the country
  mysteryCountry?: string; // Used for guess the country
};

export type GameMode = "normal" | "hard" | "daily" | "double" | "double_hard" | "guess";

function getStorageKey(mode: GameMode): string {
  return `countryDraftPersonal_${mode}`;
}

export function loadPersonalLeaderboard(mode: GameMode): PersonalLeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(getStorageKey(mode));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function savePersonalScore(mode: GameMode, entryData: Omit<PersonalLeaderboardEntry, "date" | "timestamp">) {
  const board = loadPersonalLeaderboard(mode);
  const entry: PersonalLeaderboardEntry = {
    ...entryData,
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    timestamp: Date.now(),
  };

  if (auth.currentUser) {
    saveCloudPersonalScore(auth.currentUser.uid, mode, entry).catch(console.error);
  }

  board.push(entry);

  if (mode === "guess") {
    // For guess mode, lower score is better (guesses + hints)
    board.sort((a, b) => a.score - b.score);
  } else {
    // For other modes, higher score is better
    board.sort((a, b) => b.score - a.score);
  }

  // Keep all personal records per mode (entire history)
  localStorage.setItem(getStorageKey(mode), JSON.stringify(board));
}

export function deleteLocalPersonalScore(mode: GameMode, timestamp: number) {
  const board = loadPersonalLeaderboard(mode);
  const updated = board.filter(entry => entry.timestamp !== timestamp);
  localStorage.setItem(getStorageKey(mode), JSON.stringify(updated));
}

export function formatRoster(roster: Partial<Record<Category, Country>>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(roster)
      .filter(([, c]) => c !== undefined)
      .map(([cat, c]) => [cat, c!.name])
  );
}
