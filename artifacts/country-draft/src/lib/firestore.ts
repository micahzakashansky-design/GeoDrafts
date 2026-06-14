import {
  collection, doc, getDoc, setDoc, addDoc,
  query, orderBy, limit, getDocs, serverTimestamp,
  type Timestamp,
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

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(firestore, "users", uid));
  if (!snap.exists()) return null;
  return { uid, ...snap.data() } as UserProfile;
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
    await updateUserStats(uid, score);
    return dailyDocId;
  }

  const docRef = await addDoc(collection(firestore, "leaderboard"), {
    uid, username, score, mode, roster,
    createdAt: serverTimestamp(),
    date: today,
  });
  await updateUserStats(uid, score);
  return docRef.id;
}

export async function getTopScores(modeFilter?: string, topN = 10): Promise<LeaderboardEntry[]> {
  const snap = await getDocs(
    query(collection(firestore, "leaderboard"), orderBy("score", "desc"), limit(100))
  );
  const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as LeaderboardEntry));
  if (modeFilter && modeFilter !== "all") {
    return all.filter(e => e.mode === modeFilter).slice(0, topN);
  }
  return all.slice(0, topN);
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
