import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import {
  COUNTRIES, CATEGORIES, getCategoryKey, shuffleArray,
  type Country, type Category,
} from "@/data/countries";
import { useFirebaseAuth } from "@/lib/use-firebase-auth";
import { updatePlayer, listenToRoom, listenToPlayers, type Room, type RoomPlayer, updateRoom } from "@/lib/firestore";
import {
  CountryCard, GameOver, GameState, computeSizePopBonus, seededShuffle, dateStrToSeed,
  CATEGORY_ICONS, CATEGORY_WEIGHTS, BONUS_CATEGORIES, getCategoryStars, getPtsDisplay
} from "./GameShared";
import { Home, Globe as GlobeIcon, Users } from "lucide-react";

export default function PartyGame() {
  const [, navigate] = useLocation();
  const { firebaseUser } = useFirebaseAuth();

  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<RoomPlayer[]>([]);
  const roomCode = new URLSearchParams(window.location.search).get("room") || null;

  useEffect(() => {
    if (!roomCode) { navigate("/"); return; }
    const unsubRoom = listenToRoom(roomCode, setRoom);
    const unsubPlayers = listenToPlayers(roomCode, setPlayers);
    return () => { unsubRoom(); unsubPlayers(); };
  }, [roomCode, navigate]);

  const [state, setState] = useState<GameState>(() => {
    const isHardMode = localStorage.getItem("countryDraftHardMode") === "true";
    let pool = [...COUNTRIES];
    shuffleArray(pool);
    return {
      pool, currentCountry: null, selectionOptions: null, mysteryCountry: null, guesses: [],
      roster: {}, gameOver: false, wildcardUsed: false, isDailyMode: false,
      dailyDate: "", leaderboardSubmitted: false, mode: "party", isHardMode,
      roomCode: roomCode, poolSeed: 0
    };
  });

  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);
  const rosterRef = useRef<HTMLDivElement>(null);

  // Re-sync with pool when room changes
  useEffect(() => {
    if (room && room.poolSeed && room.status === "playing" && state.pool.length === COUNTRIES.length && !state.gameOver) {
       const seededPool = seededShuffle([...COUNTRIES], room.poolSeed);
       setState(prev => ({ ...prev, poolSeed: room.poolSeed!, pool: seededPool, currentCountry: seededPool.pop() || null }));
    }
  }, [room, state.pool.length, state.gameOver]);

  // Handle Party round progression
  useEffect(() => {
    if (!room || room.status !== "playing" || !firebaseUser || state.gameOver) return;

    const me = players.find(p => p.uid === firebaseUser.uid);
    if (!me) return;

    if (players.every(p => p.finishedRound) && me.finishedRound) {
       // Everyone finished, reveal next country
       updatePlayer(room.code, firebaseUser.uid, { finishedRound: false });

       setState(prev => {
          const pool = [...prev.pool];
          const nextCountry = pool.pop() || null;
          return { ...prev, pool, currentCountry: nextCountry };
       });
    }

  }, [room, players, firebaseUser, state.gameOver, state.pool]);


  const totalScore = useMemo(() => {
    return CATEGORIES.reduce((sum, cat) => {
      const country = state.roster[cat]; if (!country) return sum;
      if (BONUS_CATEGORIES.includes(cat)) return sum;
      const key = getCategoryKey(cat); const raw = country.stats[key].score; const weight = CATEGORY_WEIGHTS[cat] ?? 1.0;
      return sum + raw * weight;
    }, 0);
  }, [state.roster]);

  const bonus = useMemo(() => computeSizePopBonus(state.roster), [state.roster]);
  const finalScore = totalScore + bonus;

  const assignCountry = useCallback((category: Category) => {
    if (state.roster[category] || !roomCode || !firebaseUser) return;
    setState(prev => {
      if (!prev.currentCountry) return prev;
      const newRoster = { ...prev.roster, [category]: prev.currentCountry };
      const isGameOver = CATEGORIES.every(c => newRoster[c]);

      updatePlayer(roomCode, firebaseUser.uid, { finishedRound: true });

      return {
        ...prev, roster: newRoster, currentCountry: null,
        gameOver: isGameOver
      };
    });
    setHoveredCategory(null);
  }, [state.roster, roomCode, firebaseUser]);

  const doReset = useCallback(() => {
     navigate("/");
  }, [navigate]);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden font-sans">
      <header className="h-14 md:h-16 shrink-0 border-b border-border/50 bg-card/50 backdrop-blur-md px-4 md:px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-2 -ml-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"><Home className="w-5 h-5" /></button>
          <div className="h-4 w-px bg-border hidden md:block" />
          <h1 className="font-serif text-lg md:text-xl font-bold tracking-tight flex items-center gap-2"><GlobeIcon className="w-5 h-5 text-primary" />GeoDrafts - Party Mode</h1>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {room && room.status === "playing" && !state.gameOver && (
          <div className="hidden md:flex w-80 bg-card/30 border-r border-border/50 flex-col overflow-y-auto">
             <div className="p-5 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1"><h3 className="text-sm font-bold text-foreground">Your Roster</h3><span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{Object.keys(state.roster).length}/{CATEGORIES.length}</span></div>
                  <div className="space-y-1.5">
                    {Object.keys(state.roster).length === 0 ? (
                      <div className="py-6 text-center rounded-xl border border-dashed border-border/50 bg-secondary/10"><p className="text-xs text-muted-foreground font-medium">Select a category on the right<br/>to begin drafting.</p></div>
                    ) : (
                      CATEGORIES.filter(c => state.roster[c]).map(category => {
                        const assigned = state.roster[category]!; const catKey = getCategoryKey(category); const isBonus = BONUS_CATEGORIES.includes(category); const stars = getCategoryStars(category); const score = !isBonus ? assigned.stats[catKey].score : null;
                        return (
                          <div key={category} className="w-full rounded-lg border border-border/25 bg-muted/10 opacity-80 text-left transition-all">
                            <div className="px-3 py-2 flex items-center justify-between">
                              <div className="flex items-center gap-2 overflow-hidden"><span className="text-muted-foreground shrink-0">{CATEGORY_ICONS[category]}</span><div className="truncate"><div className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground truncate">{category}</div><div className="text-xs font-semibold text-foreground/80 truncate">{assigned.flag} {assigned.name}</div></div></div>
                              <div className="flex flex-col items-end gap-1 shrink-0"><span className="text-[9px] text-yellow-400/40">{stars}</span>{!isBonus && score !== null && (<span className="text-[10px] font-bold text-primary">{getPtsDisplay(score, category)}</span>)}</div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Draft Categories</p>
                  {CATEGORIES.map(category => {
                    const assigned = state.roster[category]; const isAssignable = !assigned && !!state.currentCountry && !state.gameOver; const stars = getCategoryStars(category);
                    return (
                      <button key={category} onClick={() => { if (isAssignable) assignCountry(category); }} onMouseEnter={() => setHoveredCategory(category)} onMouseLeave={() => setHoveredCategory(null)} disabled={!isAssignable} className={`w-full rounded-lg border text-left transition-all ${assigned ? "border-border/25 bg-muted/10 opacity-60" : isAssignable ? "border-primary/30 bg-secondary/30 hover:bg-secondary/60 hover:border-primary/60" : "border-border/10 bg-card/5 opacity-40"}`}>
                        <div className="px-3 py-2 flex items-center justify-between"><div className="flex items-center gap-2 overflow-hidden"><span className="text-muted-foreground shrink-0">{CATEGORY_ICONS[category]}</span><div className="truncate"><div className="text-[10px] font-bold uppercase tracking-tight text-muted-foreground truncate">{category}</div>{assigned && <div className="text-xs font-semibold text-foreground/80 truncate">{assigned.flag} {assigned.name}</div>}</div></div><span className="text-[9px] text-yellow-400/40 shrink-0">{stars}</span></div>
                      </button>
                    );
                  })}
                </div>
             </div>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-y-auto relative">
          {state.gameOver ? (
            <GameOver roster={state.roster} totalScore={finalScore} bonus={bonus} onReset={doReset} onDownload={() => {}} onWildcard={() => {}} onWildcardSelect={() => {}} setWildcardPhase={() => {}} wildcardUsed={false} wildcardPhase={false} rosterRef={rosterRef} isHardMode={state.isHardMode} isDailyMode={false} onSubmitLeaderboard={() => {}} gameMode="party" leaderboardSubmitted={state.leaderboardSubmitted} room={room} players={players} />
          ) : room && room.status === "waiting" ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center"><div className="p-4 rounded-3xl bg-primary/10 border border-primary/20 mb-4 animate-pulse"><Users className="w-12 h-12 text-primary" /></div><h2 className="text-3xl font-serif font-bold mb-2">Game Lobby</h2><p className="text-muted-foreground mb-8">Room Code: <span className="text-foreground font-bold tracking-widest">{room.code}</span></p><div className="w-full max-w-sm space-y-3 mb-8"><p className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-left">Players ({players.length})</p>{players.map(p => (<div key={p.uid} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border shadow-sm"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold text-lg">{p.username[0].toUpperCase()}</div><span className="font-semibold">{p.username}</span></div>{p.uid === room.hostId && <span className="text-[10px] bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full font-bold">HOST</span>}</div>))}</div>{firebaseUser?.uid === room.hostId ? (<button onClick={() => updateRoom(room.code, { status: "playing" })} className="px-12 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 shadow-xl">Start Match</button>) : (<p className="text-primary font-medium animate-pulse">Waiting for host to begin...</p>)}</div>
          ) : room && room.status === "playing" && players.find(p => p.uid === firebaseUser?.uid)?.finishedRound && !players.every(p => p.finishedRound) ? (
             <div className="flex-1 flex flex-col items-center justify-center p-6 text-center"><div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-6" /><h2 className="text-2xl font-serif font-bold mb-2">Waiting for others...</h2><p className="text-muted-foreground">The next country will be revealed once everyone finishes this round.</p></div>
          ) : state.currentCountry ? (
            <CountryCard country={state.currentCountry} hoveredCategory={hoveredCategory} poolRemaining={state.pool.length} isHardMode={state.isHardMode} roster={state.roster} onAssign={assignCountry} onHover={setHoveredCategory} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading game...</div>
          )}
        </div>
      </main>
    </div>
  );
}
