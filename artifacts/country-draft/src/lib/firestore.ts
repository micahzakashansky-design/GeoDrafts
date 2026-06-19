import { where,
  collection, doc, getDoc, setDoc, addDoc, updateDoc,
  query, orderBy, limit, getDocs, serverTimestamp,
  onSnapshot, type Timestamp,
} from "firebase/firestore";
import { firestore } from "./firebase";

export type UserProfile = {
  uid: string;
  username: string;
  createdAt: Timestamp | null;
  bestScore: number;
  totalGames: number;
};

export type LeaderboardEntry = {
  id: string;
  uid: string;
  username: string;
  score: number;
  mode: string;
  roster: Record<string, string>;
  createdAt: Timestamp | null;
  date: string;
};

export type RoomStatus = "waiting" | "playing" | "finished";
export type RoomMode = "sabotage" | "party";

export type Room = {
  code: string;
  mode: RoomMode;
  difficulty: "easy" | "hard";
  hostId: string;
  status: RoomStatus;
  currentRound: number;
  poolSeed: number;
  createdAt: Timestamp | null;
};

export type RoomPlayer = {
  uid: string;
  username: string;
  score: number;
  roster: Record<string, string>;
  finishedRound: boolean;
  sabotageChoice: string | null;
  sabotageOptions: string[] | null;
};

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(firestore, "users", uid));
  if (!snap.exists()) return null;
  return { uid, ...snap.data() } as UserProfile;
}

export async function updateUsername(uid: string, username: string): Promise<void> {
  await updateDoc(doc(firestore, "users", uid), { username });
}

export async function checkUsernameExists(username: string): Promise<boolean> {
  const q = query(collection(firestore, "users"), where("username", "==", username), limit(1));
  const snap = await getDocs(q);
  return !snap.empty;
}

export async function createUserProfile(uid: string, username: string): Promise<UserProfile> {
  const profile = {
    username,
    createdAt: serverTimestamp(),
    bestScore: 0,
    totalGames: 0,
  };
  await setDoc(doc(firestore, "users", uid), profile);
  return { uid, ...profile, createdAt: null };
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
  roster: Record<string, string>
): Promise<string> {
  const today = new Date().toISOString().slice(0, 10);

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
      createdAt: serverTimestamp(),
      date: today,
    });
    updateUserStats(uid, score).catch(console.error);
    return dailyDocId;
  }

  const docRef = await addDoc(collection(firestore, "leaderboard"), {
    uid, username, score, mode, roster,
    createdAt: serverTimestamp(),
    date: today,
  });
  updateUserStats(uid, score).catch(console.error);
  return docRef.id;
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
  const today = new Date().toISOString().slice(0, 10);
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
  difficulty: "easy" | "hard"
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
