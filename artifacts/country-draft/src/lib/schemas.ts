import { z } from "zod";

/**
 * Sanitizes input string to prevent control character injection, 
 * unescaped HTML scripts, and excessive whitespace.
 */
export function sanitizeString(input: string, maxLength = 100): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/[\x00-\x1F\x7F]/g, "") // Remove ASCII control characters
    .trim()
    .slice(0, maxLength);
}

/**
 * Username validation schema with strict length and character rules.
 */
export const UsernameInputSchema = z
  .string()
  .min(2, "Username must be at least 2 characters")
  .max(30, "Username cannot exceed 30 characters")
  .transform((val) => sanitizeString(val, 30))
  .refine((val) => /^[a-zA-Z0-9_\-\s]+$/.test(val), {
    message: "Username can only contain letters, numbers, underscores, hyphens, and spaces",
  });

/**
 * Schema for UserProfile document in Firestore
 */
export const UserProfileSchema = z.object({
  uid: z.string().min(1),
  username: z.string(),
  usernameLower: z.string().optional(),
  email: z.string().optional().nullable(),
  emailLower: z.string().optional().nullable(),
  createdAt: z.any().nullable().optional(),
  bestScore: z.number().default(0),
  totalGames: z.number().default(0),
  unlockedAchievements: z.array(z.string()).optional().default([]),
  firstTryGuesses: z.number().optional().default(0),
  fastDrafts: z.number().optional().default(0),
  uniqueCountriesUsed: z.array(z.string()).optional().default([]),
  dailyStreak: z.number().optional().default(0),
  lastDailyDate: z.string().optional(),
  bestDoubleScore: z.number().optional().default(0),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

/**
 * Schema for Leaderboard entry document in Firestore
 */
export const LeaderboardEntrySchema = z.object({
  id: z.string(),
  uid: z.string().min(1),
  username: z.string(),
  score: z.number(),
  mode: z.string(),
  roster: z.record(z.string(), z.string()),
  guesses: z.array(z.string()).optional(),
  mysteryCountry: z.string().optional(),
  createdAt: z.any().nullable().optional(),
  date: z.string(),
});

export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;

/**
 * Room Modes
 */
export const RoomModeSchema = z.enum([
  "sabotage",
  "party",
  "associations_race",
  "double_draft",
]);

export type RoomMode = z.infer<typeof RoomModeSchema>;

/**
 * Room Status
 */
export const RoomStatusSchema = z.enum(["waiting", "playing", "finished"]);

export type RoomStatus = z.infer<typeof RoomStatusSchema>;

/**
 * Schema for Multiplayer Room document in Firestore
 */
export const RoomSchema = z.object({
  code: z.string().length(6),
  mode: RoomModeSchema,
  difficulty: z.enum(["easy", "hard"]),
  hostId: z.string().min(1),
  status: RoomStatusSchema,
  currentRound: z.number().min(0),
  poolSeed: z.number(),
  createdAt: z.any().nullable().optional(),
  associationsSettings: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type Room = z.infer<typeof RoomSchema>;

/**
 * Schema for Multiplayer Player document in Firestore
 */
export const RoomPlayerSchema = z.object({
  uid: z.string().min(1),
  username: z.string(),
  score: z.number(),
  roster: z.record(z.string(), z.string()),
  finishedRound: z.boolean(),
  sabotageChoice: z.string().nullable(),
  sabotageOptions: z.array(z.string()).nullable(),
  completionTime: z.number().optional(),
});

export type RoomPlayer = z.infer<typeof RoomPlayerSchema>;

/**
 * Schema for Game End Statistics
 */
export const GameEndStatsSchema = z.object({
  score: z.number().optional(),
  mode: z.string().min(1),
  roster: z.record(z.string(), z.string()).optional(),
  totalTimeMs: z.number().positive().optional(),
  firstTryGuess: z.boolean().optional(),
  achievementsToUnlock: z.array(z.string()).optional(),
  isDaily: z.boolean().optional(),
});

export type GameEndStats = z.infer<typeof GameEndStatsSchema>;

/**
 * Schema for Personal Record document
 */
export const PersonalRecordSchema = z.object({
  id: z.string().optional(),
  uid: z.string().min(1),
  mode: z.string().min(1),
  score: z.number(),
  date: z.string().optional(),
  roster: z.record(z.string(), z.string()).optional(),
  createdAt: z.any().nullable().optional(),
});

export type PersonalRecord = z.infer<typeof PersonalRecordSchema>;

/**
 * Schema for Firebase environment configuration variables
 */
export const FirebaseEnvSchema = z.object({
  apiKey: z.string().min(1, "VITE_FIREBASE_API_KEY is required"),
  authDomain: z.string().min(1, "VITE_FIREBASE_AUTH_DOMAIN is required"),
  projectId: z.string().min(1, "VITE_FIREBASE_PROJECT_ID is required"),
  storageBucket: z.string().optional(),
  messagingSenderId: z.string().optional(),
  appId: z.string().min(1, "VITE_FIREBASE_APP_ID is required"),
  measurementId: z.string().optional(),
});

export type FirebaseEnv = z.infer<typeof FirebaseEnvSchema>;
