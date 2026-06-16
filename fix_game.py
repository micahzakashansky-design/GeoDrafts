import sys
import re

with open('artifacts/country-draft/src/lib/firestore.ts', 'r') as f:
    content = f.read()

# Add player count check in joinRoom
old_join = """  const room = roomSnap.data() as Room;
  if (room.status !== "waiting") throw new Error("Room already in progress");

  const playerRef = doc(firestore, "rooms", code, "players", uid);"""

new_join = """  const room = roomSnap.data() as Room;
  if (room.status !== "waiting") throw new Error("Room already in progress");

  // Get current players to check limit
  const playersSnap = await getDocs(collection(firestore, "rooms", code, "players"));
  if (room.mode === "sabotage" && playersSnap.size >= 2) throw new Error("Room is full (2 player limit)");

  const playerRef = doc(firestore, "rooms", code, "players", uid);"""

content = content.replace(old_join, new_join)

with open('artifacts/country-draft/src/lib/firestore.ts', 'w') as f:
    f.write(content)

with open('artifacts/country-draft/src/pages/Game.tsx', 'r') as f:
    content = f.read()

# Limit Party mode results to top 3
old_results = """  const sortedPlayers = useMemo(() => {
    if (!players) return [];
    return [...players].sort((a, b) => b.score - a.score);
  }, [players]);"""

new_results = """  const sortedPlayers = useMemo(() => {
    if (!players) return [];
    const sorted = [...players].sort((a, b) => b.score - a.score);
    return room?.mode === "party" ? sorted.slice(0, 3) : sorted;
  }, [players, room?.mode]);"""

content = content.replace(old_results, new_results)

with open('artifacts/country-draft/src/pages/Game.tsx', 'w') as f:
    f.write(content)
