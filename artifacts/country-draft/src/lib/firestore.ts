import { where,
  collection, doc, getDoc, setDoc, addDoc, updateDoc,
  query, orderBy, limit, getDocs, serverTimestamp,
  onSnapshot, type Timestamp, deleteDoc, arrayUnion
} from "firebase/firestore";
import { firestore } from "./firebase";

export type UserProfile = {
  uid: string;
  username: string;
  createdAt: Timestamp | null;
  bestScore: number;
  totalGames: number;
  unlockedAchievements?: string[];
  firstTryGuesses?: number;
  fastDrafts?: number;
  uniqueCountriesUsed?: string[];
  dailyStreak?: number;
  lastDailyDate?: string;
  bestDoubleScore?: number;
};

export type LeaderboardEntry = {
  id: string;
  uid: string;
  username: string;
  score: number;
  mode: string;
  roster: Record<string, string>;
  guesses?: string[];
  mysteryCountry?: string;
  createdAt: Timestamp | null;
  date: string;
};

export type RoomStatus = "waiting" | "playing" | "finished";
export type RoomMode = "sabotage" | "party" | "associations_race" | "double_draft";

export type Room = {
  code: string;
  mode: RoomMode;
  difficulty: "easy" | "hard";
  hostId: string;
  status: RoomStatus;
  currentRound: number;
  poolSeed: number;
  createdAt: Timestamp | null;
  associationsSettings?: any;
};

export type RoomPlayer = {
  uid: string;
  username: string;
  score: number;
  roster: Record<string, string>;
  finishedRound: boolean;
  sabotageChoice: string | null;
  sabotageOptions: string[] | null;
  completionTime?: number;
};

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(firestore, "users", uid));
  if (!snap.exists()) return null;
  return { uid, ...snap.data() } as UserProfile;
}

export async function updateUsername(uid: string, username: string): Promise<void> {
  await updateDoc(doc(firestore, "users", uid), { 
    username,
    usernameLower: username.toLowerCase()
  });
}

export async function unlockAchievements(uid: string, achievements: string[]): Promise<void> {
  const validAchievements = achievements.filter(Boolean);
  if (validAchievements.length === 0) return;
  await updateDoc(doc(firestore, "users", uid), {
    unlockedAchievements: arrayUnion(...validAchievements)
  });
}

export async function checkUsernameExists(username: string): Promise<boolean> {
  const usernameLower = username.toLowerCase();
  
  // Check against the lowercase field
  const qLower = query(collection(firestore, "users"), where("usernameLower", "==", usernameLower), limit(1));
  const snapLower = await getDocs(qLower);
  if (!snapLower.empty) return true;

  // Fallback for older profiles that might not have usernameLower
  const qExact = query(collection(firestore, "users"), where("username", "==", username), limit(1));
  const snapExact = await getDocs(qExact);
  return !snapExact.empty;
}

export async function createUserProfile(uid: string, username: string): Promise<UserProfile> {
  const profile = {
    username,
    usernameLower: username.toLowerCase(),
    createdAt: serverTimestamp(),
    bestScore: 0,
    totalGames: 0,
  };
  await setDoc(doc(firestore, "users", uid), profile);
  return { uid, ...profile, createdAt: null } as any;
}


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
    if (updates.bestScore >= 175) newUnlocked.add("God Tier");
  }

  // Best Score (Double Mode)
  if (stats.mode === "double" && stats.score !== undefined) {
    updates.bestDoubleScore = Math.max(profile.bestDoubleScore || 0, stats.score);
    if (updates.bestDoubleScore >= 165) newUnlocked.add("Double Threat");
  }

  // First Try Guesses
  if (stats.firstTryGuess) {
    updates.firstTryGuesses = (profile.firstTryGuesses || 0) + 1;
    if (updates.firstTryGuesses >= 10) newUnlocked.add("Geography Genius");
    if (updates.firstTryGuesses >= 50) newUnlocked.add("Flawless Guesser");
  }

  // Fast Drafts
  if (stats.totalTimeMs && stats.totalTimeMs < 120000) {
    updates.fastDrafts = (profile.fastDrafts || 0) + 1;
    newUnlocked.add("Speed Demon");
    if (updates.fastDrafts >= 10) newUnlocked.add("Quick Thinker");
  }
  if (stats.totalTimeMs && stats.totalTimeMs < 60000) {
    newUnlocked.add("Lightning Fast");
  }

  // Unique Countries
  if (stats.roster) {
    const existingCountries = new Set(profile.uniqueCountriesUsed || []);
    Object.values(stats.roster).forEach(c => existingCountries.add(c));
    updates.uniqueCountriesUsed = Array.from(existingCountries);
    if (updates.uniqueCountriesUsed.length >= 50) newUnlocked.add("World Traveler");
    if (updates.uniqueCountriesUsed.length >= 100) newUnlocked.add("Globetrotter");
    if (updates.uniqueCountriesUsed.length >= 150) newUnlocked.add("Mr. Worldwide");
  }

  // Daily Streak
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

  // Games Played
  if (updates.totalGames! >= 100) {
    newUnlocked.add("Draft Master");
  }
  if (updates.totalGames! >= 500) {
    newUnlocked.add("Veteran Drafter");
  }
  if (updates.totalGames! >= 1000) {
    newUnlocked.add("Addict");
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

async function updateUserStats(uid: string, score: number): Promise<void> {
  const existing = await getUserProfile(uid);
  if (!existing) return;
  await setDoc(
    doc(firestore, "users", uid),
    {
      bestScore: Math.max(existing.bestScore, score),
      totalGames: (existing.totalGames || 0) + 1,
    },
    { merge: true }
  );
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
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });

  if (mode === "daily") {
    const dailyDocId = `daily_${uid}_${today}`;
    const existing = await getDoc(doc(firestore, "leaderboard", dailyDocId));
    if (existing.exists()) {
      throw Object.assign(new Error("Daily score already submitted for today"), {
        code: "already-submitted",
      });
    }
    await setDoc(doc(firestore, "leaderboard", dailyDocId), {
      uid, username, score, mode, roster,
      ...(guesses && { guesses }),
      ...(mysteryCountry && { mysteryCountry }),
      createdAt: serverTimestamp(),
      date: today,
    });
    return dailyDocId;
  }

  const docRef = await addDoc(collection(firestore, "leaderboard"), {
    uid, username, score, mode, roster,
    ...(guesses && { guesses }),
    ...(mysteryCountry && { mysteryCountry }),
    createdAt: serverTimestamp(),
    date: today,
  });
  return docRef.id;
}

export async function saveCloudPersonalScore(uid: string, mode: string, entryData: any): Promise<void> {
  await addDoc(collection(firestore, "personal_records"), {
    uid,
    mode,
    ...entryData,
    createdAt: serverTimestamp(),
  });
}

export async function getCloudPersonalScores(uid: string, mode: string): Promise<any[]> {
  const isAsc = mode === "guess";
  const q = query(
    collection(firestore, "personal_records"),
    where("uid", "==", uid),
    where("mode", "==", mode),
    orderBy("score", isAsc ? "asc" : "desc")
  );
  
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function deleteCloudPersonalScore(id: string): Promise<void> {
  await deleteDoc(doc(firestore, "personal_records", id));
}

export async function deleteGlobalScore(id: string): Promise<void> {
  await deleteDoc(doc(firestore, "leaderboard", id));
}

export async function getTopScores(modeFilter?: string, topN = 10): Promise<LeaderboardEntry[]> {
  const isAsc = modeFilter === "guess";
  
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
  const entries = snap.docs.map(d => ({ id: d.id, ...d.data() } as LeaderboardEntry));
  
  const uniqueUids = [...new Set(entries.map(e => e.uid))];
  const userDocs = await Promise.all(uniqueUids.map(uid => getDoc(doc(firestore, "users", uid))));
  const usernameMap: Record<string, string> = {};
  userDocs.forEach(d => {
    if (d.exists() && d.data().username) {
      usernameMap[d.id] = d.data().username;
    }
  });

  return entries.map(e => ({
    ...e,
    username: usernameMap[e.uid] || e.username
  }));
}

export async function checkDailySubmitted(uid: string): Promise<boolean> {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const snap = await getDoc(doc(firestore, "leaderboard", `daily_${uid}_${today}`));
  return snap.exists();
}

export async function saveDailyState(uid: string, date: string, state: any): Promise<void> {
  await setDoc(doc(firestore, "daily_states", `${uid}_${date}`), {
    state,
    updatedAt: serverTimestamp(),
  });
}

export async function getDailyState(uid: string, date: string): Promise<any | null> {
  const snap = await getDoc(doc(firestore, "daily_states", `${uid}_${date}`));
  if (!snap.exists()) return null;
  return snap.data().state;
}

// --- Multiplayer Room Logic ---

export async function createRoom(
  hostUid: string,
  hostUsername: string,
  mode: RoomMode,
  difficulty: "easy" | "hard",
  associationsSettings?: any
): Promise<string> {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const room: Room = {
    code,
    mode,
    difficulty,
    hostId: hostUid,
    status: "waiting",
    currentRound: 0,
    poolSeed: Math.floor(Math.random() * 1000000),
    createdAt: null,
    associationsSettings: associationsSettings || null,
  };

  const roomRef = doc(firestore, "rooms", code);
  await setDoc(roomRef, { ...room, createdAt: serverTimestamp() });

  const playerRef = doc(firestore, "rooms", code, "players", hostUid);
  const player: RoomPlayer = {
    uid: hostUid,
    username: hostUsername,
    score: 0,
    roster: {},
    finishedRound: false,
    sabotageChoice: null,
    sabotageOptions: null,
    completionTime: undefined,
  };
  await setDoc(playerRef, player);

  return code;
}

export async function joinRoom(code: string, uid: string, username: string): Promise<Room> {
  const roomRef = doc(firestore, "rooms", code);
  const roomSnap = await getDoc(roomRef);
  if (!roomSnap.exists()) throw new Error("Room not found");
  const room = roomSnap.data() as Room;
  if (room.status !== "waiting") throw new Error("Room already in progress");

  // Get current players to check limit
  const playersSnap = await getDocs(collection(firestore, "rooms", code, "players"));
  if (room.mode === "sabotage" && playersSnap.size >= 2) throw new Error("Room is full (2 player limit)");

  const playerRef = doc(firestore, "rooms", code, "players", uid);
  const player: RoomPlayer = {
    uid,
    username,
    score: 0,
    roster: {},
    finishedRound: false,
    sabotageChoice: null,
    sabotageOptions: null,
    completionTime: undefined,
  };
  await setDoc(playerRef, player);
  return room;
}

export async function updateRoom(code: string, updates: Partial<Room>): Promise<void> {
  const roomRef = doc(firestore, "rooms", code);
  await updateDoc(roomRef, updates);
}

export async function updatePlayer(code: string, uid: string, updates: Partial<RoomPlayer>): Promise<void> {
  const playerRef = doc(firestore, "rooms", code, "players", uid);
  await updateDoc(playerRef, updates);
}

export function listenToRoom(code: string, onUpdate: (room: Room) => void) {
  return onSnapshot(doc(firestore, "rooms", code), (snap) => {
    if (snap.exists()) onUpdate({ ...snap.data() } as Room);
  });
}

export function listenToPlayers(code: string, onUpdate: (players: RoomPlayer[]) => void) {
  return onSnapshot(collection(firestore, "rooms", code, "players"), (snap) => {
    const players = snap.docs.map(d => d.data() as RoomPlayer);
    onUpdate(players);
  });
}
