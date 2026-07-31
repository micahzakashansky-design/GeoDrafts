import {
  where,
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  onSnapshot,
  deleteDoc,
  arrayUnion,
  documentId,
} from "firebase/firestore";
import { firestore } from "./firebase";
import {
  UserProfileSchema,
  LeaderboardEntrySchema,
  RoomSchema,
  RoomPlayerSchema,
  GameEndStatsSchema,
  PersonalRecordSchema,
  UsernameInputSchema,
  sanitizeString,
  type UserProfile,
  type LeaderboardEntry,
  type Room,
  type RoomPlayer,
  type RoomMode,
  type GameEndStats,
  type PersonalRecord,
} from "./schemas";

export type { UserProfile, LeaderboardEntry, Room, RoomPlayer, RoomMode, GameEndStats, RoomStatus } from "./schemas";

/**
 * Custom error class for Firestore service errors
 */
export class FirestoreServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string = "unknown-error"
  ) {
    super(message);
    this.name = "FirestoreServiceError";
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!uid || typeof uid !== "string") return null;
  try {
    const snap = await getDoc(doc(firestore, "users", uid));
    if (!snap.exists()) return null;
    const parseResult = UserProfileSchema.safeParse({ uid, ...snap.data() });
    return parseResult.success ? parseResult.data : ({ uid, ...snap.data() } as UserProfile);
  } catch (error) {
    console.error(`[getUserProfile] Failed to fetch profile for ${uid}:`, error);
    throw new FirestoreServiceError("Failed to load user profile", "fetch-profile-failed");
  }
}

export async function updateUsername(uid: string, username: string): Promise<void> {
  if (!uid) throw new FirestoreServiceError("User ID is required", "invalid-uid");
  const validatedUsername = UsernameInputSchema.parse(username);
  try {
    await updateDoc(doc(firestore, "users", uid), {
      username: validatedUsername,
      usernameLower: validatedUsername.toLowerCase(),
    });
  } catch (error) {
    console.error(`[updateUsername] Failed for user ${uid}:`, error);
    throw new FirestoreServiceError("Failed to update username", "update-username-failed");
  }
}

export async function unlockAchievements(uid: string, achievements: string[]): Promise<void> {
  if (!uid || (typeof window !== "undefined" && sessionStorage.getItem("geoDraftsIsGuest") === "true")) return;
  const validAchievements = achievements
    .filter((a): a is string => typeof a === "string" && a.trim().length > 0)
    .map((a) => sanitizeString(a, 50));
  if (validAchievements.length === 0) return;

  try {
    await updateDoc(doc(firestore, "users", uid), {
      unlockedAchievements: arrayUnion(...validAchievements),
    });
  } catch (error) {
    console.error(`[unlockAchievements] Error unlocking achievements for ${uid}:`, error);
  }
}

export async function checkUsernameExists(username: string): Promise<boolean> {
  if (!username || typeof username !== "string") return false;
  const sanitized = sanitizeString(username, 30);
  const usernameLower = sanitized.toLowerCase();

  try {
    const qLower = query(
      collection(firestore, "users"),
      where("usernameLower", "==", usernameLower),
      limit(1)
    );
    const snapLower = await getDocs(qLower);
    if (!snapLower.empty) return true;

    const qExact = query(
      collection(firestore, "users"),
      where("username", "==", sanitized),
      limit(1)
    );
    const snapExact = await getDocs(qExact);
    return !snapExact.empty;
  } catch (error) {
    console.error("[checkUsernameExists] Query failed:", error);
    return false;
  }
}

export async function getEmailFromUsername(username: string): Promise<{ email: string | null; exists: boolean }> {
  if (!username || typeof username !== "string") return { email: null, exists: false };
  const sanitized = sanitizeString(username, 30);
  const usernameLower = sanitized.toLowerCase();

  try {
    const qLower = query(
      collection(firestore, "users"),
      where("usernameLower", "==", usernameLower),
      limit(1)
    );
    const snapLower = await getDocs(qLower);
    if (!snapLower.empty) {
      const data = snapLower.docs[0].data();
      return {
        email: data && typeof data.email === "string" && data.email.trim() ? data.email.trim() : null,
        exists: true,
      };
    }

    const qExact = query(
      collection(firestore, "users"),
      where("username", "==", sanitized),
      limit(1)
    );
    const snapExact = await getDocs(qExact);
    if (!snapExact.empty) {
      const data = snapExact.docs[0].data();
      return {
        email: data && typeof data.email === "string" && data.email.trim() ? data.email.trim() : null,
        exists: true,
      };
    }

    return { email: null, exists: false };
  } catch (error) {
    console.error("[getEmailFromUsername] Query failed:", error);
    return { email: null, exists: false };
  }
}

export async function createUserProfile(uid: string, username: string, email?: string | null): Promise<UserProfile> {
  if (!uid) throw new FirestoreServiceError("User ID is required", "invalid-uid");
  const validatedUsername = UsernameInputSchema.parse(username);
  const sanitizedEmail = email && typeof email === "string" ? email.trim() : null;

  const profileData = {
    username: validatedUsername,
    usernameLower: validatedUsername.toLowerCase(),
    ...(sanitizedEmail && {
      email: sanitizedEmail,
      emailLower: sanitizedEmail.toLowerCase(),
    }),
    createdAt: serverTimestamp(),
    bestScore: 0,
    totalGames: 0,
  };

  try {
    await setDoc(doc(firestore, "users", uid), profileData);
    return {
      uid,
      username: validatedUsername,
      usernameLower: validatedUsername.toLowerCase(),
      email: sanitizedEmail,
      emailLower: sanitizedEmail ? sanitizedEmail.toLowerCase() : null,
      createdAt: null,
      bestScore: 0,
      totalGames: 0,
      unlockedAchievements: [],
      firstTryGuesses: 0,
      fastDrafts: 0,
      uniqueCountriesUsed: [],
      dailyStreak: 0,
      bestDoubleScore: 0,
    };
  } catch (error) {
    console.error(`[createUserProfile] Failed to create profile for ${uid}:`, error);
    throw new FirestoreServiceError("Failed to create user profile", "create-profile-failed");
  }
}

export async function processGameEndStats(uid: string, rawStats: GameEndStats): Promise<void> {
  if (!uid) return;
  const stats = GameEndStatsSchema.parse(rawStats);
  
  try {
    const profile = await getUserProfile(uid);
    if (!profile) return;

    const updates: Partial<UserProfile> = {
      totalGames: (profile.totalGames || 0) + 1,
    };

    const newUnlocked = new Set<string>(profile.unlockedAchievements || []);
    if (stats.achievementsToUnlock) {
      stats.achievementsToUnlock.forEach((a) => newUnlocked.add(sanitizeString(a, 50)));
    }

    if (stats.mode === "normal" && stats.score !== undefined) {
      updates.bestScore = Math.max(profile.bestScore || 0, stats.score);
      if (updates.bestScore >= 165) newUnlocked.add("Superpower");
      if (updates.bestScore >= 175) newUnlocked.add("God Tier");
    }

    if (stats.mode === "double" && stats.score !== undefined) {
      updates.bestDoubleScore = Math.max(profile.bestDoubleScore || 0, stats.score);
      if (updates.bestDoubleScore >= 165) newUnlocked.add("Double Threat");
    }

    if (stats.firstTryGuess) {
      updates.firstTryGuesses = (profile.firstTryGuesses || 0) + 1;
      if (updates.firstTryGuesses >= 10) newUnlocked.add("Geography Genius");
      if (updates.firstTryGuesses >= 50) newUnlocked.add("Flawless Guesser");
    }

    if (stats.totalTimeMs && stats.totalTimeMs < 120000) {
      updates.fastDrafts = (profile.fastDrafts || 0) + 1;
      newUnlocked.add("Speed Demon");
      if (updates.fastDrafts >= 10) newUnlocked.add("Quick Thinker");
    }
    if (stats.totalTimeMs && stats.totalTimeMs < 60000) {
      newUnlocked.add("Lightning Fast");
    }

    if (stats.roster) {
      const existingCountries = new Set(profile.uniqueCountriesUsed || []);
      Object.values(stats.roster).forEach((c) => existingCountries.add(sanitizeString(c, 50)));
      updates.uniqueCountriesUsed = Array.from(existingCountries);
      if (updates.uniqueCountriesUsed.length >= 50) newUnlocked.add("World Traveler");
      if (updates.uniqueCountriesUsed.length >= 100) newUnlocked.add("Globetrotter");
      if (updates.uniqueCountriesUsed.length >= 150) newUnlocked.add("Mr. Worldwide");
    }

    if (stats.isDaily) {
      const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
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
        if (updates.dailyStreak >= 30) newUnlocked.add("Dedicated Player");
      }
    }

    if ((updates.totalGames ?? profile.totalGames ?? 0) >= 100) newUnlocked.add("Draft Master");
    if ((updates.totalGames ?? profile.totalGames ?? 0) >= 500) newUnlocked.add("Veteran Drafter");
    if ((updates.totalGames ?? profile.totalGames ?? 0) >= 1000) newUnlocked.add("Addict");

    await setDoc(
      doc(firestore, "users", uid),
      {
        ...updates,
        unlockedAchievements: Array.from(newUnlocked),
      },
      { merge: true }
    );
  } catch (error) {
    console.error(`[processGameEndStats] Error processing stats for ${uid}:`, error);
  }
}

export async function saveScore(
  uid: string,
  username: string,
  score: number,
  mode: string,
  roster: Record<string, string>,
  guesses?: string[],
  mysteryCountry?: string
): Promise<string> {
  if (!uid) throw new FirestoreServiceError("User ID is required", "invalid-uid");
  const sanitizedUsername = sanitizeString(username, 30);
  const sanitizedMode = sanitizeString(mode, 30);
  const sanitizedRoster: Record<string, string> = {};
  for (const [k, v] of Object.entries(roster)) {
    sanitizedRoster[sanitizeString(k, 50)] = sanitizeString(v, 50);
  }

  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });

  try {
    if (sanitizedMode === "daily") {
      const dailyDocId = `daily_${uid}_${today}`;
      const existing = await getDoc(doc(firestore, "leaderboard", dailyDocId));
      if (existing.exists()) {
        throw new FirestoreServiceError("Daily score already submitted for today", "already-submitted");
      }
      await setDoc(doc(firestore, "leaderboard", dailyDocId), {
        uid,
        username: sanitizedUsername,
        score,
        mode: sanitizedMode,
        roster: sanitizedRoster,
        ...(guesses && { guesses: guesses.map((g) => sanitizeString(g, 50)) }),
        ...(mysteryCountry && { mysteryCountry: sanitizeString(mysteryCountry, 50) }),
        createdAt: serverTimestamp(),
        date: today,
      });
      return dailyDocId;
    }

    const docRef = await addDoc(collection(firestore, "leaderboard"), {
      uid,
      username: sanitizedUsername,
      score,
      mode: sanitizedMode,
      roster: sanitizedRoster,
      ...(guesses && { guesses: guesses.map((g) => sanitizeString(g, 50)) }),
      ...(mysteryCountry && { mysteryCountry: sanitizeString(mysteryCountry, 50) }),
      createdAt: serverTimestamp(),
      date: today,
    });
    return docRef.id;
  } catch (error) {
    if (error instanceof FirestoreServiceError) throw error;
    console.error("[saveScore] Error saving score:", error);
    throw new FirestoreServiceError("Failed to save leaderboard score", "save-score-failed");
  }
}

export async function saveCloudPersonalScore(
  uid: string,
  mode: string,
  entryData: Record<string, unknown>
): Promise<void> {
  if (!uid) throw new FirestoreServiceError("User ID is required", "invalid-uid");
  try {
    await addDoc(collection(firestore, "personal_records"), {
      uid,
      mode: sanitizeString(mode, 30),
      ...entryData,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("[saveCloudPersonalScore] Error:", error);
    throw new FirestoreServiceError("Failed to save personal score", "save-personal-score-failed");
  }
}

export async function getCloudPersonalScores(uid: string, mode: string): Promise<PersonalRecord[]> {
  if (!uid) return [];
  const isAsc = mode === "guess";
  try {
    const q = query(
      collection(firestore, "personal_records"),
      where("uid", "==", uid),
      where("mode", "==", mode),
      orderBy("score", isAsc ? "asc" : "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return PersonalRecordSchema.parse({ id: d.id, ...data });
    });
  } catch (error) {
    console.error("[getCloudPersonalScores] Error:", error);
    return [];
  }
}

export async function deleteCloudPersonalScore(id: string): Promise<void> {
  if (!id) return;
  try {
    await deleteDoc(doc(firestore, "personal_records", id));
  } catch (error) {
    console.error("[deleteCloudPersonalScore] Error:", error);
  }
}

export async function deleteGlobalScore(id: string): Promise<void> {
  if (!id) return;
  try {
    await deleteDoc(doc(firestore, "leaderboard", id));
  } catch (error) {
    console.error("[deleteGlobalScore] Error:", error);
  }
}

/**
 * Retrieves top leaderboard scores.
 * OPTIMIZATION: Batches user queries into chunked 'in' queries to eliminate the N+1 problem.
 */
export async function getTopScores(modeFilter?: string, topN = 10): Promise<LeaderboardEntry[]> {
  const isAsc = modeFilter === "guess";

  try {
    let q;
    if (modeFilter && modeFilter !== "all") {
      q = query(
        collection(firestore, "leaderboard"),
        where("mode", "==", modeFilter),
        orderBy("score", isAsc ? "asc" : "desc"),
        limit(topN)
      );
    } else {
      q = query(
        collection(firestore, "leaderboard"),
        orderBy("score", isAsc ? "asc" : "desc"),
        limit(topN)
      );
    }

    const snap = await getDocs(q);
    const entries = snap.docs.map((d) => ({ id: d.id, ...d.data() } as LeaderboardEntry));

    const uniqueUids = [...new Set(entries.map((e) => e.uid))].filter(Boolean);
    const usernameMap: Record<string, string> = {};

    // Batching user lookups in chunks of 10 to avoid N+1 individual queries
    const chunkSize = 10;
    for (let i = 0; i < uniqueUids.length; i += chunkSize) {
      const chunk = uniqueUids.slice(i, i + chunkSize);
      const usersQuery = query(collection(firestore, "users"), where(documentId(), "in", chunk));
      const usersSnap = await getDocs(usersQuery);
      usersSnap.docs.forEach((d) => {
        const data = d.data();
        if (data && typeof data.username === "string") {
          usernameMap[d.id] = data.username;
        }
      });
    }

    return entries.map((e) => ({
      ...e,
      username: usernameMap[e.uid] || e.username,
    }));
  } catch (error) {
    console.error("[getTopScores] Error fetching leaderboard:", error);
    return [];
  }
}

export async function checkDailySubmitted(uid: string): Promise<boolean> {
  if (!uid) return false;
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  try {
    const snap = await getDoc(doc(firestore, "leaderboard", `daily_${uid}_${today}`));
    return snap.exists();
  } catch (error) {
    console.error("[checkDailySubmitted] Error checking daily submission:", error);
    return false;
  }
}

export async function saveDailyState(uid: string, date: string, state: Record<string, unknown>): Promise<void> {
  if (!uid || !date || (typeof window !== "undefined" && sessionStorage.getItem("geoDraftsIsGuest") === "true")) return;
  try {
    await setDoc(doc(firestore, "daily_states", `${uid}_${date}`), {
      state,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("[saveDailyState] Error saving state:", error);
  }
}

export async function getDailyState(uid: string, date: string): Promise<Record<string, unknown> | null> {
  if (!uid || !date) return null;
  try {
    const snap = await getDoc(doc(firestore, "daily_states", `${uid}_${date}`));
    if (!snap.exists()) return null;
    return (snap.data().state as Record<string, unknown>) ?? null;
  } catch (error) {
    console.error("[getDailyState] Error fetching state:", error);
    return null;
  }
}

// --- Multiplayer Room Logic ---

export async function createRoom(
  hostUid: string,
  hostUsername: string,
  mode: RoomMode,
  difficulty: "easy" | "hard",
  associationsSettings?: Record<string, unknown>
): Promise<string> {
  if (!hostUid) throw new FirestoreServiceError("Host UID required", "invalid-host");

  const sanitizedUsername = sanitizeString(hostUsername, 30);
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  const roomData = {
    code,
    mode,
    difficulty,
    hostId: hostUid,
    status: "waiting" as const,
    currentRound: 0,
    poolSeed: Math.floor(Math.random() * 1000000),
    associationsSettings: associationsSettings ?? null,
  };

  const parsedRoom = RoomSchema.parse({ ...roomData, createdAt: null });

  try {
    const roomRef = doc(firestore, "rooms", code);
    await setDoc(roomRef, { ...parsedRoom, createdAt: serverTimestamp() });

    const playerRef = doc(firestore, "rooms", code, "players", hostUid);
    const player: RoomPlayer = {
      uid: hostUid,
      username: sanitizedUsername,
      score: 0,
      roster: {},
      finishedRound: false,
      sabotageChoice: null,
      sabotageOptions: null,
    };
    await setDoc(playerRef, RoomPlayerSchema.parse(player));

    return code;
  } catch (error) {
    console.error("[createRoom] Error creating room:", error);
    throw new FirestoreServiceError("Failed to create multiplayer room", "create-room-failed");
  }
}

export async function joinRoom(code: string, uid: string, username: string): Promise<Room> {
  if (!code || !uid) throw new FirestoreServiceError("Invalid room code or user ID", "invalid-args");

  const sanitizedCode = sanitizeString(code, 6).toUpperCase();
  const sanitizedUsername = sanitizeString(username, 30);

  try {
    const roomRef = doc(firestore, "rooms", sanitizedCode);
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) throw new FirestoreServiceError("Room not found", "room-not-found");

    const room = RoomSchema.parse({ ...roomSnap.data(), code: sanitizedCode });
    if (room.status !== "waiting") throw new FirestoreServiceError("Room already in progress", "room-in-progress");

    const playersSnap = await getDocs(collection(firestore, "rooms", sanitizedCode, "players"));
    if (room.mode === "sabotage" && playersSnap.size >= 2) {
      throw new FirestoreServiceError("Room is full (2 player limit)", "room-full");
    }

    const playerRef = doc(firestore, "rooms", sanitizedCode, "players", uid);
    const player: RoomPlayer = {
      uid,
      username: sanitizedUsername,
      score: 0,
      roster: {},
      finishedRound: false,
      sabotageChoice: null,
      sabotageOptions: null,
    };
    await setDoc(playerRef, RoomPlayerSchema.parse(player));
    return room;
  } catch (error) {
    if (error instanceof FirestoreServiceError) throw error;
    console.error("[joinRoom] Error joining room:", error);
    throw new FirestoreServiceError("Failed to join room", "join-room-failed");
  }
}

export async function updateRoom(code: string, updates: Partial<Room>): Promise<void> {
  if (!code) return;
  try {
    const roomRef = doc(firestore, "rooms", code);
    await updateDoc(roomRef, updates);
  } catch (error) {
    console.error(`[updateRoom] Failed to update room ${code}:`, error);
  }
}

export async function updatePlayer(code: string, uid: string, updates: Partial<RoomPlayer>): Promise<void> {
  if (!code || !uid) return;
  try {
    const playerRef = doc(firestore, "rooms", code, "players", uid);
    await updateDoc(playerRef, updates);
  } catch (error) {
    console.error(`[updatePlayer] Failed to update player ${uid} in room ${code}:`, error);
  }
}

export function listenToRoom(
  code: string,
  onUpdate: (room: Room) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    doc(firestore, "rooms", code),
    (snap) => {
      if (snap.exists()) {
        try {
          const parsed = RoomSchema.parse({ ...snap.data(), code });
          onUpdate(parsed);
        } catch (e) {
          onUpdate({ ...snap.data(), code } as Room);
        }
      }
    },
    (err) => {
      console.error(`[listenToRoom] Listener error for room ${code}:`, err);
      onError?.(err);
    }
  );
}

export function listenToPlayers(
  code: string,
  onUpdate: (players: RoomPlayer[]) => void,
  onError?: (error: Error) => void
) {
  return onSnapshot(
    collection(firestore, "rooms", code, "players"),
    (snap) => {
      const players = snap.docs.map((d) => {
        const data = d.data();
        try {
          return RoomPlayerSchema.parse(data);
        } catch {
          return data as RoomPlayer;
        }
      });
      onUpdate(players);
    },
    (err) => {
      console.error(`[listenToPlayers] Listener error for room ${code}:`, err);
      onError?.(err);
    }
  );
}
