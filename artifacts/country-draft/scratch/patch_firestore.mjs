import fs from 'fs';

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Update getTopScores
  const oldGetTopScores = `export async function getTopScores(modeFilter?: string, topN = 10): Promise<LeaderboardEntry[]> {
  const isAsc = modeFilter === "guess";
  const snap = await getDocs(
    query(collection(firestore, "leaderboard"), orderBy("score", isAsc ? "asc" : "desc"), limit(100))
  );
  const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as LeaderboardEntry));
  if (modeFilter && modeFilter !== "all") {
    return all.filter(e => e.mode === modeFilter).slice(0, topN);
  }
  return all.slice(0, topN);
}`;

  const newGetTopScores = `export async function getTopScores(modeFilter?: string, topN = 10): Promise<LeaderboardEntry[]> {
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
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as LeaderboardEntry));
}`;

  content = content.replace(oldGetTopScores, newGetTopScores);
  
  if (content.includes('import {') && !content.includes('where,')) {
    content = content.replace('import {', 'import { where,');
  }
  
  fs.writeFileSync(filePath, content);
}

patchFile('src/lib/firestore.ts');
