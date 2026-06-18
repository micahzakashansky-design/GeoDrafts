import type { Country, Category } from "@/data/countries";

export type PersonalLeaderboardEntry = {
  score: number;
  date: string;
  timestamp: number;
  roster?: Record<string, string>; // Used for draft games
  guesses?: string[]; // Used for guess the country
  mysteryCountry?: string; // Used for guess the country
};

export type GameMode = "normal" | "hard" | "daily" | "double" | "guess";

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

  board.push(entry);

  if (mode === "guess") {
    // For guess mode, lower score is better (guesses + hints)
    board.sort((a, b) => a.score - b.score);
  } else {
    // For other modes, higher score is better
    board.sort((a, b) => b.score - a.score);
  }

  // Keep top 20 personal records per mode
  localStorage.setItem(getStorageKey(mode), JSON.stringify(board.slice(0, 20)));
}

export function formatRoster(roster: Partial<Record<Category, Country>>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(roster)
      .filter(([, c]) => c !== undefined)
      .map(([cat, c]) => [cat, c!.name])
  );
}
